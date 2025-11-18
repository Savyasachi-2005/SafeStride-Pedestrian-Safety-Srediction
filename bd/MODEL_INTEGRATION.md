# SafeStride Model Integration Guide

## Overview

This document explains how the SafeStride backend integrates with the XGBoost model and performs feature engineering on raw input data.

## Model Files

The backend requires **4 joblib files** in the `MLT/` directory:

1. **SafeStride_Model.joblib** - Trained XGBoost model
2. **SafeStride_LabelEncoder.joblib** - Label encoder for severity levels (Low/Medium/High)
3. **SafeStride_Features.joblib** - List of feature names in training order
4. **SafeStride_Metadata.joblib** - Model performance metrics (accuracy, F1, etc.)

## Required Input Features (10 Raw Features)

The API accepts exactly **10 raw features** from the user:

### Numeric Features
1. **Number_of_Vehicles** (int) - Number of vehicles involved
2. **Number_of_Casualties** (int) - Number of casualties
3. **Speed_limit** (int) - Speed limit in mph (0-120)

### Time/Date Features
4. **Time** (string) - Time in HH:MM format (24-hour), e.g., "18:30"
5. **Date** (string) - Date in YYYY-MM-DD format, e.g., "2024-03-15"

### Categorical Features
6. **Road_Type** (string) - Options:
   - Single carriageway
   - Dual carriageway
   - Roundabout
   - One way street
   - Slip road

7. **Road_Surface_Conditions** (string) - Options:
   - Dry
   - Wet or damp
   - Snow
   - Frost or ice
   - Flood over 3cm deep

8. **Light_Conditions** (string) - Options:
   - Daylight
   - Darkness - lights lit
   - Darkness - lights unlit
   - Darkness - no lighting
   - Darkness - lighting unknown

9. **Weather_Conditions** (string) - Options:
   - Fine no high winds
   - Raining no high winds
   - Snowing no high winds
   - Fine + high winds
   - Raining + high winds
   - Snowing + high winds
   - Fog or mist
   - Other
   - Unknown

10. **Urban_or_Rural_Area** (string) - Options:
    - Urban
    - Rural

## Feature Engineering Pipeline

The preprocessing pipeline automatically generates additional features:

### Time-Based Features (6 features)
From the `Time` input:
- **Hour** - Extracted hour (0-23)
- **Is_Morning_Rush** - 1 if hour 7-10, else 0
- **Is_Evening_Rush** - 1 if hour 17-20, else 0
- **Is_Rush_Hour** - 1 if morning or evening rush, else 0
- **Is_Night** - 1 if hour 22-6, else 0
- **Is_Peak_Hour** - 1 if hour in [8, 9, 17, 18, 19], else 0

### Date-Based Features (6 features)
From the `Date` input:
- **Day_of_Week** - 0=Monday to 6=Sunday
- **Month** - 1-12
- **Year** - Full year
- **Is_Weekend** - 1 if Day_of_Week >= 5, else 0
- **Is_Holiday_Season** - 1 if Month in [1, 4, 10, 12], else 0

### Interaction Features (2 features)
- **Casualties_per_Vehicle** = Number_of_Casualties / (Number_of_Vehicles + 1)
- **High_Speed_Multi_Vehicle** = 1 if (Speed_limit >= 50 AND Number_of_Vehicles > 2), else 0

### Categorical Encoding
Each categorical feature is one-hot encoded with `drop_first=True`:
- **Road_Type** → One-hot encoded columns
- **Road_Surface_Conditions** → One-hot encoded columns
- **Light_Conditions** → One-hot encoded columns
- **Weather_Conditions** → One-hot encoded columns
- **Urban_or_Rural_Area** → One-hot encoded columns

**Unseen categories** are automatically mapped to 'Other'.

### Feature Alignment
After feature engineering:
1. Missing columns are added with value 0
2. Extra columns are removed
3. Columns are reordered to match training feature order
4. All values are converted to float

## Example API Request

