import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SafeStridePredictor:
    """
    SafeStride ML Model Predictor
    Loads and manages the trained XGBoost model for pedestrian accident risk prediction
    """
    
    def __init__(self, model_dir: str = "mlt"):
        self.model_dir = Path(model_dir)
        self.model = None
        self.label_encoder = None
        self.feature_names = None
        self.model_metrics = None
        self.loaded = False
        
    def load_models(self):
        """Load all required model artifacts"""
        try:
            # Load XGBoost model
            model_path = self.model_dir / "SafeStride_Optimized.joblib"
            self.model = joblib.load(model_path)
            logger.info(f"✓ Loaded model from {model_path}")
            
            # Load label encoder
            encoder_path = self.model_dir / "label_encoder.joblib"
            self.label_encoder = joblib.load(encoder_path)
            logger.info(f"✓ Loaded label encoder from {encoder_path}")
            
            # Load feature names
            features_path = self.model_dir / "feature_names.joblib"
            self.feature_names = joblib.load(features_path)
            logger.info(f"✓ Loaded {len(self.feature_names)} feature names")
            
            # Load model metrics
            metrics_path = self.model_dir / "model_metrics.joblib"
            self.model_metrics = joblib.load(metrics_path)
            logger.info(f"✓ Loaded model metrics")
            
            self.loaded = True
            logger.info("🎉 All models loaded successfully!")
            
        except Exception as e:
            logger.error(f"❌ Error loading models: {str(e)}")
            raise
    
    def predict(self, features_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Make prediction for a single input
        
        Args:
            features_df: DataFrame with preprocessed features
            
        Returns:
            Dictionary with prediction results
        """
        if not self.loaded:
            raise RuntimeError("Models not loaded. Call load_models() first.")
        
        try:
            # Make prediction
            prediction_encoded = self.model.predict(features_df)[0]
            prediction_proba = self.model.predict_proba(features_df)[0]
            
            # Check for NaN in prediction
            if pd.isna(prediction_encoded):
                raise ValueError("Model returned NaN prediction. Check input data for missing or invalid values.")
            
            # Decode prediction - convert to string if needed
            # Handle numeric predictions safely
            try:
                prediction_int = int(float(prediction_encoded))
            except (ValueError, OverflowError):
                logger.warning(f"Could not convert prediction {prediction_encoded} to int, using default")
                prediction_int = 2  # Default to Medium
            
            risk_level_decoded = self.label_encoder.inverse_transform([prediction_int])[0]
            
            # Convert to string and map numeric values to risk levels if needed
            if isinstance(risk_level_decoded, (int, float, np.integer, np.floating)):
                # If label encoder returns numbers, map them to risk levels
                risk_level_map = {1: "Low", 2: "Medium", 3: "High", 1.0: "Low", 2.0: "Medium", 3.0: "High"}
                risk_level = risk_level_map.get(risk_level_decoded, "Medium")
            else:
                risk_level = str(risk_level_decoded)
            
            # Get confidence score
            confidence = float(max(prediction_proba))
            
            # Calculate severity score (1-3 scale)
            severity_score = self._calculate_severity_score(risk_level, confidence)
            
            # Identify risk factors
            risk_factors = self._identify_risk_factors(features_df)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(risk_level, risk_factors)
            
            # Create proper prediction probabilities with string labels
            classes = self.label_encoder.classes_
            prediction_probabilities = {}
            risk_level_map = {1: "Low", 2: "Medium", 3: "High", 1.0: "Low", 2.0: "Medium", 3.0: "High"}
            
            for cls, prob in zip(classes, prediction_proba):
                # Skip NaN classes
                if pd.isna(cls):
                    continue
                    
                # Convert class to string label
                if isinstance(cls, (int, float, np.integer, np.floating)):
                    label = risk_level_map.get(cls, risk_level_map.get(int(cls), str(cls)))
                else:
                    label = str(cls)
                
                # Only add if probability is valid
                if not pd.isna(prob):
                    prediction_probabilities[label] = round(float(prob), 3)
            
            return {
                "risk_level": risk_level,
                "severity_score": round(severity_score, 2),
                "confidence": round(confidence, 3),
                "risk_factors": risk_factors,
                "recommendations": recommendations,
                "prediction_probabilities": prediction_probabilities
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise
    
    def batch_predict(self, features_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Make predictions for multiple inputs
        
        Args:
            features_df: DataFrame with preprocessed features for multiple samples
            
        Returns:
            List of prediction dictionaries
        """
        if not self.loaded:
            raise RuntimeError("Models not loaded. Call load_models() first.")
        
        results = []
        for idx in range(len(features_df)):
            single_sample = features_df.iloc[idx:idx+1]
            result = self.predict(single_sample)
            results.append(result)
        
        return results
    
    def _calculate_severity_score(self, risk_level: str, confidence: float) -> float:
        """Calculate severity score based on risk level and confidence"""
        severity_map = {
            "Low": 1.0,
            "Medium": 2.0,
            "High": 3.0
        }
        base_score = severity_map.get(risk_level, 2.0)
        # Adjust score based on confidence
        return base_score * confidence
    
    def _identify_risk_factors(self, features_df: pd.DataFrame) -> List[str]:
        """Identify key risk factors from the input features"""
        risk_factors = []
        
        # Get first row as dict
        features = features_df.iloc[0].to_dict()
        
        # Check for common risk factors
        # Time-based risks
        time_features = {k: v for k, v in features.items() if 'Time' in k and v == 1}
        if any('Night' in k or 'Evening' in k for k in time_features.keys()):
            risk_factors.append("Low visibility - night time")
        
        # Weather conditions
        weather_features = {k: v for k, v in features.items() if 'Weather' in k and v == 1}
        if any('Rain' in k or 'Fog' in k or 'Snow' in k for k in weather_features.keys()):
            risk_factors.append("Adverse weather conditions")
        
        # Light conditions
        light_features = {k: v for k, v in features.items() if 'Light' in k and v == 1}
        if any('Dark' in k for k in light_features.keys()):
            risk_factors.append("Poor lighting conditions")
        
        # Road conditions
        road_features = {k: v for k, v in features.items() if 'Road' in k and v == 1}
        if any('Wet' in k or 'Ice' in k for k in road_features.keys()):
            risk_factors.append("Poor road surface conditions")
        
        # Speed-related
        if 'Speed_limit' in features and features['Speed_limit'] > 40:
            risk_factors.append("High speed limit area")
        
        # Junction/crossing
        junction_features = {k: v for k, v in features.items() if 'Junction' in k and v == 1}
        if junction_features:
            risk_factors.append("Junction or crossing present")
        
        # Urban area with high vehicle count
        if 'Number_of_Vehicles' in features and features['Number_of_Vehicles'] > 2:
            risk_factors.append("Multiple vehicles involved")
        
        # If no specific factors found, add generic ones
        if not risk_factors:
            risk_factors.append("Normal traffic conditions")
        
        return risk_factors[:5]  # Return top 5 factors
    
    def _generate_recommendations(self, risk_level: str, risk_factors: List[str]) -> List[str]:
        """Generate safety recommendations based on risk level and factors"""
        recommendations = []
        
        if risk_level == "High":
            recommendations.extend([
                "⚠️ Avoid walking in this area if possible",
                "Use alternative routes with better lighting",
                "Consider using public transportation",
                "If walking is necessary, stay extremely alert"
            ])
        elif risk_level == "Medium":
            recommendations.extend([
                "⚡ Exercise caution when walking",
                "Use designated pedestrian crossings",
                "Wear reflective clothing if at night",
                "Stay on sidewalks and well-lit areas"
            ])
        else:  # Low
            recommendations.extend([
                "✓ Conditions are relatively safe",
                "Still follow traffic rules and signals",
                "Stay aware of your surroundings",
                "Use pedestrian crossings when available"
            ])
        
        # Add specific recommendations based on risk factors
        if "night time" in " ".join(risk_factors).lower():
            recommendations.append("Carry a flashlight or use phone light")
        
        if "weather" in " ".join(risk_factors).lower():
            recommendations.append("Wait for weather to improve if possible")
        
        if "speed limit" in " ".join(risk_factors).lower():
            recommendations.append("Extra caution - high-speed traffic area")
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def get_metrics(self) -> Dict[str, Any]:
        """Return model performance metrics"""
        if not self.loaded:
            raise RuntimeError("Models not loaded. Call load_models() first.")
        
        return self.model_metrics
    
    def health_check(self) -> Dict[str, Any]:
        """Check if model is loaded and ready"""
        return {
            "status": "healthy" if self.loaded else "not_ready",
            "model_loaded": self.model is not None,
            "encoder_loaded": self.label_encoder is not None,
            "features_count": len(self.feature_names) if self.feature_names else 0,
            "model_type": str(type(self.model).__name__) if self.model else None
        }


# Global predictor instance
predictor = SafeStridePredictor()
