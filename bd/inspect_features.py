import joblib
import os

base_path = r"g:\SIT\3rd year\MLT\project\bd\MLT\ml"
features_path = os.path.join(base_path, "US_Accidents_Features_20251118_162845.joblib")

try:
    features = joblib.load(features_path)
    print("Features loaded successfully:")
    print(features)
except Exception as e:
    print(f"Error loading features: {e}")
