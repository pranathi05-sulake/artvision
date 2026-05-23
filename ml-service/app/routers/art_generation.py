"""
Art Generation Router - Stable Diffusion XL for custom artwork creation.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import logging
from typing import List

from app.utils.image_utils import encode_image_to_base64
from app.models.model_manager import model_manager

logger = logging.getLogger(__name__)
router = APIRouter()

STYLE_PROMPTS = {
    "abstract_expressionism": "abstract expressionist painting, bold brushstrokes, vibrant colors, emotional",
    "watercolor": "delicate watercolor painting, soft washes, flowing colors, artistic",
    "oil_painting": "oil painting on canvas, rich textures, classical technique, detailed",
    "digital_art": "digital art, clean lines, modern aesthetic, high quality",
    "photography": "professional photography, high resolution, artistic composition",
    "line_art": "minimalist line art, black ink on white, elegant simplicity",
    "impressionism": "impressionist painting, light and color, loose brushwork, atmospheric",
    "pop_art": "pop art style, bold colors, graphic design, Andy Warhol inspired",
    "minimalist": "minimalist art, simple shapes, limited palette, clean composition",
    "geometric": "geometric abstract art, precise shapes, mathematical patterns",
    "botanical": "botanical illustration, detailed plants and flowers, scientific accuracy",
    "typography": "typographic art, creative lettering, artistic text composition",
}


class ArtGenerationRequest(BaseModel):
    prompt: str
    style: str = "abstract_expressionism"
    colors: List[str] = []
    width: int = 1024
    height: int = 1024
    num_variations: int = 4


class ArtGenerationResponse(BaseModel):
    images: List[str]  # base64 encoded images


@router.post("/generate-art", response_model=ArtGenerationResponse)
async def generate_art(request: ArtGenerationRequest):
    """
    Generate custom artwork using Stable Diffusion XL.
    Enhances prompt with style modifiers and color guidance.
    """
    try:
        sdxl = model_manager.sdxl

        if sdxl is None:
            return _fallback_generation(request.num_variations, request.width, request.height)

        # Build enhanced prompt
        enhanced_prompt = _build_prompt(request.prompt, request.style, request.colors)
        negative_prompt = (
            "blurry, low quality, distorted, deformed, ugly, "
            "watermark, text, signature, frame, border"
        )

        import torch

        images = []
        for i in range(request.num_variations):
            with torch.no_grad():
                result = sdxl(
                    prompt=enhanced_prompt,
                    negative_prompt=negative_prompt,
                    width=request.width,
                    height=request.height,
                    num_inference_steps=30,
                    guidance_scale=7.5,
                    generator=torch.Generator(device=model_manager.device).manual_seed(42 + i),
                )

            image = result.images[0]
            images.append(encode_image_to_base64(image))

        return ArtGenerationResponse(images=images)

    except Exception as e:
        logger.error(f"Art generation failed: {e}")
        return _fallback_generation(request.num_variations, request.width, request.height)


def _build_prompt(base_prompt: str, style: str, colors: List[str]) -> str:
    """Build an enhanced prompt with style and color guidance."""
    style_modifier = STYLE_PROMPTS.get(style, "")
    color_guidance = ""

    if colors:
        color_names = [_hex_to_name(c) for c in colors[:3]]
        color_guidance = f", color palette: {', '.join(color_names)}"

    enhanced = f"{base_prompt}, {style_modifier}{color_guidance}, masterpiece, best quality, wall art"
    return enhanced


def _hex_to_name(hex_color: str) -> str:
    """Convert hex color to approximate color name."""
    hex_color = hex_color.lstrip("#")
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)

    if r > 200 and g > 200 and b > 200:
        return "white"
    if r < 50 and g < 50 and b < 50:
        return "black"
    if r > g and r > b:
        if g > 150:
            return "orange"
        return "red"
    if g > r and g > b:
        return "green"
    if b > r and b > g:
        return "blue"
    if r > 200 and g > 200:
        return "yellow"
    if r > 150 and b > 150:
        return "purple"
    return "gray"


def _fallback_generation(num_variations: int, width: int, height: int) -> ArtGenerationResponse:
    """Generate placeholder images when SDXL is unavailable."""
    import numpy as np
    from PIL import Image

    images = []
    for i in range(num_variations):
        # Create a colorful gradient placeholder
        np.random.seed(42 + i)
        color1 = np.random.randint(50, 200, 3)
        color2 = np.random.randint(50, 200, 3)

        # Create gradient
        x = np.linspace(0, 1, width)
        y = np.linspace(0, 1, height)
        xx, yy = np.meshgrid(x, y)

        # Diagonal gradient between two colors
        t = (xx + yy) / 2
        img_array = np.zeros((height, width, 3), dtype=np.uint8)
        for c in range(3):
            img_array[:, :, c] = (color1[c] * (1 - t) + color2[c] * t).astype(np.uint8)

        img = Image.fromarray(img_array)
        images.append(encode_image_to_base64(img))

    return ArtGenerationResponse(images=images)
