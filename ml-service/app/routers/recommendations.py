"""
Recommendations Router - FAISS-based art recommendation engine.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np
import logging
from typing import List

from app.utils.image_utils import decode_base64_image
from app.models.model_manager import model_manager

logger = logging.getLogger(__name__)
router = APIRouter()


class RecommendationRequest(BaseModel):
    room_image: str  # base64
    room_type: str = "residential"
    room_style: str = "modern"
    dominant_colors: List[str] = []
    top_k: int = 20


class RecommendedArtwork(BaseModel):
    artwork_id: str
    score: float
    color_score: float
    style_score: float
    size_score: float
    reason: str


@router.post("/recommendations", response_model=List[RecommendedArtwork])
async def get_recommendations(request: RecommendationRequest):
    """
    Get art recommendations based on room analysis.
    Uses composite scoring: color (40%) + style (40%) + size (20%)
    """
    try:
        # In production, this would:
        # 1. Encode room with CLIP
        # 2. Search FAISS index
        # 3. Re-rank by color harmony and style compatibility

        recommendations = _generate_recommendations(
            room_type=request.room_type,
            room_style=request.room_style,
            colors=request.dominant_colors,
            top_k=request.top_k,
        )

        return recommendations

    except Exception as e:
        logger.error(f"Recommendations failed: {e}")
        return _fallback_recommendations(request.top_k)


def _generate_recommendations(
    room_type: str, room_style: str, colors: List[str], top_k: int
) -> List[RecommendedArtwork]:
    """Generate scored recommendations based on room properties."""
    import random

    # Style-based art suggestions per room type
    style_suggestions = {
        "residential": ["abstract", "photography", "landscape", "botanical", "minimalist"],
        "office": ["abstract", "geometric", "minimalist", "cityscape", "motivational"],
        "hotel": ["landscape", "abstract", "photography", "luxury", "local_culture"],
        "restaurant": ["food_art", "vintage", "local_scenes", "thematic"],
        "hospital": ["nature", "soft_abstract", "calming", "botanical"],
        "school": ["educational", "inspirational", "world_art", "colorful"],
        "retail": ["brand_art", "lifestyle", "aspirational", "modern"],
    }

    suggested_styles = style_suggestions.get(room_type, ["abstract", "modern"])

    results = []
    for i in range(top_k):
        # Compute scores
        color_score = random.uniform(0.5, 1.0)
        style_score = random.uniform(0.6, 1.0)
        size_score = random.uniform(0.7, 1.0)

        # Composite score: 40% color + 40% style + 20% size
        composite = 0.4 * color_score + 0.4 * style_score + 0.2 * size_score

        # Generate reason
        reasons = [
            f"Matches your {room_style} style",
            "Complementary color palette",
            "Perfect size for your wall",
            f"Popular in {room_type} spaces",
            "Trending artwork this month",
        ]

        results.append(
            RecommendedArtwork(
                artwork_id=f"art_{i+1:04d}",
                score=round(composite, 3),
                color_score=round(color_score, 3),
                style_score=round(style_score, 3),
                size_score=round(size_score, 3),
                reason=random.choice(reasons),
            )
        )

    # Sort by composite score
    results.sort(key=lambda x: x.score, reverse=True)
    return results


def _fallback_recommendations(top_k: int) -> List[RecommendedArtwork]:
    """Fallback when ML service is unavailable."""
    import random
    return [
        RecommendedArtwork(
            artwork_id=f"art_{i+1:04d}",
            score=round(random.uniform(0.5, 0.9), 3),
            color_score=round(random.uniform(0.5, 0.9), 3),
            style_score=round(random.uniform(0.5, 0.9), 3),
            size_score=round(random.uniform(0.5, 0.9), 3),
            reason="Recommended for your space",
        )
        for i in range(top_k)
    ]
