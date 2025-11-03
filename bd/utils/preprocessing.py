import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


# Encoding mappings based on UK STATS19 data format
LIGHT_CONDITIONS_MAP = {
    "Daylight": 1.0,
    "Darkness - lights lit": 4.0,
    "Darkness - lights unlit": 5.0,
    "Darkness - no lighting": 6.0,
    "Darkness - lighting unknown": 7.0,
}

WEATHER_CONDITIONS_MAP = {
    "Fine no high winds": 1.0,
    "Fine": 1.0,
    "Raining no high winds": 2.0,
    "Raining": 2.0,
    "Snowing no high winds": 3.0,
    "Snowing": 3.0,
    "Fine + high winds": 4.0,
    "Raining + high winds": 5.0,
    "Snowing + high winds": 6.0,
    "Fog or mist": 7.0,
    "Other": 8.0,
    "Unknown": 9.0,
}

ROAD_SURFACE_CONDITIONS_MAP = {
    "Dry": 1.0,
    "Wet or damp": 2.0,
    "Snow": 3.0,
    "Frost or ice": 4.0,
    "Flood over 3cm deep": 5.0,
    "Flood over 3cm. deep": 5.0,
}

ROAD_TYPE_MAP = {
    "Roundabout": 2.0,
    "One way street": 3.0,
    "Dual carriageway": 6.0,
    "Single carriageway": 7.0,
    "Slip road": 9.0,
}

URBAN_RURAL_MAP = {
    "Urban": 1.0,
    "Rural": 2.0,
    "Unallocated": 3.0,
}

DAY_OF_WEEK_MAP = {
    "Sunday": 1,
    "Monday": 2,
    "Tuesday": 3,
    "Wednesday": 4,
    "Thursday": 5,
    "Friday": 6,
    "Saturday": 7,
}


