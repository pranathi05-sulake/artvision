"""
Wall Segmentation Router - Interactive wall selection using SAM.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np
import logging

from app.utils.image_utils import decode_base64_image, encode_image_to_base64
from app.models.model_manager import model_manager

logger = logging.getLogger(__name__)
router = APIRouter()


class PointPrompt(BaseModel):
    x: float
    y: float


class SegmentWallRequest(BaseModel):
    room_image: str  # base64
    point_prompt: PointPrompt


class WallBounds(BaseModel):
    x: float
    y: float
    w: float
    h: float


class SegmentWallResponse(BaseModel):
    mask: str  # base64 encoded mask
    wall_bounds: WallBounds


@router.post("/segment-wall", response_model=SegmentWallResponse)
async def segment_wall(request: SegmentWallRequest):
    """
    Interactive wall segmentation - user clicks a point on the wall,
    SAM segments the wall region around that point.
    """
    try:
        image = decode_base64_image(request.room_image)
        image_np = np.array(image)

        sam = model_manager.sam
        if sam is None:
            # Return a fallback rectangular mask
            h, w = image_np.shape[:2]
            return _fallback_response(w, h)

        # Set image for SAM
        sam.set_image(image_np)

        # Use the clicked point as prompt
        input_point = np.array([[request.point_prompt.x, request.point_prompt.y]])
        input_label = np.array([1])  # 1 = foreground

        masks, scores, _ = sam.predict(
            point_coords=input_point,
            point_labels=input_label,
            multimask_output=True,
        )

        # Select best mask (highest score)
        best_idx = np.argmax(scores)
        best_mask = masks[best_idx]

        # Calculate bounding box of the mask
        rows = np.any(best_mask, axis=1)
        cols = np.any(best_mask, axis=0)
        rmin, rmax = np.where(rows)[0][[0, -1]]
        cmin, cmax = np.where(cols)[0][[0, -1]]

        # Encode mask as base64 image
        mask_uint8 = (best_mask * 255).astype(np.uint8)
        from PIL import Image
        mask_img = Image.fromarray(mask_uint8)
        mask_base64 = encode_image_to_base64(mask_img)

        return SegmentWallResponse(
            mask=mask_base64,
            wall_bounds=WallBounds(
                x=float(cmin),
                y=float(rmin),
                w=float(cmax - cmin),
                h=float(rmax - rmin),
            ),
        )

    except Exception as e:
        logger.error(f"Wall segmentation failed: {e}")
        h, w = 800, 1200  # Default dimensions
        return _fallback_response(w, h)


def _fallback_response(w: int, h: int) -> SegmentWallResponse:
    """Generate a fallback response when SAM is unavailable."""
    # Create a simple rectangular mask covering the center of the image
    margin_x = int(w * 0.15)
    margin_y = int(h * 0.2)

    mask = np.zeros((h, w), dtype=np.uint8)
    mask[margin_y : h - margin_y, margin_x : w - margin_x] = 255

    from PIL import Image
    mask_img = Image.fromarray(mask)
    mask_base64 = encode_image_to_base64(mask_img)

    return SegmentWallResponse(
        mask=mask_base64,
        wall_bounds=WallBounds(
            x=float(margin_x),
            y=float(margin_y),
            w=float(w - 2 * margin_x),
            h=float(h - 2 * margin_y),
        ),
    )
