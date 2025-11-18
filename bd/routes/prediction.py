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
    """
    Input model for US Accidents binary prediction
    
    Requires geographic, weather, road, and temporal features
    """
    
    # Geographic features
    Start_Lat: float = Field(..., ge=-90, le=90, description="Latitude (-90 to 90)")
    Start_Lng: float = Field(..., ge=-180, le=180, description="Longitude (-180 to 180)")
    Distance_mi: float = Field(..., ge=0, alias="Distance(mi)", description="Accident extent in miles")
    
    # Weather features
    Temperature_F: float = Field(..., alias="Temperature(F)", description="Temperature in Fahrenheit")
    Humidity: float = Field(..., ge=0, le=100, alias="Humidity(%)", description="Humidity percentage")
    Pressure: float = Field(..., alias="Pressure(in)", description="Air pressure in inches")
    Visibility: float = Field(..., ge=0, alias="Visibility(mi)", description="Visibility in miles")
    Wind_Speed: float = Field(..., ge=0, alias="Wind_Speed(mph)", description="Wind speed in mph")
    Precipitation: float = Field(..., ge=0, alias="Precipitation(in)", description="Precipitation in inches")
    Weather_Condition: str = Field(..., description="Weather description (e.g., 'Fair', 'Heavy Rain', 'Fog')")
    
    # Road features (boolean: 0 or 1)
    Crossing: int = Field(..., ge=0, le=1, description="Pedestrian crossing present (0 or 1)")
    Junction: int = Field(..., ge=0, le=1, description="Junction present (0 or 1)")
    Traffic_Signal: int = Field(..., ge=0, le=1, description="Traffic signal present (0 or 1)")
    Stop: int = Field(..., ge=0, le=1, description="Stop sign present (0 or 1)")
    
    # Temporal features
    Hour: int = Field(..., ge=0, le=23, description="Hour of day (0-23)")
    Day_of_Week: int = Field(..., ge=0, le=6, description="Day of week (0=Monday, 6=Sunday)")
    Month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    Year: int = Field(..., ge=2016, le=2030, description="Year")
    
    # Location features
    City: str = Field(..., description="City name")
    State: str = Field(..., description="State code (e.g., 'CA', 'NY')")
    Street: str = Field(..., description="Street name")
    Sunrise_Sunset: str = Field(..., description="Day or Night")
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "Start_Lat": 39.7392,
                "Start_Lng": -104.9903,
                "Distance(mi)": 0.5,
                "Temperature(F)": 60.0,
                "Humidity(%)": 65.0,
                "Pressure(in)": 29.92,
                "Visibility(mi)": 10.0,
                "Wind_Speed(mph)": 5.0,
                "Precipitation(in)": 0.0,
                "Weather_Condition": "Fair",
                "Crossing": 0,
                "Junction": 0,
                "Traffic_Signal": 1,
                "Stop": 0,
                "Hour": 12,
                "Day_of_Week": 2,
                "Month": 6,
                "Year": 2024,
                "City": "Denver",
                "State": "CO",
                "Street": "Main St",
                "Sunrise_Sunset": "Day"
            }
        }


class PredictionResponse(BaseModel):
    """Response model for binary prediction"""
    success: bool
    prediction: str  # "High Risk" or "Low Risk"
    label: int  # 1 or 0
    probability: float  # Probability of predicted class
    raw_proba: List[float]  # [prob_low, prob_high]
    risk_factors: List[str]
    recommendations: List[str]


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
    Predict accident risk level (Binary: High Risk / Low Risk)
    
    Returns:
        - prediction: "High Risk" or "Low Risk"
        - label: 1 (High Risk) or 0 (Low Risk)
        - probability: Confidence of prediction
        - raw_proba: [prob_low, prob_high]
        - risk_factors: List of identified risk factors
        - recommendations: Safety recommendations
    """
    try:
        # Convert Pydantic model to dict
        input_dict = input_data.model_dump(by_alias=True)
        
        # Initialize preprocessor
        preprocessor = FeaturePreprocessor(predictor.feature_names)
        
        # Validate input
        is_valid, errors = preprocessor.validate_input(input_dict)
        if not is_valid:
            raise HTTPException(status_code=400, detail={"errors": errors})
        
        # Preprocess features (creates 43 features)
        features_df = preprocessor.preprocess(input_dict)
        
        # Make prediction (scaling happens inside predictor)
        result = predictor.predict(features_df)
        
        # Transform response
        response = {
            "success": True,
            "prediction": result["prediction"],
            "label": result["label"],
            "probability": result["probability"],
            "raw_proba": result["raw_proba"],
            "risk_factors": result.get("risk_factors", []),
            "recommendations": result.get("recommendations", [])
        }
        
        logger.info(f"Prediction: {response['prediction']} (prob: {response['probability']:.3f})")
        
        return response
        
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
            input_dict = input_data.model_dump(by_alias=True)
            
            # Validate input
            is_valid, errors = preprocessor.validate_input(input_dict)
            if not is_valid:
                raise HTTPException(status_code=400, detail={"errors": errors})
            
            # Preprocess and predict
            features_df = preprocessor.preprocess(input_dict)
            result = predictor.predict(features_df)
            
            # Transform response
            response = {
                "success": True,
                "prediction": result["prediction"],
                "label": result["label"],
                "probability": result["probability"],
                "raw_proba": result["raw_proba"],
                "risk_factors": result.get("risk_factors", []),
                "recommendations": result.get("recommendations", [])
            }
            results.append(response)
        
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
        - roc_auc: ROC-AUC score
        - Additional metrics from training
    """
    try:
        metrics = predictor.get_metrics()
        
        return {
            "metrics": metrics,
            "model_name": "US Accidents XGBoost Binary Classifier",
            "model_version": "20251118_162845",
            "dataset": "US Accidents (2016-2023)",
            "classes": ["Low Risk", "High Risk"]
        }
        
    except Exception as e:
        logger.error(f"Error retrieving metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve metrics: {str(e)}")


@router.get("/feature-template")
async def get_feature_template():
    """
    Get template of expected input features
    
    Returns:
        Template dictionary with all required features and default values
    """
    from utils.preprocessing import get_example_requests
    
    return {
        "required_features": get_default_features(),
        "description": "US Accidents binary model - predicts High Risk or Low Risk",
        "examples": get_example_requests(),
        "feature_count": 43,
        "input_features": 22
    }
