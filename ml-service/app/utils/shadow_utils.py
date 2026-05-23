"""
Shadow and lighting utility functions.
"""

import numpy as np
from typing import Tuple


def generate_frame_shadow(
    image_shape: Tuple[int, int],
    frame_rect: Tuple[int, int, int, int],
    light_direction: Tuple[float, float] = (0.5, -0.8),
    intensity: float = 0.7,
    blur_radius: int = 15,
) -> np.ndarray:
    """
    Generate a realistic shadow for a frame on a wall.

    Args:
        image_shape: (height, width) of the output
        frame_rect: (x, y, width, height) of the frame
        light_direction: (dx, dy) normalized direction of light
        intensity: shadow darkness (0-1)
        blur_radius: shadow softness

    Returns:
        Shadow mask as float32 array (0 = no shadow, 1 = full shadow)
    """
    h, w = image_shape
    shadow = np.zeros((h, w), dtype=np.float32)

    fx, fy, fw, fh = frame_rect

    # Calculate shadow offset based on light direction
    shadow_offset_x = int(-light_direction[0] * 10)
    shadow_offset_y = int(-light_direction[1] * 10)

    # Draw shadow rectangle (offset from frame)
    sx = max(0, fx + shadow_offset_x)
    sy = max(0, fy + shadow_offset_y)
    sx_end = min(w, fx + fw + shadow_offset_x + 5)
    sy_end = min(h, fy + fh + shadow_offset_y + 5)

    if sx < sx_end and sy < sy_end:
        shadow[sy:sy_end, sx:sx_end] = intensity

    # Apply Gaussian blur for soft shadow edges
    shadow = _gaussian_blur(shadow, blur_radius)

    # Remove shadow from inside the frame area
    shadow[max(0, fy):min(h, fy + fh), max(0, fx):min(w, fx + fw)] = 0

    return shadow


def apply_lighting_color(
    region: np.ndarray,
    color_temperature: int,
    intensity: float,
) -> np.ndarray:
    """
    Apply color temperature shift to a region.

    Args:
        region: Image region as float32 array
        color_temperature: Kelvin (2700=warm, 6500=cool)
        intensity: Effect strength (0-1)

    Returns:
        Color-adjusted region
    """
    # Convert color temperature to RGB multipliers
    r_mult, g_mult, b_mult = _kelvin_to_rgb_multipliers(color_temperature)

    # Apply color shift
    result = region.copy()
    blend = intensity * 0.3  # Subtle effect

    result[:, :, 0] = result[:, :, 0] * (1 - blend) + result[:, :, 0] * r_mult * blend
    result[:, :, 1] = result[:, :, 1] * (1 - blend) + result[:, :, 1] * g_mult * blend
    result[:, :, 2] = result[:, :, 2] * (1 - blend) + result[:, :, 2] * b_mult * blend

    return np.clip(result, 0, 255)


def _kelvin_to_rgb_multipliers(kelvin: int) -> Tuple[float, float, float]:
    """Convert color temperature to RGB multipliers."""
    # Simplified Planckian locus approximation
    temp = kelvin / 100.0

    if temp <= 66:
        r = 1.0
        g = max(0, min(1, 0.39 * np.log(temp) - 0.63))
        if temp <= 19:
            b = 0.0
        else:
            b = max(0, min(1, 0.54 * np.log(temp - 10) - 1.19))
    else:
        r = max(0, min(1, 1.29 * ((temp - 60) ** -0.13)))
        g = max(0, min(1, 1.13 * ((temp - 60) ** -0.08)))
        b = 1.0

    return (r, g, b)


def _gaussian_blur(image: np.ndarray, radius: int) -> np.ndarray:
    """Apply Gaussian blur using scipy if available, else simple box blur."""
    try:
        from scipy.ndimage import gaussian_filter
        return gaussian_filter(image, sigma=radius / 3)
    except ImportError:
        # Simple box blur fallback
        kernel_size = radius * 2 + 1
        kernel = np.ones((kernel_size, kernel_size)) / (kernel_size * kernel_size)

        from scipy.signal import convolve2d
        return convolve2d(image, kernel, mode="same", boundary="fill")
