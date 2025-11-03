# SafeStride - Complete Setup & Usage Guide

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Running the Application](#running-the-application)
5. [Using the Application](#using-the-application)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Configuration](#advanced-configuration)
9. [Deployment](#deployment)

---

## 🚀 Quick Start

### Automatic Setup (Recommended)

1. **Run the setup script:**
```powershell
.\setup.ps1
```

2. **Start Backend (Terminal 1):**
```powershell
cd bd
.\start.ps1
```

3. **Start Frontend (Terminal 2):**
```powershell
cd fd
.\start.ps1
```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

---

## 📋 Prerequisites

### Required Software

- **Python 3.9 or higher**
  - Download: https://www.python.org/downloads/
  - Verify: `python --version`

- **Node.js 16 or higher**
  - Download: https://nodejs.org/
  - Verify: `node --version`

- **npm (comes with Node.js)**
  - Verify: `npm --version`

### Required Files

Ensure these ML model files are in `bd/mlt/` or `bd/MLT/`:
- ✅ SafeStride_Optimized.joblib
- ✅ label_encoder.joblib
- ✅ feature_names.joblib
- ✅ model_metrics.joblib

---

## 🔧 Installation

### Option 1: Automatic Installation

```powershell
# Run setup script from project root
.\setup.ps1
```

This will:
- Check all prerequisites
- Set up Python virtual environment
- Install all Python dependencies
- Install all Node.js dependencies
- Verify ML model files

### Option 2: Manual Installation

#### Backend Setup

```powershell
# Navigate to backend
cd bd

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

#### Frontend Setup

```powershell
# Navigate to frontend
cd fd

# Install dependencies
npm install
```

---

## 🎮 Running the Application

### Method 1: Using Start Scripts (Recommended)

**Terminal 1 - Backend:**
```powershell
cd bd
.\start.ps1
```

**Terminal 2 - Frontend:**
```powershell
cd fd
.\start.ps1
```

### Method 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd bd
.\venv\Scripts\Activate.ps1
python main.py
```

**Terminal 2 - Frontend:**
```powershell
cd fd
npm run dev
```

### Verification

Once both servers are running:

1. ✅ Backend health check: http://localhost:8000/api/health
2. ✅ API documentation: http://localhost:8000/docs
3. ✅ Frontend app: http://localhost:5173

You should see:
- Backend: JSON response with "status": "healthy"
- Frontend: SafeStride web interface

---

## 📖 Using the Application

### Making a Prediction

1. **Open the application** at http://localhost:5173

2. **Fill in the prediction form:**

   **Location Section:**
   - Latitude: -90 to 90 (e.g., 51.5074 for London)
   - Longitude: -180 to 180 (e.g., -0.1278 for London)

   **Time & Date Section:**
   - Time: HH:MM format (e.g., 18:30)
   - Day of Week: Select from dropdown

   **Weather & Lighting Section:**
   - Weather Conditions: Current weather
   - Light Conditions: Current lighting

   **Road Conditions Section:**
   - Road Type: Type of road
   - Road Surface: Current surface condition
   - Speed Limit: In mph (0-120)
   - Area Type: Urban or Rural

   **Junction & Crossing Section:**
   - Junction Detail: Type of junction
   - Junction Control: Traffic control type
   - Pedestrian Crossing: Crossing type
   - Carriageway Hazards: Any hazards present

   **Traffic Details Section:**
   - Number of Vehicles: Count of vehicles
   - Number of Casualties: Count of casualties

3. **Click "Predict Risk Level"**

4. **View Results:**
   - Risk Level (High/Medium/Low)
   - Severity Score (1.0 - 3.0)
   - Confidence percentage
   - Risk factors identified
   - Safety recommendations

5. **Additional Actions:**
   - Export as PDF
   - View in History tab
   - Make another prediction

### Understanding Results

#### Risk Levels

🔴 **High Risk**
- Severity Score: 2.5 - 3.0
- Action: Avoid area if possible
- Extreme caution required

🟠 **Medium Risk**
- Severity Score: 1.5 - 2.5
- Action: Exercise caution
- Follow safety measures

🟢 **Low Risk**
- Severity Score: 1.0 - 1.5
- Action: Relatively safe
- Follow standard safety practices

#### Confidence Score

- **90-100%**: Very high confidence
- **80-90%**: High confidence
- **70-80%**: Moderate confidence
- **Below 70%**: Lower confidence

### Features Overview

#### 1. New Prediction Tab
- Comprehensive input form
- Real-time validation
- Dropdown selections for categorical data

#### 2. Results Tab
- Visual risk indicators
- Detailed metrics
- Risk factors list
- Safety recommendations
- PDF export option

#### 3. Model Metrics Tab
- Model accuracy
- F1 Score
- Precision and Recall
- Additional performance metrics

#### 4. History Tab
- Recent predictions
- Quick overview
- Sortable and filterable
- Clear history option

#### 5. Dark Mode
- Toggle in header
- Preference saved locally
- Eye-friendly for night use

---

## 🔌 API Reference

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "model_status": {
    "model_loaded": true,
    "encoder_loaded": true,
    "features_count": 50
  }
}
```

#### 2. Make Prediction
```http
POST /api/predict
Content-Type: application/json
```

**Request Body:**
```json
{
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
```

**Response:**
```json
{
  "risk_level": "High",
  "severity_score": 2.76,
  "confidence": 0.92,
  "risk_factors": [
    "Low visibility - night time",
    "Adverse weather conditions",
    "Poor road surface conditions"
  ],
  "recommendations": [
    "⚠️ Avoid walking in this area if possible",
    "Use alternative routes with better lighting",
    "Consider using public transportation"
  ],
  "prediction_probabilities": {
    "High": 0.92,
    "Medium": 0.06,
    "Low": 0.02
  }
}
```

#### 3. Batch Predictions
```http
POST /api/batch-predict
Content-Type: application/json
```

**Request Body:**
```json
{
  "predictions": [
    {
      "Time": "08:00",
      "Day_of_Week": "Monday",
      ...
    },
    {
      "Time": "18:00",
      "Day_of_Week": "Friday",
      ...
    }
  ]
}
```

#### 4. Get Model Metrics
```http
GET /api/metrics
```

**Response:**
```json
{
  "metrics": {
    "accuracy": 0.95,
    "f1_score": 0.94,
    "precision": 0.93,
    "recall": 0.95
  },
  "model_name": "SafeStride XGBoost Optimized",
  "model_version": "1.0.0"
}
```

#### 5. Get Feature Template
```http
GET /api/feature-template
```

Returns template with all expected features and default values.

### Testing API with curl

**Windows PowerShell:**
```powershell
$body = @{
    Time = "18:30"
    Day_of_Week = "Friday"
    Weather_Conditions = "Raining"
    Speed_limit = 30
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/predict" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

**Or use the interactive API docs:**
http://localhost:8000/docs

---

## 🔍 Troubleshooting

### Backend Issues

#### Error: "Model files not found"
**Solution:**
1. Check files exist in `bd/mlt/` or `bd/MLT/`
2. Verify all 4 .joblib files are present
3. Check file names match exactly

#### Error: "Port 8000 already in use"
**Solution:**
```powershell
# Find process using port
Get-NetTCPConnection -LocalPort 8000

# Kill the process (replace PID)
Stop-Process -Id <PID> -Force

# Or use different port
uvicorn main:app --port 8001
```

#### Error: "Module not found"
**Solution:**
```powershell
# Ensure venv is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues

#### Error: "Failed to fetch" or "Network Error"
**Solution:**
1. Verify backend is running: http://localhost:8000/api/health
2. Check `.env` file has correct `VITE_API_URL`
3. Check browser console for CORS errors

#### Error: "npm install fails"
**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

#### Page shows errors after starting
**Solution:**
1. Hard refresh: Ctrl + F5
2. Clear browser cache
3. Check browser console for errors

### Common Issues

#### Application is slow
**Solutions:**
- Check CPU/Memory usage
- Restart both servers
- Clear browser cache
- Check for large prediction history (clear it)

#### Dark mode not working
**Solutions:**
```javascript
// In browser console
localStorage.clear()
// Then refresh page
```

#### Predictions fail with 400 error
**Solutions:**
- Check all required fields are filled
- Verify numeric fields have valid values
- Check time format is HH:MM
- Review error message in browser console

---

## ⚙️ Advanced Configuration

### Backend Configuration

**Create `bd/.env` file:**
```env
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=info
MODEL_DIR=mlt
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Modify `bd/main.py` for custom CORS:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend Configuration

**Edit `fd/.env`:**
```env
# API Configuration
VITE_API_URL=http://localhost:8000

# App Configuration
VITE_APP_NAME=SafeStride
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_HISTORY=true
VITE_ENABLE_PDF_EXPORT=true
```

**Custom API URL:**
```env
# For production
VITE_API_URL=https://your-backend.com

# For different port
VITE_API_URL=http://localhost:8001
```

### Performance Tuning

**Backend:**
- Increase workers: `uvicorn main:app --workers 4`
- Use production server: Gunicorn + Uvicorn
- Enable caching for static predictions

**Frontend:**
- Build for production: `npm run build`
- Use CDN for assets
- Enable lazy loading

---

## 🚢 Deployment

### Backend Deployment

#### Option 1: Railway

1. Create Railway account
2. New Project → Deploy from GitHub
3. Select `bd` folder as root
4. Add start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add model files to repository
6. Deploy!

#### Option 2: Render

1. Create Render account
2. New Web Service
3. Connect GitHub repository
4. Root directory: `bd`
5. Build command: `pip install -r requirements.txt`
6. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Deploy!

#### Option 3: Docker

```dockerfile
# bd/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```powershell
# Build and run
docker build -t safestride-backend ./bd
docker run -p 8000:8000 safestride-backend
```

### Frontend Deployment

#### Option 1: Vercel

1. Create Vercel account
2. Import GitHub repository
3. Framework: Vite
4. Root directory: `fd`
5. Build command: `npm run build`
6. Output directory: `dist`
7. Environment variable: `VITE_API_URL=<your-backend-url>`
8. Deploy!

#### Option 2: Netlify

1. Build locally: `npm run build`
2. Upload `dist` folder to Netlify
3. Configure environment variables
4. Deploy!

#### Option 3: Docker

```dockerfile
# fd/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📝 Additional Resources

- **Backend README**: `bd/README.md`
- **Frontend README**: `fd/README.md`
- **Main README**: `README.md`
- **API Documentation**: http://localhost:8000/docs
- **GitHub Repository**: [Your repo URL]

---

## 🆘 Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review README files in bd/ and fd/
3. Check browser console for errors
4. Check terminal output for backend errors
5. Verify all prerequisites are installed
6. Try the setup script again

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using FastAPI, React, and XGBoost**
