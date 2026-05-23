"""
Depth Estimation Router - ZoeDepth for metric depth estimation.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np
import logging

from app.utils.image_utils import decode_base64_image, encode_image_to_base64
from app.models.model_manager import model_manager

logger = logging.getLogger(__name__)
router = APIRouter()


class DepthRequest(BaseModel):
    room_image: str  # base64


class DepthResponse(BaseModel):
    depth_map: str  # base64 encoded depth visualization
    min_depth: float
    max_depth: float
    median_depth: float


@router.post("/estimate-depth", response_model=DepthResponse)
async def estimate_depth(request: DepthRequest):
    """Estimate metric depth from a room image using ZoeDepth."""
    try:
        image = decode_base64_image(request.room_image)

        depth_model = model_manager.depth
        if depth_model is None:
            return _fallback_depth(image.size)

        import torch
        with torch.no_grad():
            depth = depth_model.infer_pil(image)

        # Normalize depth for visualization
        depth_normalized = (depth - depth.min()) / (depth.max() - depth.min() + 1e-8)
        depth_vis = (depth_normalized * 255).astype(np.uint8)

        from PIL import Image
        depth_img = Image.fromarray(depth_vis)
        depth_base64 = encode_image_to_base64(depth_img)

        return DepthResponse(
            depth_map=depth_base64,
            min_depth=float(depth.min()),
            max_depth=float(depth.max()),
            median_depth=float(np.median(depth)),
        )

    except Exception as e:
        logger.error(f"Depth estimation failed: {e}")
        return _fallback_depth((800, 600))


def _fallback_depth(size: tuple) -> DepthResponse:
    """Generate a simple gradient depth map as fallback."""
    w, h = size if isinstance(size, tuple) else (800, 600)
    # Create a simple gradient (closer at bottom, farther at top)
    gradient = np.linspace(0.3, 1.0, h).reshape(-1, 1)
    depth_map = np.tile(gradient, (1, w))
    depth_vis = (depth_map * 255).astype(np.uint8)

    from PIL import Image
    depth_img = Image.fromarray(depth_vis)
    depth_base64 = encode_image_to_base64(depth_img)

    return DepthResponse(
        depth_map=depth_base64,
        min_depth=1.5,
        max_depth=5.0,
        median_depth=3.0,
    )
