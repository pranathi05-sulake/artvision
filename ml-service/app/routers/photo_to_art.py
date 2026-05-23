"""
Photo to Art Router - Transform photos into artwork using style transfer.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np
import logging

from app.utils.image_utils import decode_base64_image, encode_image_to_base64
from app.models.model_manager import model_manager

logger = logging.getLogger(__name__)
router = APIRouter()


class PhotoToArtRequest(BaseModel):
    photo: str  # base64
    style: str = "oil_painting"
    strength: float = 0.7


class PhotoToArtResponse(BaseModel):
    image: str  # base64


@router.post("/photo-to-art", response_model=PhotoToArtResponse)
async def photo_to_art(request: PhotoToArtRequest):
    """
    Transform a photo into artwork using InstructPix2Pix or style transfer.
    Supports styles: oil_painting, watercolor, sketch, pop_art, impressionism.
    """
    try:
        image = decode_base64_image(request.photo)

        # In production, this would use InstructPix2Pix or a style transfer model
        # For now, apply a simple color transformation as demonstration
        result = _apply_style_filter(image, request.style, request.strength)

        return PhotoToArtResponse(image=encode_image_to_base64(result))

    except Exception as e:
        logger.error(f"Photo to art failed: {e}")
        # Return original image as fallback
        image = decode_base64_image(request.photo)
        return PhotoToArtResponse(image=encode_image_to_base64(image))


def _apply_style_filter(image, style: str, strength: float):
    """Apply a style filter to the image. Placeholder for full model inference."""
    from PIL import Image, ImageFilter, ImageEnhance
    import numpy as np

    img = image.copy()

    if style == "oil_painting":
        # Simulate oil painting with smoothing and saturation boost
        img = img.filter(ImageFilter.SMOOTH_MORE)
        img = img.filter(ImageFilter.SMOOTH_MORE)
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.3 * strength + 0.7)
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.2 * strength + 0.8)

    elif style == "watercolor":
        # Simulate watercolor with blur and reduced saturation
        img = img.filter(ImageFilter.GaussianBlur(radius=2))
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(0.8)
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.1)

    elif style == "sketch":
        # Convert to grayscale sketch-like
        img = img.convert("L")
        img = img.filter(ImageFilter.FIND_EDGES)
        from PIL import ImageOps
        img = ImageOps.invert(img)
        img = img.convert("RGB")

    elif style == "pop_art":
        # High contrast, saturated colors
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(2.0 * strength)
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.5 * strength)
        # Posterize
        img_array = np.array(img)
        img_array = (img_array // 64) * 64
        img = Image.fromarray(img_array)

    elif style == "impressionism":
        # Soft, dreamy effect
        img = img.filter(ImageFilter.GaussianBlur(radius=1))
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.4 * strength + 0.6)
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.05)

    return img
