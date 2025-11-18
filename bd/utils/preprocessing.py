"""
SafeStride Feature Preprocessing Module - US Accidents Model

This module handles the feature engineering pipeline for the US Accidents binary model.
It takes raw input features and generates the 43 features needed for prediction.

REQUIRED INPUT FEATURES:
Geographic:
- Start_Lat (float): Latitude
- Start_Lng (float): Longitude
- Distance(mi) (float): Length of the road extent affected by the accident

Weather:
- Temperature(F) (float): Temperature in Fahrenheit
- Humidity(%) (float): Humidity percentage
- Pressure(in) (float): Air pressure in inches
- Visibility(mi) (float): Visibility in miles
- Wind_Speed(mph) (float): Wind speed in mph
- Precipitation(in) (float): Precipitation amount in inches
- Weather_Condition (str): Weather description

Road Features:
- Crossing (bool/int): 0 or 1
- Junction (bool/int): 0 or 1
- Traffic_Signal (bool/int): 0 or 1
- Stop (bool/int): 0 or 1

Temporal:
- Hour (int): 0-23
- Day_of_Week (int): 0-6
- Month (int): 1-12
- Year (int): e.g., 2024

Additional:
- City (str): City name
- State (str): State code
- Street (str): Street name
- Sunrise_Sunset (str): "Day" or "Night"
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class FeaturePreprocessor:
    """
    Preprocesses input features to match the format expected by the US Accidents model
    
    Creates 43 features matching the trained model's expectations
    """
    
    def __init__(self, feature_names: List[str]):
        """
        Initialize preprocessor with expected feature names from training
        
        Args:
            feature_names: List of 43 feature names in the exact order used during training
        """
        self.feature_names = feature_names
    
    def preprocess(self, input_data: Dict[str, Any]) -> pd.DataFrame:
        """
        Preprocess raw input data into model-ready features
        
        Args:
            input_data: Dictionary with raw input features
            
        Returns:
            DataFrame with 43 features matching training format
        """
        try:
            logger.info("Starting US Accidents feature preprocessing...")
            
            # Create initial dataframe
            df = pd.DataFrame([input_data])
            
            # ===== NUMERIC FEATURES (9) =====
            numeric_features = [
                'Start_Lat', 'Start_Lng', 'Distance(mi)',
                'Temperature(F)', 'Humidity(%)', 'Pressure(in)',
                'Visibility(mi)', 'Wind_Speed(mph)', 'Precipitation(in)'
            ]
            
            for feat in numeric_features:
                if feat not in df.columns:
                    df[feat] = 0.0
                df[feat] = pd.to_numeric(df[feat], errors='coerce').fillna(0.0)
            
            # ===== BOOLEAN FEATURES (4) =====
            boolean_features = ['Crossing', 'Junction', 'Traffic_Signal', 'Stop']
            for feat in boolean_features:
                if feat not in df.columns:
                    df[feat] = 0
                df[feat] = df[feat].astype(int)
            
            # ===== TEMPORAL FEATURES (7) =====
            temporal_features = {
                'Hour': (0, 23),
                'Day_of_Week': (0, 6),
                'Month': (1, 12),
                'Year': (2016, 2030)
            }
            
            for feat, (min_val, max_val) in temporal_features.items():
                if feat not in df.columns:
                    df[feat] = min_val
                df[feat] = pd.to_numeric(df[feat], errors='coerce').fillna(min_val).astype(int)
                df[feat] = df[feat].clip(min_val, max_val)
            
            # Derived temporal features
            df['Is_Weekend'] = (df['Day_of_Week'] >= 5).astype(int)
            df['Is_Rush_Hour'] = ((df['Hour'] >= 7) & (df['Hour'] <= 9) | 
                                   (df['Hour'] >= 17) & (df['Hour'] <= 19)).astype(int)
            df['Is_Night'] = ((df['Hour'] >= 22) | (df['Hour'] <= 6)).astype(int)
            
            # ===== LOCATION FREQUENCY FEATURES (2) =====
            # For real-time prediction, we use average values since we don't have training frequency data
            df['City_Frequency'] = 0.5  # Default mid-range frequency
            df['State_Frequency'] = 0.5  # Default mid-range frequency
            
            # ===== STREET TYPE FEATURES (2) =====
            street = str(input_data.get('Street', '')).upper()
            df['Is_Highway'] = int(any(x in street for x in ['I-', 'US-', 'HWY', 'HIGHWAY', 'INTERSTATE']))
            df['Is_Main_Street'] = int(any(x in street for x in ['MAIN', 'AVENUE', 'AVE', 'BOULEVARD', 'BLVD']))
            
            # ===== INTERACTION FEATURES (2) =====
            df['Night_Low_Visibility'] = ((df['Is_Night'] == 1) & (df['Visibility(mi)'] < 5)).astype(int)
            df['Freezing_Rain'] = ((df['Temperature(F)'] <= 32) & (df['Precipitation(in)'] > 0)).astype(int)
            
            # ===== WEATHER CONDITION ONE-HOT ENCODING (15) =====
            weather_condition = input_data.get('Weather_Condition', 'Other')
            
            # Map weather conditions to categories
            weather_categories = [
                'Fair', 'Fog', 'Haze', 'Heavy Rain', 'Light Drizzle', 
                'Light Rain', 'Light Snow', 'Light Thunderstorms and Rain',
                'Mostly Cloudy', 'Other', 'Overcast', 'Partly Cloudy',
                'Rain', 'Scattered Clouds', 'Thunderstorm'
            ]
            
            # Initialize all weather columns to 0
            for cat in weather_categories:
                df[f'Weather_Condition_{cat}'] = 0
            
            # Set the matching category to 1
            best_match = self._match_weather_condition(weather_condition, weather_categories)
            if best_match:
                df[f'Weather_Condition_{best_match}'] = 1
            else:
                df['Weather_Condition_Other'] = 1
            
            # ===== SUNRISE_SUNSET ONE-HOT ENCODING (2) =====
            sunrise_sunset = input_data.get('Sunrise_Sunset', 'Day')
            df['Sunrise_Sunset_Night'] = 1 if 'Night' in str(sunrise_sunset) else 0
            df['Sunrise_Sunset_Unknown'] = 1 if 'Unknown' in str(sunrise_sunset) else 0
            
            # ===== FEATURE ALIGNMENT (43 features total) =====
            logger.info("Aligning features with training data...")
            
            # Add any missing columns with 0 values
            for feature in self.feature_names:
                if feature not in df.columns:
                    df[feature] = 0
                    logger.debug(f"Added missing feature: {feature}")
            
            # Remove extra columns not in training
            extra_cols = [col for col in df.columns if col not in self.feature_names]
            if extra_cols:
                logger.debug(f"Removing extra columns: {extra_cols}")
                df = df.drop(columns=extra_cols, errors='ignore')
            
            # Reorder columns to match training feature order
            df_final = df[self.feature_names]
            
            # ===== FINAL CLEANING =====
            df_final = df_final.fillna(0)
            df_final = df_final.replace([np.inf, -np.inf], 0)
            df_final = df_final.astype(float)
            
            logger.info(f"✓ Preprocessing complete. Shape: {df_final.shape}")
            logger.info(f"  Features: {len(df_final.columns)} (expected: 43)")
            
            return df_final
            
        except Exception as e:
            logger.error(f"❌ Preprocessing error: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            raise ValueError(f"Error preprocessing input data: {str(e)}")
    
    def _match_weather_condition(self, condition: str, categories: List[str]) -> str:
        """Match weather condition to one of the predefined categories"""
        condition_lower = str(condition).lower()
        
        # Direct matches
        for cat in categories:
            if cat.lower() in condition_lower or condition_lower in cat.lower():
                return cat
        
        # Partial matches
        if 'clear' in condition_lower or 'fair' in condition_lower:
            return 'Fair'
        if 'fog' in condition_lower or 'mist' in condition_lower:
            return 'Fog'
        if 'haze' in condition_lower:
            return 'Haze'
        if 'heavy' in condition_lower and 'rain' in condition_lower:
            return 'Heavy Rain'
        if 'drizzle' in condition_lower:
            return 'Light Drizzle'
        if 'light' in condition_lower and 'rain' in condition_lower:
            return 'Light Rain'
        if 'light' in condition_lower and 'snow' in condition_lower:
            return 'Light Snow'
        if 'thunder' in condition_lower and 'light' in condition_lower:
            return 'Light Thunderstorms and Rain'
        if 'mostly cloudy' in condition_lower:
            return 'Mostly Cloudy'
        if 'overcast' in condition_lower:
            return 'Overcast'
        if 'partly' in condition_lower and 'cloud' in condition_lower:
            return 'Partly Cloudy'
        if 'rain' in condition_lower and 'heavy' not in condition_lower:
            return 'Rain'
        if 'scattered' in condition_lower:
            return 'Scattered Clouds'
        if 'thunder' in condition_lower or 'storm' in condition_lower:
            return 'Thunderstorm'
        
        return 'Other'
    
    def validate_input(self, input_data: Dict[str, Any]) -> tuple:
        """
        Validate input data
        
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []
        
        # Check numeric ranges
        if 'Start_Lat' in input_data:
            lat = input_data['Start_Lat']
            if not isinstance(lat, (int, float)) or lat < -90 or lat > 90:
                errors.append("Start_Lat must be between -90 and 90")
        
        if 'Start_Lng' in input_data:
            lng = input_data['Start_Lng']
            if not isinstance(lng, (int, float)) or lng < -180 or lng > 180:
                errors.append("Start_Lng must be between -180 and 180")
        
        if 'Hour' in input_data:
            hour = input_data['Hour']
            if not isinstance(hour, int) or hour < 0 or hour > 23:
                errors.append("Hour must be between 0 and 23")
        
        return len(errors) == 0, errors


