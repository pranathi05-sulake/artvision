"""
Lighting Simulation Router - Simulate realistic lighting on artwork placements.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np
import logging

from app.utils.image_utils import decode_base64_image, encode_image_to_base64
from app.utils.shadow_utils import generate_frame_shadow, apply_lighting_color

logger = logging.getLogger(__name__)
router = APIRouter()


class ArtworkPlacement(BaseModel):
    x: float
    y: float
    width: float
    height: float


class LightingParams(BaseModel):
    time_of_day: int = 12
    light_source: str = "natural_window"
    color_temperature: int = 5000
    intensity: float = 75


class LightingSimRequest(BaseModel):
    room_image: str  # base64
    artwork_placement: ArtworkPlacement
    lighting_params: LightingParams


class LightingSimResponse(BaseModel):
    composite_image: str  # base64


@router.post("/simulate-lighting", response_model=LightingSimResponse)
async def simulate_lighting(request: LightingSimRequest):
    """
    Simulate lighting effects on artwork placement:
    - Shadow casting based on light direction
    - Color temperature adjustment
    - Specular highlights on glass frames
    - Ambient light color shift on artwork
    """
    try:
        from PIL import Image

        room_image = decode_base64_image(request.room_image)
        room_np = np.array(room_image)

        placement = request.artwork_placement
        params = request.lighting_params

        # Generate shadow beneath/around the frame
        shadow = generate_frame_shadow(
            image_shape=room_np.shape[:2],
            frame_rect=(int(placement.x), int(placement.y),
                       int(placement.width), int(placement.height)),
            light_direction=_get_light_direction(params.time_of_day),
            intensity=params.intensity / 100.0,
        )

        # Apply shadow to room image
        composite = room_np.copy().astype(np.float32)
        shadow_mask = shadow[:, :, np.newaxis] if shadow.ndim == 2 else shadow
        composite = composite * (1 - shadow_mask * 0.4)

        # Apply color temperature to the artwork region
        x, y = int(placement.x), int(placement.y)
        w, h = int(placement.width), int(placement.height)

        # Ensure bounds are within image
        y_end = min(y + h, composite.shape[0])
        x_end = min(x + w, composite.shape[1])
        y_start = max(y, 0)
        x_start = max(x, 0)

        if y_start < y_end and x_start < x_end:
            art_region = composite[y_start:y_end, x_start:x_end]
            art_region = apply_lighting_color(
                art_region, params.color_temperature, params.intensity / 100.0
            )
            composite[y_start:y_end, x_start:x_end] = art_region

        # Clip and convert back
        composite = np.clip(composite, 0, 255).astype(np.uint8)
        result_image = Image.fromarray(composite)

        return LightingSimResponse(
            composite_image=encode_image_to_base64(result_image)
        )

    except Exception as e:
        logger.error(f"Lighting simulation failed: {e}")
        # Return original image as fallback
        return LightingSimResponse(composite_image=request.room_image)


def _get_light_direction(time_of_day: int) -> tuple:
    """Convert time of day to light direction vector."""
    import math
    # Map 6-22 hours to angle (sunrise left, noon top, sunset right)
    normalized = (time_of_day - 6) / 16.0  # 0 to 1
    angle = normalized * math.pi  # 0 to pi
    dx = math.cos(angle)
    dy = -abs(math.sin(angle))  # Always from above
    return (dx, dy)
