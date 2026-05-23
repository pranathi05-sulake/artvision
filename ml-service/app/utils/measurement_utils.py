"""
Measurement utility functions for real-world dimension calculations.
"""

import numpy as np
import math
from typing import Tuple, Dict


def pixels_to_cm(
    pixel_width: float,
    pixel_height: float,
    wall_width_cm: float,
    wall_height_cm: float,
    image_width: int,
    image_height: int,
) -> Tuple[float, float]:
    """
    Convert pixel dimensions to real-world centimeters.

    Args:
        pixel_width: Width in pixels on canvas
        pixel_height: Height in pixels on canvas
        wall_width_cm: Real wall width in cm
        wall_height_cm: Real wall height in cm
        image_width: Total image width in pixels
        image_height: Total image height in pixels

    Returns:
        (width_cm, height_cm) in real-world units
    """
    scale_x = wall_width_cm / image_width
    scale_y = wall_height_cm / image_height

    return (pixel_width * scale_x, pixel_height * scale_y)


def cm_to_inches(cm: float) -> float:
    """Convert centimeters to inches."""
    return cm / 2.54


def calculate_hanging_height(
    art_height_cm: float,
    space_type: str = "residential",
    ceiling_height_cm: float = 280,
) -> Dict[str, float]:
    """
    Calculate optimal hanging height for artwork.

    Standard: center of artwork at 57 inches (145 cm) from floor for residential.
    Commercial spaces vary by ceiling height.

    Returns dict with:
        - center_from_floor_cm: Center point height from floor
        - top_from_floor_cm: Top edge height from floor
        - nail_from_floor_cm: Nail/hook position from floor
    """
    if space_type == "residential":
        center_height = 145  # 57 inches standard
    elif space_type == "office":
        center_height = 150  # Slightly higher for standing
    elif space_type == "hotel":
        # Scale with ceiling height
        center_height = ceiling_height_cm * 0.52
    elif space_type in ("hospital", "school"):
        center_height = 140  # Lower for accessibility
    elif space_type == "retail":
        center_height = ceiling_height_cm * 0.55  # Higher for visibility
    else:
        center_height = 145

    top_from_floor = center_height + (art_height_cm / 2)
    # Nail is typically 2-3 cm below top of frame
    nail_from_floor = top_from_floor - 3

    return {
        "center_from_floor_cm": round(center_height, 1),
        "top_from_floor_cm": round(top_from_floor, 1),
        "nail_from_floor_cm": round(nail_from_floor, 1),
    }


def calculate_gallery_spacing(
    num_pieces: int,
    wall_width_cm: float,
    art_widths_cm: list,
    layout: str = "grid_symmetric",
) -> list:
    """
    Calculate positions for gallery wall layout.

    Args:
        num_pieces: Number of artworks
        wall_width_cm: Available wall width
        art_widths_cm: List of artwork widths
        layout: Layout template name

    Returns:
        List of (x_cm, y_cm) positions for each piece
    """
    spacing_cm = 6  # Standard 2-3 inches between frames

    if layout == "horizontal_row":
        total_art_width = sum(art_widths_cm)
        total_spacing = spacing_cm * (num_pieces - 1)
        start_x = (wall_width_cm - total_art_width - total_spacing) / 2

        positions = []
        current_x = start_x
        for width in art_widths_cm:
            positions.append((round(current_x, 1), 145))  # Center height
            current_x += width + spacing_cm

        return positions

    elif layout == "grid_symmetric":
        cols = math.ceil(math.sqrt(num_pieces))
        rows = math.ceil(num_pieces / cols)

        col_width = wall_width_cm / (cols + 1)
        row_height = 60  # Approximate art height + spacing

        positions = []
        for i in range(num_pieces):
            col = i % cols
            row = i // cols
            x = col_width * (col + 1)
            y = 120 + row * row_height  # Start from 120cm
            positions.append((round(x, 1), round(y, 1)))

        return positions

    else:
        # Default: evenly spaced horizontal
        spacing = wall_width_cm / (num_pieces + 1)
        return [(round(spacing * (i + 1), 1), 145) for i in range(num_pieces)]


def estimate_frame_weight(
    width_cm: float,
    height_cm: float,
    frame_material: str = "wood",
) -> Dict[str, str]:
    """
    Estimate frame weight and recommend appropriate hanging hardware.

    Returns:
        Dict with weight_kg, hook_type, and nail_type recommendations
    """
    # Approximate weight based on size and material
    area_m2 = (width_cm / 100) * (height_cm / 100)

    material_density = {
        "wood": 3.5,  # kg per m2
        "aluminum": 2.0,
        "steel": 4.0,
        "acrylic": 1.5,
        "bamboo": 2.5,
    }

    density = material_density.get(frame_material, 3.0)
    weight_kg = area_m2 * density

    # Recommend hardware
    if weight_kg < 2:
        hook_type = "Picture hook (small)"
        nail_type = "Single nail"
    elif weight_kg < 5:
        hook_type = "Picture hook (medium)"
        nail_type = "Wall anchor + screw"
    elif weight_kg < 10:
        hook_type = "Heavy-duty picture hook"
        nail_type = "Toggle bolt or wall anchor"
    else:
        hook_type = "French cleat system"
        nail_type = "Multiple wall anchors"

    return {
        "weight_kg": round(weight_kg, 2),
        "hook_type": hook_type,
        "nail_type": nail_type,
    }