class FeaturePreprocessor:
    """
    Preprocesses input features to match the format expected by the trained model
    """
    
    def __init__(self, feature_names: List[str]):
        self.feature_names = feature_names
    
    def preprocess(self, input_data: Dict[str, Any]) -> pd.DataFrame:
        """
        Preprocess raw input data into model-ready features
        
        Args:
            input_data: Dictionary with raw input features
            
        Returns:
            DataFrame with preprocessed features matching training format
        """
        try:
            # Create a dictionary to store processed features
            processed = {}
            
            # 1. Handle Time/Hour
            if 'Time' in input_data:
                time_val = input_data['Time']
                if isinstance(time_val, str) and ':' in time_val:
                    hour = int(time_val.split(':')[0])
                else:
                    hour = int(time_val) if isinstance(time_val, (int, float)) else 12
                processed['Hour'] = hour
                processed['Is_Night'] = 1 if (hour < 6 or hour >= 20) else 0
                processed['Is_Rush_Hour'] = 1 if (7 <= hour <= 9 or 16 <= hour <= 18) else 0
            else:
                processed['Hour'] = 12
                processed['Is_Night'] = 0
                processed['Is_Rush_Hour'] = 0
            
            # 2. Handle Day of Week
            day = input_data.get('Day_of_Week', 'Monday')
            processed['Day_of_Week'] = DAY_OF_WEEK_MAP.get(day, 2)
            processed['Is_Weekend'] = 1 if day in ['Saturday', 'Sunday'] else 0
            
            # 3. Handle Month (extract from current date if not provided)
            processed['Month'] = input_data.get('Month', 6)  # Default to June
            
            # 4. Handle Location
            processed['latitude'] = float(input_data.get('Latitude', 51.5074))
            processed['longitude'] = float(input_data.get('Longitude', -0.1278))
            
            # 5. Handle Light Conditions (one-hot encoded)
            light = input_data.get('Light_Conditions', 'Daylight')
            light_code = LIGHT_CONDITIONS_MAP.get(light, 1.0)
            for code in [4.0, 5.0, 6.0, 7.0]:
                processed[f'Light_Conditions_{code}'] = 1 if light_code == code else 0
            
            # 6. Handle Weather Conditions (one-hot encoded)
            weather = input_data.get('Weather_Conditions', 'Fine')
            weather_code = WEATHER_CONDITIONS_MAP.get(weather, 1.0)
            for code in [2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]:
                processed[f'Weather_Conditions_{code}'] = 1 if weather_code == code else 0
            
            # 7. Handle Road Surface Conditions (one-hot encoded)
            road_surface = input_data.get('Road_Surface_Conditions', 'Dry')
            road_surface_code = ROAD_SURFACE_CONDITIONS_MAP.get(road_surface, 1.0)
            for code in [1.0, 2.0, 3.0, 4.0, 5.0]:
                processed[f'Road_Surface_Conditions_{code}'] = 1 if road_surface_code == code else 0
            
            # 8. Handle Road Type (one-hot encoded)
            road_type = input_data.get('Road_Type', 'Single carriageway')
            road_type_code = ROAD_TYPE_MAP.get(road_type, 7.0)
            for code in [2.0, 3.0, 6.0, 7.0, 9.0]:
                processed[f'Road_Type_{code}'] = 1 if road_type_code == code else 0
            
            # 9. Handle Urban/Rural Area (one-hot encoded)
            urban_rural = input_data.get('Urban_or_Rural_Area', 'Urban')
            urban_rural_code = URBAN_RURAL_MAP.get(urban_rural, 1.0)
            processed['Urban_or_Rural_Area_2.0'] = 1 if urban_rural_code == 2.0 else 0
            processed['Urban_or_Rural_Area_3.0'] = 1 if urban_rural_code == 3.0 else 0
            
            # 10. Handle Pedestrian Crossing
            ped_crossing = input_data.get('Pedestrian_Crossing', 'No physical crossing')
            processed['Pedestrian_Crossing-Physical_Facilities'] = 0 if 'No' in ped_crossing else 1
            processed['Pedestrian_Crossing-Human_Control'] = 1 if 'control' in ped_crossing.lower() else 0
            
            # 11. Handle Junction Details
            junction_detail = input_data.get('Junction_Detail', 'Not at junction')
            processed['Junction_Detail'] = 0 if 'Not' in junction_detail else 1
            
            junction_control = input_data.get('Junction_Control', 'Not at junction')
            processed['Junction_Control'] = 0 if 'Not' in junction_control else 1
            
            # 12. Simple numeric fields
            processed['Speed_limit'] = int(input_data.get('Speed_limit', 30))
            processed['Number_of_Vehicles'] = int(input_data.get('Number_of_Vehicles', 1))
            processed['Number_of_Casualties'] = int(input_data.get('Number_of_Casualties', 1))
            
            # 13. Handle Carriageway Hazards
            hazards = input_data.get('Carriageway_Hazards', 'None')
            processed['Carriageway_Hazards'] = 0 if hazards == 'None' else 1
            
            # 14. Additional fields with defaults
            processed['Special_Conditions_at_Site'] = 0
            processed['Did_Police_Officer_Attend_Scene_of_Accident'] = 0
            processed['Police_Force'] = 1
            processed['Local_Authority_(District)'] = 1
            processed['1st_Road_Class'] = 3
            processed['1st_Road_Number'] = 0
            processed['2nd_Road_Class'] = 0
            processed['2nd_Road_Number'] = 0
            
            # 15. Handle LSOA (Local Super Output Area) - set all to 0, one to "Other"
            lsoa_features = [f for f in self.feature_names if f.startswith('LSOA_of_Accident_Location_')]
            for lsoa in lsoa_features:
                if lsoa == 'LSOA_of_Accident_Location_Other':
                    processed[lsoa] = 1
                else:
                    processed[lsoa] = 0
            
            # 16. Handle Local Authority (Highway) - set all to 0, one to "Other"
            la_features = [f for f in self.feature_names if f.startswith('Local_Authority_(Highway)_')]
            for la in la_features:
                if la == 'Local_Authority_(Highway)_Other':
                    processed[la] = 1
                else:
                    processed[la] = 0
            
            # Convert to DataFrame
            df = pd.DataFrame([processed])
            
            # Ensure all expected features are present
            for feature in self.feature_names:
                if feature not in df.columns:
                    df[feature] = 0
            
            # Select only the features used in training (in correct order)
            df = df[self.feature_names]
            
            # Fill any missing values with 0
            df = df.fillna(0)
            
            # Replace infinities with 0
            df = df.replace([np.inf, -np.inf], 0)
            
            # Convert to appropriate numeric types
            df = df.astype(float)
            
            logger.info(f"Preprocessed features shape: {df.shape}")
            
            return df
            
        except Exception as e:
            logger.error(f"Preprocessing error: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            raise ValueError(f"Error preprocessing input data: {str(e)}")
    
    def _convert_time_to_minutes(self, time_value: Any) -> int:
        """Convert time to minutes from midnight"""
        if isinstance(time_value, (int, float)):
            # If already in minutes or hours
            if time_value > 24:
                return int(time_value)  # Already in minutes
            else:
                return int(time_value * 60)  # Convert hours to minutes
        
        elif isinstance(time_value, str):
            try:
                # Try parsing HH:MM format
                if ':' in time_value:
                    time_obj = datetime.strptime(time_value, '%H:%M')
                    return time_obj.hour * 60 + time_obj.minute
                else:
                    # Assume it's just hours
                    return int(float(time_value) * 60)
            except:
                logger.warning(f"Could not parse time: {time_value}, using 0")
                return 0
        
        return 0
    
    def _identify_categorical_columns(self, df: pd.DataFrame) -> List[str]:
        """Identify categorical columns that need encoding"""
        categorical_cols = []
        
        for col in df.columns:
            # Check if column contains string values
            if df[col].dtype == 'object' or df[col].dtype.name == 'category':
                categorical_cols.append(col)
        
        return categorical_cols
    
    def validate_input(self, input_data: Dict[str, Any]) -> tuple[bool, List[str]]:
        """
        Validate input data
        
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []
        
        # Check for required fields (adjust based on your model)
        required_fields = ['Time', 'Day_of_Week']  # Add your required fields
        
        for field in required_fields:
            if field not in input_data or input_data[field] is None:
                errors.append(f"Missing required field: {field}")
        
        # Validate data types and ranges
        if 'Speed_limit' in input_data:
            speed = input_data['Speed_limit']
            if not isinstance(speed, (int, float)) or speed < 0 or speed > 120:
                errors.append("Speed limit must be between 0 and 120")
        
        if 'Number_of_Vehicles' in input_data:
            num_vehicles = input_data['Number_of_Vehicles']
            if not isinstance(num_vehicles, (int, float)) or num_vehicles < 0:
                errors.append("Number of vehicles must be non-negative")
        
        if 'Number_of_Casualties' in input_data:
            num_casualties = input_data['Number_of_Casualties']
            if not isinstance(num_casualties, (int, float)) or num_casualties < 0:
                errors.append("Number of casualties must be non-negative")
        
        # Validate latitude/longitude if provided
        if 'Latitude' in input_data:
            lat = input_data['Latitude']
            if not isinstance(lat, (int, float)) or lat < -90 or lat > 90:
                errors.append("Latitude must be between -90 and 90")
        
        if 'Longitude' in input_data:
            lon = input_data['Longitude']
            if not isinstance(lon, (int, float)) or lon < -180 or lon > 180:
                errors.append("Longitude must be between -180 and 180")
        
        return len(errors) == 0, errors


def get_default_features() -> Dict[str, Any]:
    """Return a template of expected input features with default values"""
    return {
        # Location
        "Latitude": 51.5074,
        "Longitude": -0.1278,
        
        # Time features
        "Time": "12:00",  # HH:MM format or hour number
        "Day_of_Week": "Monday",  # Monday-Sunday
        "Month": 6,  # 1-12
        
        # Weather (will be encoded to numeric)
        "Weather_Conditions": "Fine",  # Fine, Raining, Snowing, Fog or mist, etc.
        
        # Light (will be encoded to numeric)
        "Light_Conditions": "Daylight",  # Daylight, Darkness - lights lit, etc.
        
        # Road (will be encoded to numeric)
        "Road_Type": "Single carriageway",  # Single carriageway, Dual carriageway, Roundabout, etc.
        "Road_Surface_Conditions": "Dry",  # Dry, Wet or damp, Snow, Frost or ice, etc.
        "Speed_limit": 30,
        
        # Junction
        "Junction_Detail": "Not at junction",  # Not at junction, Roundabout, T junction, etc.
        "Junction_Control": "Not at junction",  # Not at junction, Give way, Traffic signal, etc.
        
        # Area (will be encoded to numeric)
        "Urban_or_Rural_Area": "Urban",  # Urban, Rural
        
        # Vehicles and casualties
        "Number_of_Vehicles": 1,
        "Number_of_Casualties": 1,
        
        # Additional features
        "Pedestrian_Crossing": "No physical crossing",  # Zebra crossing, Pelican crossing, etc.
        "Carriageway_Hazards": "None",  # None, or specific hazard
    }
