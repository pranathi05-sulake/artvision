"""
Image utility functions for encoding/decoding and processing.
"""

import base64
import io
import numpy as np
from PIL import Image
from typing import Union


def decode_base64_image(base64_string: str) -> Image.Image:
    """Decode a base64 string to a PIL Image."""
    # Handle data URL prefix if present
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]

    image_bytes = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB if necessary
    if image.mode != "RGB":
        image = image.convert("RGB")

    return image


def encode_image_to_base64(image: Union[Image.Image, np.ndarray], format: str = "PNG") -> str:
    """Encode a PIL Image or numpy array to base64 string."""
    if isinstance(image, np.ndarray):
        image = Image.fromarray(image.astype(np.uint8))

    buffer = io.BytesIO()
    image.save(buffer, format=format, quality=90)
    buffer.seek(0)

    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def resize_image(image: Image.Image, max_size: int = 1024) -> Image.Image:
    """Resize image maintaining aspect ratio, max dimension = max_size."""
    w, h = image.size
    if max(w, h) <= max_size:
        return image

    if w > h:
        new_w = max_size
        new_h = int(h * max_size / w)
    else:
        new_h = max_size
        new_w = int(w * max_size / h)

    return image.resize((new_w, new_h), Image.LANCZOS)


def crop_to_aspect_ratio(image: Image.Image, target_ratio: float) -> Image.Image:
    """Crop image to target aspect ratio (width/height)."""
    w, h = image.size
    current_ratio = w / h

    if current_ratio > target_ratio:
        # Too wide, crop width
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        image = image.crop((left, 0, left + new_w, h))
    elif current_ratio < target_ratio:
        # Too tall, crop height
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        image = image.crop((0, top, w, top + new_h))

    return image
