# SafeStride Backend

FastAPI backend for SafeStride - Pedestrian Accident Risk Prediction System

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
.\venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Ensure ML model files are in the `mlt/` folder:
   - SafeStride_Optimized.joblib
   - label_encoder.joblib
   - feature_names.joblib
   - model_metrics.joblib

## Running the Server

Start the development server:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

### POST /api/predict
Make a single prediction for pedestrian accident risk

**Request body:**
```json
{
  "Latitude": 51.5074,
  "Longitude": -0.1278,
  "Time": "18:30",
  "Day_of_Week": "Friday",
  "Weather_Conditions": "Raining",
  "Light_Conditions": "Darkness - lights lit",
  "Road_Type": "Single carriageway",
  "Speed_limit": 30,
  "Number_of_Vehicles": 2
}
```

**Response:**
```json
{
  "risk_level": "High",
  "severity_score": 2.76,
  "confidence": 0.92,
  "risk_factors": ["Low visibility - night time", "Adverse weather conditions"],
  "recommendations": ["⚠️ Avoid walking in this area if possible", "Use alternative routes"]
}
```

### POST /api/batch-predict
Make multiple predictions at once

### GET /api/health
Check API and model health status

### GET /api/metrics
Get model performance metrics

### GET /api/feature-template
Get template of expected input features

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── models/
│   └── predictor.py       # ML model loading and prediction logic
├── routes/
│   └── prediction.py      # API route handlers
├── mlt/
│   ├── SafeStride_Optimized.joblib
│   ├── label_encoder.joblib
│   ├── feature_names.joblib
│   └── model_metrics.joblib
└── utils/
    └── preprocessing.py   # Feature preprocessing utilities
```

## Environment Variables

Create a `.env` file (optional):
```
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=info
```

## Deployment

### Using Docker

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Railway/Render

1. Connect your GitHub repository
2. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add ML model files to the repository or use persistent storage

## Testing

Test the API with curl:
```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "Time": "18:30",
    "Day_of_Week": "Friday",
    "Weather_Conditions": "Raining",
    "Speed_limit": 30
  }'
```

Or use the interactive API docs at: `http://localhost:8000/docs`
