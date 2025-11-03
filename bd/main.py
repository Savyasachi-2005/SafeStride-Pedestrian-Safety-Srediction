from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys

from models.predictor import predictor
from routes.prediction import router as prediction_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="SafeStride API",
    description="Pedestrian Accident Risk Prediction API using XGBoost ML Model",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Load ML models on application startup"""
    try:
        logger.info("🚀 Starting SafeStride API...")
        logger.info("📦 Loading ML models...")
        predictor.load_models()
        logger.info("✅ SafeStride API is ready!")
    except Exception as e:
        logger.error(f"❌ Failed to load models: {str(e)}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("👋 Shutting down SafeStride API...")


# Include routers
app.include_router(prediction_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to SafeStride API",
        "description": "Pedestrian Accident Risk Prediction System",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/api/predict",
            "batch_predict": "/api/batch-predict",
            "health": "/api/health",
            "metrics": "/api/metrics",
            "docs": "/docs"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
