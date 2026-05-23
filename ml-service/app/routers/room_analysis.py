"""
Room Analysis Router - Combines wall detection, depth estimation,
style classification, and color extraction into a single endpoint.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
import base64
import logging
from typing import List

from app.utils.image_utils import decode_base64_image, encode_image_to_base64
from app.models.model_manager import model_manager

logger = logging.getLogger(__name__)
router = APIRouter()


class RoomAnalysisRequest(BaseModel):
    room_image: str  # base64 encoded image


class LightingInfo(BaseModel):
    direction: str
    intensity: float
    color_temp: int


class WallDimensions(BaseModel):
    width_cm: float
    height_cm: float


class RoomAnalysisResponse(BaseModel):
    wall_masks: List[str]  # base64 encoded masks
    depth_map: str  # base64 encoded depth map
    room_type: str
    room_style: str
    dominant_colors: List[str]  # hex colors
    lighting: LightingInfo
    wall_dimensions: WallDimensions


@router.post("/analyze-room", response_model=RoomAnalysisResponse)
async def analyze_room(request: RoomAnalysisRequest):
    """
    Comprehensive room analysis pipeline:
    1. SAM wall segmentation
    2. ZoeDepth depth estimation
    3. BLIP-2 room type/style classification
    4. K-means color extraction
    5. Lighting direction estimation
    6. Wall dimension calculation
    """
    try:
        # Decode input image
        image = decode_base64_image(request.room_image)
        image_np = np.array(image)

        # Step 1: Wall segmentation using SAM
        wall_masks = await _segment_walls(image_np)

        # Step 2: Depth estimation
        depth_map = await _estimate_depth(image)

        # Step 3: Room classification
        room_type, room_style = await _classify_room(image)

        # Step 4: Extract dominant colors
        dominant_colors = _extract_colors(image_np)

        # Step 5: Estimate lighting
        lighting = _estimate_lighting(image_np)

        # Step 6: Calculate wall dimensions from depth
        wall_dimensions = _calculate_dimensions(depth_map, image_np.shape)

        return RoomAnalysisResponse(
            wall_masks=wall_masks,
            depth_map=encode_image_to_base64(depth_map) if depth_map is not None else "",
            room_type=room_type,
            room_style=room_style,
            dominant_colors=dominant_colors,
            lighting=lighting,
            wall_dimensions=wall_dimensions,
        )

    except Exception as e:
        logger.error(f"Room analysis failed: {e}")
        # Return fallback response instead of failing
        return RoomAnalysisResponse(
            wall_masks=[],
            depth_map="",
            room_type="living_room",
            room_style="modern",
            dominant_colors=["#FFFFFF", "#E5E5E5", "#808080", "#404040", "#1A1A1A"],
            lighting=LightingInfo(direction="left", intensity=0.7, color_temp=5000),
            wall_dimensions=WallDimensions(width_cm=400, height_cm=280),
        )


async def _segment_walls(image_np: np.ndarray) -> List[str]:
    """Segment walls using SAM model."""
    try:
        sam = model_manager.sam
        if sam is None:
            logger.warning("SAM not available, returning empty masks")
            return []

        sam.set_image(image_np)

        # Use center point as prompt for wall detection
        h, w = image_np.shape[:2]
        input_point = np.array([[w // 2, h // 2]])
        input_label = np.array([1])

        masks, scores, _ = sam.predict(
            point_coords=input_point,
            point_labels=input_label,
            multimask_output=True,
        )

        # Return top mask as base64
        encoded_masks = []
        for mask in masks[:1]:  # Top mask only
            mask_uint8 = (mask * 255).astype(np.uint8)
            from PIL import Image
            mask_img = Image.fromarray(mask_uint8)
            encoded_masks.append(encode_image_to_base64(mask_img))

        return encoded_masks

    except Exception as e:
        logger.warning(f"Wall segmentation failed: {e}")
        return []


async def _estimate_depth(image) -> np.ndarray:
    """Estimate depth using ZoeDepth."""
    try:
        depth_model = model_manager.depth
        if depth_model is None:
            return None

        import torch
        with torch.no_grad():
            depth = depth_model.infer_pil(image)

        return depth

    except Exception as e:
        logger.warning(f"Depth estimation failed: {e}")
        return None


async def _classify_room(image) -> tuple:
    """Classify room type and style using BLIP-2."""
    try:
        blip2_model, blip2_processor = model_manager.blip2
        if blip2_model is None:
            return "living_room", "modern"

        import torch

        # Room type classification
        prompt = "Question: What type of room is this? Answer:"
        inputs = blip2_processor(images=image, text=prompt, return_tensors="pt").to(
            model_manager.device
        )

        with torch.no_grad():
            generated_ids = blip2_model.generate(**inputs, max_new_tokens=20)
            room_type_text = blip2_processor.batch_decode(
                generated_ids, skip_special_tokens=True
            )[0].strip().lower()

        # Style classification
        prompt = "Question: What interior design style is this room? Answer:"
        inputs = blip2_processor(images=image, text=prompt, return_tensors="pt").to(
            model_manager.device
        )

        with torch.no_grad():
            generated_ids = blip2_model.generate(**inputs, max_new_tokens=20)
            room_style_text = blip2_processor.batch_decode(
                generated_ids, skip_special_tokens=True
            )[0].strip().lower()

        # Map to standard categories
        room_type = _map_room_type(room_type_text)
        room_style = _map_room_style(room_style_text)

        return room_type, room_style

    except Exception as e:
        logger.warning(f"Room classification failed: {e}")
        return "living_room", "modern"


def _extract_colors(image_np: np.ndarray, n_colors: int = 5) -> List[str]:
    """Extract dominant colors using K-means clustering."""
    try:
        from sklearn.cluster import KMeans

        # Resize for faster processing
        from PIL import Image
        img = Image.fromarray(image_np)
        img = img.resize((150, 150))
        pixels = np.array(img).reshape(-1, 3)

        # K-means clustering
        kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
        kmeans.fit(pixels)

        # Convert to hex colors, sorted by frequency
        colors = kmeans.cluster_centers_.astype(int)
        labels = kmeans.labels_
        counts = np.bincount(labels)
        sorted_indices = np.argsort(-counts)

        hex_colors = []
        for idx in sorted_indices:
            r, g, b = colors[idx]
            hex_colors.append(f"#{r:02x}{g:02x}{b:02x}")

        return hex_colors

    except Exception as e:
        logger.warning(f"Color extraction failed: {e}")
        return ["#FFFFFF", "#E5E5E5", "#808080", "#404040", "#1A1A1A"]


def _estimate_lighting(image_np: np.ndarray) -> LightingInfo:
    """Estimate lighting direction and properties from image."""
    try:
        # Simple gradient-based lighting estimation
        gray = np.mean(image_np, axis=2)

        # Determine direction from brightness gradient
        left_brightness = np.mean(gray[:, : gray.shape[1] // 2])
        right_brightness = np.mean(gray[:, gray.shape[1] // 2 :])
        top_brightness = np.mean(gray[: gray.shape[0] // 2, :])
        bottom_brightness = np.mean(gray[gray.shape[0] // 2 :, :])

        if left_brightness > right_brightness:
            direction = "left"
        else:
            direction = "right"

        if top_brightness > bottom_brightness + 20:
            direction = "top_" + direction

        # Estimate intensity (0-1)
        intensity = float(np.mean(gray) / 255.0)

        # Estimate color temperature from average color
        avg_color = np.mean(image_np, axis=(0, 1))
        r, g, b = avg_color
        if r > b + 20:
            color_temp = 3000  # Warm
        elif b > r + 20:
            color_temp = 6000  # Cool
        else:
            color_temp = 5000  # Neutral

        return LightingInfo(
            direction=direction, intensity=round(intensity, 2), color_temp=int(color_temp)
        )

    except Exception as e:
        logger.warning(f"Lighting estimation failed: {e}")
        return LightingInfo(direction="left", intensity=0.7, color_temp=5000)


def _calculate_dimensions(depth_map, image_shape: tuple) -> WallDimensions:
    """Calculate real-world wall dimensions from depth map."""
    try:
        if depth_map is None:
            # Default dimensions for a typical room
            return WallDimensions(width_cm=400, height_cm=280)

        # Use median depth to estimate distance to wall
        median_depth = float(np.median(depth_map))

        # Approximate dimensions using pinhole camera model
        # Assuming typical FOV of 60 degrees
        import math
        fov_rad = math.radians(60)
        h, w = image_shape[:2]

        width_cm = 2 * median_depth * math.tan(fov_rad / 2) * 100
        height_cm = width_cm * (h / w)

        return WallDimensions(
            width_cm=round(width_cm, 1), height_cm=round(height_cm, 1)
        )

    except Exception as e:
        logger.warning(f"Dimension calculation failed: {e}")
        return WallDimensions(width_cm=400, height_cm=280)


def _map_room_type(text: str) -> str:
    """Map free-text room description to standard category."""
    text = text.lower()
    mappings = {
        "living": "living_room",
        "bedroom": "bedroom",
        "kitchen": "kitchen",
        "bathroom": "bathroom",
        "office": "office",
        "dining": "dining_room",
        "hallway": "hallway",
        "studio": "studio",
    }
    for key, value in mappings.items():
        if key in text:
            return value
    return "living_room"


def _map_room_style(text: str) -> str:
    """Map free-text style description to standard category."""
    text = text.lower()
    styles = [
        "minimalist", "scandinavian", "modern", "industrial",
        "bohemian", "traditional", "coastal", "rustic",
        "eclectic", "contemporary", "mid-century",
    ]
    for style in styles:
        if style in text:
            return style
    return "modern"
