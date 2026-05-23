"""
Wall Art Virtual Try-On - ML Service
FastAPI application providing AI/ML endpoints for room analysis,
wall segmentation, style matching, art generation, and lighting simulation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.routers import (
    segmentation,
    depth,
    style_match,
    art_generation,
    photo_to_art,
    lighting,
    recommendations,
    room_analysis,
)
from app.models.model_manager import ModelManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

model_manager = ModelManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models on startup, cleanup on shutdown."""
    logger.info("Loading ML models...")
    await model_manager.load_models()
    logger.info("All models loaded successfully")
    yield
    logger.info("Shutting down ML service...")
    await model_manager.cleanup()


app = FastAPI(
    title="Wall Art Try-On ML Service",
    description="AI/ML endpoints for room analysis, art generation, and style matching",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(room_analysis.router, tags=["Room Analysis"])
app.include_router(segmentation.router, tags=["Segmentation"])
app.include_router(depth.router, tags=["Depth Estimation"])
app.include_router(style_match.router, tags=["Style Matching"])
app.include_router(art_generation.router, tags=["Art Generation"])
app.include_router(photo_to_art.router, tags=["Photo to Art"])
app.include_router(lighting.router, tags=["Lighting"])
app.include_router(recommendations.router, tags=["Recommendations"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "models_loaded": model_manager.is_loaded,
        "device": model_manager.device,
    }


@app.get("/models/status")
async def model_status():
    """Get status of all loaded models."""
    return model_manager.get_status()
