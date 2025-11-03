from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging

from models.predictor import predictor
from utils.preprocessing import FeaturePreprocessor, get_default_features

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["predictions"])


# Pydantic models for request/response validation
class PredictionInput(BaseModel):
    """Input model for prediction request"""
    # Location
    Latitude: Optional[float] = Field(default=51.5074, ge=-90, le=90, description="Latitude coordinate")
    Longitude: Optional[float] = Field(default=-0.1278, ge=-180, le=180, description="Longitude coordinate")
    
    # Time features
    Time: Any = Field(default="12:00", description="Time of day (HH:MM or minutes from midnight)")
    Day_of_Week: str = Field(default="Monday", description="Day of the week")
    
    # Weather and light conditions
    Weather_Conditions: Optional[str] = Field(default="Fine", description="Weather conditions")
    Light_Conditions: Optional[str] = Field(default="Daylight", description="Light conditions")
    
    # Road features
    Road_Type: Optional[str] = Field(default="Single carriageway", description="Type of road")
    Road_Surface_Conditions: Optional[str] = Field(default="Dry", description="Road surface condition")
    Speed_limit: Optional[int] = Field(default=30, ge=0, le=120, description="Speed limit in mph")
    
    # Junction
    Junction_Detail: Optional[str] = Field(default="Not at junction", description="Junction detail")
    Junction_Control: Optional[str] = Field(default="Not at junction", description="Junction control")
    
    # Area type
    Urban_or_Rural_Area: Optional[str] = Field(default="Urban", description="Urban or rural area")
    
    # Vehicles and casualties
    Number_of_Vehicles: Optional[int] = Field(default=1, ge=0, description="Number of vehicles involved")
    Number_of_Casualties: Optional[int] = Field(default=1, ge=0, description="Number of casualties")
    
    # Additional features
    Pedestrian_Crossing: Optional[str] = Field(default="No physical crossing", description="Pedestrian crossing type")
    Carriageway_Hazards: Optional[str] = Field(default="None", description="Carriageway hazards")
    
    class Config:
        json_schema_extra = {
            "example": {
                "Latitude": 51.5074,
                "Longitude": -0.1278,
                "Time": "18:30",
                "Day_of_Week": "Friday",
                "Weather_Conditions": "Raining",
                "Light_Conditions": "Darkness - lights lit",
                "Road_Type": "Single carriageway",
                "Road_Surface_Conditions": "Wet or damp",
                "Speed_limit": 30,
                "Junction_Detail": "T or staggered junction",
                "Junction_Control": "Give way or uncontrolled",
                "Urban_or_Rural_Area": "Urban",
                "Number_of_Vehicles": 2,
                "Number_of_Casualties": 1,
                "Pedestrian_Crossing": "Zebra crossing",
                "Carriageway_Hazards": "None"
            }
        }


class PredictionResponse(BaseModel):
    """Response model for prediction"""
    risk_level: str
    severity_score: float
    confidence: float
    risk_factors: List[str]
    recommendations: List[str]
    prediction_probabilities: Dict[str, float]


class BatchPredictionInput(BaseModel):
    """Input model for batch predictions"""
    predictions: List[PredictionInput]


class BatchPredictionResponse(BaseModel):
    """Response model for batch predictions"""
    results: List[PredictionResponse]
    total_predictions: int


@router.post("/predict", response_model=PredictionResponse)
async def predict_risk(input_data: PredictionInput):
    """
    Predict pedestrian accident risk level based on input parameters
    
    Returns:
        - risk_level: High, Medium, or Low
        - severity_score: Numerical severity (1-3)
        - confidence: Model confidence (0-1)
        - risk_factors: List of identified risk factors
        - recommendations: Safety recommendations
    """
    try:
        # Convert Pydantic model to dict
        input_dict = input_data.model_dump()
        
        # Initialize preprocessor
        preprocessor = FeaturePreprocessor(predictor.feature_names)
        
        # Validate input
        is_valid, errors = preprocessor.validate_input(input_dict)
        if not is_valid:
            raise HTTPException(status_code=400, detail={"errors": errors})
        
        # Preprocess features
        features_df = preprocessor.preprocess(input_dict)
        
        # Make prediction
        result = predictor.predict(features_df)
        
        logger.info(f"Prediction made: {result['risk_level']} (confidence: {result['confidence']})")
        
        return result
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/batch-predict", response_model=BatchPredictionResponse)
async def batch_predict_risk(batch_input: BatchPredictionInput):
    """
    Make predictions for multiple inputs at once
    
    Returns:
        - results: List of prediction results
        - total_predictions: Total number of predictions made
    """
    try:
        results = []
        preprocessor = FeaturePreprocessor(predictor.feature_names)
        
        for input_data in batch_input.predictions:
            input_dict = input_data.model_dump()
            
            # Validate input
            is_valid, errors = preprocessor.validate_input(input_dict)
            if not is_valid:
                raise HTTPException(status_code=400, detail={"errors": errors})
            
            # Preprocess and predict
            features_df = preprocessor.preprocess(input_dict)
            result = predictor.predict(features_df)
            results.append(result)
        
        logger.info(f"Batch prediction completed: {len(results)} predictions")
        
        return {
            "results": results,
            "total_predictions": len(results)
        }
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


@router.get("/health")
async def health_check():
    """
    Check API and model health status
    
    Returns:
        - status: API health status
        - model_status: Model loading status
        - details: Additional health information
    """
    try:
        health_info = predictor.health_check()
        
        return {
            "status": "healthy" if health_info["model_loaded"] else "degraded",
            "model_status": health_info,
            "api_version": "1.0.0",
            "message": "SafeStride API is running" if health_info["model_loaded"] else "Model not loaded"
        }
        
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@router.get("/metrics")
async def get_model_metrics():
    """
    Get model performance metrics
    
    Returns:
        - accuracy: Model accuracy
        - f1_score: F1 score
        - precision: Precision score
        - recall: Recall score
        - Additional metrics from training
    """
    try:
        metrics = predictor.get_metrics()
        
        return {
            "metrics": metrics,
            "model_name": "SafeStride XGBoost Optimized",
            "model_version": "1.0.0"
        }
        
    except Exception as e:
        logger.error(f"Error retrieving metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve metrics: {str(e)}")


@router.get("/feature-template")
async def get_feature_template():
    """
    Get template of expected input features
    
    Returns:
        Template dictionary with all expected features and default values
    """
    return {
        "template": get_default_features(),
        "description": "Use this template to understand the expected input format"
    }
