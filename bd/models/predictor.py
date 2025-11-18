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
    SafeStride ML Model Predictor - US Accidents Binary Classification
    Loads and manages the trained XGBoost model for accident risk prediction
    
    Model expects 4 joblib files:
    - US_Accidents_Predictor_Model_*.joblib: XGBoost trained model (binary classification)
    - US_Accidents_Scaler_*.joblib: StandardScaler for feature scaling
    - US_Accidents_Features_*.joblib: List of 43 feature names in training order
    - US_Accidents_Metadata_*.joblib: Model performance metrics
    """
    
    def __init__(self, model_dir: str = "MLT/ml"):
        self.model_dir = Path(model_dir)
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.model_metadata = None
        self.loaded = False
        
    def load_models(self):
        """Load all required model artifacts"""
        try:
            timestamp = "20251118_162845"
            
            # Load XGBoost model
            model_path = self.model_dir / f"US_Accidents_Predictor_Model_{timestamp}.joblib"
            self.model = joblib.load(model_path)
            logger.info(f"✓ Loaded model from {model_path}")
            
            # Load scaler
            scaler_path = self.model_dir / f"US_Accidents_Scaler_{timestamp}.joblib"
            self.scaler = joblib.load(scaler_path)
            logger.info(f"✓ Loaded scaler from {scaler_path}")
            
            # Load feature names
            features_path = self.model_dir / f"US_Accidents_Features_{timestamp}.joblib"
            self.feature_names = joblib.load(features_path)
            logger.info(f"✓ Loaded {len(self.feature_names)} feature names")
            
            # Load model metadata
            metadata_path = self.model_dir / f"US_Accidents_Metadata_{timestamp}.joblib"
            self.model_metadata = joblib.load(metadata_path)
            logger.info(f"✓ Loaded model metadata")
            
            self.loaded = True
            logger.info("🎉 All models loaded successfully!")
            logger.info(f"   Model type: {type(self.model).__name__}")
            logger.info(f"   Feature count: {len(self.feature_names)}")
            logger.info(f"   Binary Classification: Low Risk (0) / High Risk (1)")
            
        except Exception as e:
            logger.error(f"❌ Error loading models: {str(e)}")
            raise
    
    def predict(self, features_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Make binary prediction for a single input
        
        Args:
            features_df: DataFrame with preprocessed and scaled features (43 features)
            
        Returns:
            Dictionary with prediction results:
            - prediction: "High Risk" or "Low Risk"
            - label: 1 (High Risk) or 0 (Low Risk)
            - probability: Probability of predicted class
            - raw_proba: [prob_low, prob_high]
        """
        if not self.loaded:
            raise RuntimeError("Models not loaded. Call load_models() first.")
        
        try:
            # Scale features
            features_scaled = self.scaler.transform(features_df)
            
            # Make prediction (returns 0 or 1)
            prediction_label = int(self.model.predict(features_scaled)[0])
            
            # Get probabilities [prob_low_risk, prob_high_risk]
            prediction_proba = self.model.predict_proba(features_scaled)[0]
            prob_low = float(prediction_proba[0])
            prob_high = float(prediction_proba[1])
            
            # Map to risk level
            risk_level = "High Risk" if prediction_label == 1 else "Low Risk"
            confidence = prob_high if prediction_label == 1 else prob_low
            
            # Identify risk factors
            risk_factors = self._identify_risk_factors(features_df)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(risk_level, risk_factors)
            
            return {
                "prediction": risk_level,
                "label": prediction_label,
                "probability": round(confidence, 4),
                "raw_proba": [round(prob_low, 4), round(prob_high, 4)],
                "risk_factors": risk_factors,
                "recommendations": recommendations
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
    
    def _identify_risk_factors(self, features_df: pd.DataFrame) -> List[str]:
        """Identify key risk factors from the input features (US Accidents model)"""
        risk_factors = []
        
        # Get first row as dict
        features = features_df.iloc[0].to_dict()
        
        # Check highway (most important feature)
        if features.get('Is_Highway', 0) == 1:
            risk_factors.append("⚠️ Highway location - higher speed traffic")
        
        # Check traffic signals
        if features.get('Traffic_Signal', 0) == 1:
            risk_factors.append("🚦 Traffic signal intersection")
        
        # Check stop signs
        if features.get('Stop', 0) == 1:
            risk_factors.append("🛑 Stop sign intersection")
        
        # Check crossings
        if features.get('Crossing', 0) == 1:
            risk_factors.append("🚸 Pedestrian crossing present")
        
        # Check junctions
        if features.get('Junction', 0) == 1:
            risk_factors.append("🔀 Junction/intersection area")
        
        # Check time-based risks
        if features.get('Is_Night', 0) == 1:
            risk_factors.append("🌙 Night time - reduced visibility")
        elif features.get('Is_Rush_Hour', 0) == 1:
            risk_factors.append("⏰ Rush hour - heavy traffic")
        
        # Check weather
        if features.get('Freezing_Rain', 0) == 1 or features.get('Night_Low_Visibility', 0) == 1:
            risk_factors.append("🌧️ Hazardous weather conditions")
        
        # Check weekend
        if features.get('Is_Weekend', 0) == 1:
            risk_factors.append("📅 Weekend - traffic patterns may vary")
        
        # Check distance (longer accidents are more severe)
        distance = features.get('Distance(mi)', 0)
        if distance > 1:
            risk_factors.append(f"📏 Extended accident zone ({distance:.1f} miles)")
        
        # If no specific factors found, add generic ones
        if not risk_factors:
            risk_factors.append("Standard traffic conditions")
        
        return risk_factors[:5]  # Return top 5 factors
    
    def _generate_recommendations(self, risk_level: str, risk_factors: List[str]) -> List[str]:
        """Generate safety recommendations based on risk level and factors"""
        recommendations = []
        
        if risk_level == "High Risk":
            recommendations.extend([
                "⚠️ HIGH RISK: Avoid this location if possible",
                "🚗 Consider alternative routes",
                "🚨 Exercise extreme caution if travel is necessary",
                "👀 Maintain maximum alertness"
            ])
        else:  # Low Risk
            recommendations.extend([
                "✅ Conditions indicate lower accident risk",
                "🚸 Still follow all traffic rules and signals",
                "👁️ Stay aware of surroundings",
                "🛣️ Use designated crossings when available"
            ])
        
        # Add specific recommendations based on risk factors
        risk_text = " ".join(risk_factors).lower()
        
        if "night" in risk_text or "visibility" in risk_text:
            recommendations.append("💡 Use reflective clothing or lights")
        
        if "highway" in risk_text:
            recommendations.append("🛣️ Avoid walking on highways - use alternative routes")
        
        if "weather" in risk_text or "rain" in risk_text:
            recommendations.append("☔ Wait for weather conditions to improve if possible")
        
        if "rush hour" in risk_text:
            recommendations.append("⏰ Consider traveling outside peak hours")
        
        if "weekend" in risk_text:
            recommendations.append("🚗 Be aware of potentially unpredictable traffic patterns")
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def get_metrics(self) -> Dict[str, Any]:
        """Return model performance metrics"""
        if not self.loaded:
            raise RuntimeError("Models not loaded. Call load_models() first.")
        
        return self.model_metadata
    
    def health_check(self) -> Dict[str, Any]:
        """Check if model is loaded and ready"""
        return {
            "status": "healthy" if self.loaded else "not_ready",
            "model_loaded": self.model is not None,
            "scaler_loaded": self.scaler is not None,
            "features_count": len(self.feature_names) if self.feature_names else 0,
            "model_type": str(type(self.model).__name__) if self.model else None
        }


# Global predictor instance
predictor = SafeStridePredictor()
