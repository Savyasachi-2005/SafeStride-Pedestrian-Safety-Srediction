"""
Test script to verify model predictions with different scenarios
"""
from models.predictor import SafeStridePredictor
from utils.preprocessing import FeaturePreprocessor
import pandas as pd

# Initialize
predictor = SafeStridePredictor()
predictor.load_models()
preprocessor = FeaturePreprocessor(predictor.feature_names)

# Test scenarios
test_scenarios = [
    {
        "name": "Low Risk - Perfect conditions",
        "data": {
            "Number_of_Vehicles": 1,
            "Number_of_Casualties": 0,
            "Time": "14:00",
            "Date": "2024-03-15",
            "Road_Type": "Single carriageway",
            "Speed_limit": 20,
            "Road_Surface_Conditions": "Dry",
            "Light_Conditions": "Daylight",
            "Weather_Conditions": "Fine no high winds",
            "Urban_or_Rural_Area": "Urban"
        }
    },
    {
        "name": "Medium Risk - Moderate conditions",
        "data": {
            "Number_of_Vehicles": 2,
            "Number_of_Casualties": 1,
            "Time": "18:00",
            "Date": "2024-03-15",
            "Road_Type": "Dual carriageway",
            "Speed_limit": 50,
            "Road_Surface_Conditions": "Wet or damp",
            "Light_Conditions": "Darkness - lights lit",
            "Weather_Conditions": "Raining no high winds",
            "Urban_or_Rural_Area": "Urban"
        }
    },
    {
        "name": "High Risk - Dangerous conditions",
        "data": {
            "Number_of_Vehicles": 4,
            "Number_of_Casualties": 3,
            "Time": "23:30",
            "Date": "2024-12-25",
            "Road_Type": "Dual carriageway",
            "Speed_limit": 70,
            "Road_Surface_Conditions": "Snow",
            "Light_Conditions": "Darkness - lights unlit",
            "Weather_Conditions": "Snowing no high winds",
            "Urban_or_Rural_Area": "Rural"
        }
    }
]

print("=" * 80)
print("TESTING MODEL PREDICTIONS")
print("=" * 80)

for scenario in test_scenarios:
    print(f"\n\n{'='*80}")
    print(f"SCENARIO: {scenario['name']}")
    print(f"{'='*80}")
    
    # Print input
    print("\nInput Data:")
    for key, value in scenario['data'].items():
        print(f"  {key}: {value}")
    
    # Preprocess
    try:
        processed = preprocessor.preprocess(scenario['data'])
        print(f"\nProcessed Features: {processed.shape}")
        
        # Predict
        result = predictor.predict(processed)
        
        print(f"\n{'='*40}")
        print(f"PREDICTION RESULT:")
        print(f"{'='*40}")
        print(f"Risk Level: {result['risk_level']}")
        print(f"Confidence: {result['confidence']:.3f}")
        print(f"Severity Score: {result['severity_score']:.2f}")
        print(f"\nProbability Distribution:")
        for cls, prob in result['prediction_probabilities'].items():
            print(f"  {cls}: {prob:.3f} ({prob*100:.1f}%)")
        
        print(f"\nRisk Factors ({len(result['risk_factors'])}):")
        for factor in result['risk_factors']:
            print(f"  - {factor}")
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

print("\n\n" + "="*80)
print("MODEL INFO")
print("="*80)
print(f"Total Features: {len(predictor.feature_names)}")
print(f"Label Classes: {predictor.label_encoder.classes_}")
print(f"Model Type: {type(predictor.model).__name__}")

# Print first 20 feature names
print(f"\nFirst 20 Features:")
for i, fname in enumerate(predictor.feature_names[:20], 1):
    print(f"  {i}. {fname}")

print("\n" + "="*80)