def get_default_features() -> Dict[str, Any]:
    """
    Return a template of required input features with default values
    """
    return {
        # Geographic
        "Start_Lat": 39.7392,  # Example: Ohio
        "Start_Lng": -104.9903,  # Example: Colorado
        "Distance(mi)": 0.5,
        
        # Weather
        "Temperature(F)": 60.0,
        "Humidity(%)": 65.0,
        "Pressure(in)": 29.92,
        "Visibility(mi)": 10.0,
        "Wind_Speed(mph)": 5.0,
        "Precipitation(in)": 0.0,
        "Weather_Condition": "Fair",
        
        # Road Features
        "Crossing": 0,
        "Junction": 0,
        "Traffic_Signal": 0,
        "Stop": 0,
        
        # Temporal
        "Hour": 12,
        "Day_of_Week": 2,  # Wednesday
        "Month": 6,
        "Year": 2024,
        
        # Location
        "City": "Denver",
        "State": "CO",
        "Street": "Main St",
        "Sunrise_Sunset": "Day"
    }


def get_example_requests() -> List[Dict[str, Any]]:
    """
    Return example request payloads for different risk scenarios
    """
    return [
        {
            "name": "Low Risk - Clear Day",
            "data": {
                "Start_Lat": 39.7392,
                "Start_Lng": -104.9903,
                "Distance(mi)": 0.2,
                "Temperature(F)": 72.0,
                "Humidity(%)": 45.0,
                "Pressure(in)": 30.0,
                "Visibility(mi)": 10.0,
                "Wind_Speed(mph)": 5.0,
                "Precipitation(in)": 0.0,
                "Weather_Condition": "Fair",
                "Crossing": 1,
                "Junction": 0,
                "Traffic_Signal": 1,
                "Stop": 0,
                "Hour": 14,
                "Day_of_Week": 2,
                "Month": 6,
                "Year": 2024,
                "City": "Denver",
                "State": "CO",
                "Street": "Main St",
                "Sunrise_Sunset": "Day"
            }
        },
        {
            "name": "High Risk - Highway Night",
            "data": {
                "Start_Lat": 34.0522,
                "Start_Lng": -118.2437,
                "Distance(mi)": 2.5,
                "Temperature(F)": 55.0,
                "Humidity(%)": 85.0,
                "Pressure(in)": 29.8,
                "Visibility(mi)": 3.0,
                "Wind_Speed(mph)": 15.0,
                "Precipitation(in)": 0.5,
                "Weather_Condition": "Heavy Rain",
                "Crossing": 0,
                "Junction": 1,
                "Traffic_Signal": 1,
                "Stop": 1,
                "Hour": 23,
                "Day_of_Week": 5,
                "Month": 12,
                "Year": 2024,
                "City": "Los Angeles",
                "State": "CA",
                "Street": "I-405",
                "Sunrise_Sunset": "Night"
            }
        }
    ]