```json
{
  "Number_of_Vehicles": 2,
  "Number_of_Casualties": 1,
  "Time": "18:30",
  "Date": "2024-03-15",
  "Road_Type": "Single carriageway",
  "Speed_limit": 50,
  "Road_Surface_Conditions": "Wet or damp",
  "Light_Conditions": "Darkness - lights lit",
  "Weather_Conditions": "Raining no high winds",
  "Urban_or_Rural_Area": "Urban"
}
```

## Example API Response

```json
{
  "risk_level": "High",
  "severity_score": 2.57,
  "confidence": 0.856,
  "prediction_probabilities": {
    "Low": 0.067,
    "Medium": 0.277,
    "High": 0.656
  },
  "risk_factors": [
    "Low visibility - night time",
    "Adverse weather conditions",
    "Poor road surface conditions",
    "High speed limit area",
    "Multiple vehicles involved"
  ],
  "recommendations": [
    "⚠️ Avoid walking in this area if possible",
    "Use alternative routes with better lighting",
    "Consider using public transportation",
    "If walking is necessary, stay extremely alert",
    "Extra caution - high-speed traffic area"
  ]
}
```

## API Endpoints

### POST /api/predict
Make a single prediction

**Request Body:** `PredictionInput` (10 required features)

**Response:** `PredictionResponse` (risk_level, confidence, etc.)

### POST /api/batch-predict
Make multiple predictions at once

**Request Body:** `BatchPredictionInput` (list of predictions)

**Response:** `BatchPredictionResponse` (list of results)

### GET /api/health
Check API and model health status

### GET /api/metrics
Get model performance metrics (accuracy, F1 score, etc.)

### GET /api/feature-template
Get template with required features, valid values, and examples

## Code Structure

```
bd/
├── main.py                      # FastAPI app initialization
├── models/
│   └── predictor.py            # Model loading and prediction logic
├── routes/
│   └── prediction.py           # API endpoints
├── utils/
│   └── preprocessing.py        # Feature engineering pipeline
└── MLT/
    ├── SafeStride_Model.joblib
    ├── SafeStride_LabelEncoder.joblib
    ├── SafeStride_Features.joblib
    └── SafeStride_Metadata.joblib
```

## Testing the API

1. **Start the server:**
   ```powershell
   cd bd
   .\start.ps1
   ```

2. **Access the interactive docs:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

3. **Test with curl:**
   ```powershell
   curl -X POST "http://localhost:8000/api/predict" `
     -H "Content-Type: application/json" `
     -d '{
       "Number_of_Vehicles": 2,
       "Number_of_Casualties": 1,
       "Time": "18:30",
       "Date": "2024-03-15",
       "Road_Type": "Single carriageway",
       "Speed_limit": 50,
       "Road_Surface_Conditions": "Wet or damp",
       "Light_Conditions": "Darkness - lights lit",
       "Weather_Conditions": "Raining no high winds",
       "Urban_or_Rural_Area": "Urban"
     }'
   ```

4. **Get feature template:**
   ```powershell
   curl http://localhost:8000/api/feature-template
   ```

## Error Handling

The API validates all inputs and returns clear error messages:

- **400 Bad Request** - Invalid input (missing fields, invalid values, wrong format)
- **500 Internal Server Error** - Model or preprocessing errors

Example validation error:
```json
{
  "detail": {
    "errors": [
      "Missing required field: Time",
      "Speed_limit must be between 0 and 120"
    ]
  }
}
```

## Logging

The backend logs detailed information about:
- Model loading
- Feature preprocessing steps
- Prediction results
- Errors and warnings

Check console output for debugging information.

## Performance Tips

1. Use `/api/batch-predict` for multiple predictions instead of calling `/api/predict` repeatedly
2. The model is loaded once on startup and kept in memory
3. Feature engineering is fast (~1ms per prediction)
4. Consider caching predictions for identical inputs

## Updating the Model

To update the model files:

1. Place new joblib files in `bd/MLT/` directory
2. Ensure file names match exactly:
   - SafeStride_Model.joblib
   - SafeStride_LabelEncoder.joblib
   - SafeStride_Features.joblib
   - SafeStride_Metadata.joblib
3. Restart the server

The preprocessing logic automatically adapts to the new feature set.
