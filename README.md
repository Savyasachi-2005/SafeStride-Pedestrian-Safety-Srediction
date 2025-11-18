# SafeStride - Pedestrian Safety Prediction System

A full-stack web application that predicts pedestrian accident risk levels using a trained XGBoost machine learning model.

![SafeStride Banner](https://via.placeholder.com/1200x300/0ea5e9/ffffff?text=SafeStride+-+Pedestrian+Safety+Prediction)

## 🎯 Project Overview

SafeStride uses machine learning to assess pedestrian accident risk based on various environmental and situational factors. The system provides real-time risk predictions with actionable safety recommendations.

### Key Features

- **Real-time Risk Prediction**: Instant accident risk assessment
- **Comprehensive Analysis**: Considers 15+ factors including weather, lighting, road conditions
- **Risk Levels**: Categorizes risk as High, Medium, or Low
- **Safety Recommendations**: Provides actionable safety advice
- **Model Metrics**: Transparent ML model performance statistics
- **Prediction History**: Track and review past assessments
- **PDF Export**: Download detailed risk reports
- **Dark Mode**: Eye-friendly dark theme
- **Responsive Design**: Works on all devices

## 🏗️ Architecture

```
SafeStride/
├── bd/              # Backend (FastAPI)
│   ├── main.py
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── mlt/        # ML model files
└── fd/             # Frontend (React + Vite)
    ├── src/
    └── public/
```

## 🚀 Quick Start

### Prerequisites

**Backend:**
- Python 3.9+
- pip

**Frontend:**
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
```powershell
cd bd
```

2. **Create virtual environment:**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

3. **Install dependencies:**
```powershell
pip install -r requirements.txt
```

4. **Verify ML model files in `bd/mlt/`:**
- ✅ SafeStride_Optimized.joblib
- ✅ label_encoder.joblib
- ✅ feature_names.joblib
- ✅ model_metrics.joblib

5. **Start backend server:**
```powershell
python main.py
```

Backend will run on: `http://localhost:8000`

API docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
```powershell
cd fd
```

2. **Install dependencies:**
```powershell
npm install
```

3. **Start development server:**
```powershell
npm run dev
```

Frontend will run on: `http://localhost:5173`

### Accessing the Application

1. Ensure backend is running on port 8000
2. Ensure frontend is running on port 5173
3. Open browser to `http://localhost:5173`
4. Start making predictions! 🎉

## 📊 Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **XGBoost**: ML model for predictions
- **Pandas**: Data processing
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server
- **Joblib**: Model serialization

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **Lucide React**: Icons
- **jsPDF**: PDF generation
- **Chart.js**: Data visualization

### ML Model
- **Algorithm**: XGBoost (Gradient Boosting)
- **Features**: 15+ input parameters
- **Output**: Risk level classification (High/Medium/Low)
- **Metrics**: Accuracy, F1-score, Precision, Recall

## 🎮 Usage Guide

### Making a Prediction

1. **Enter Location Data**
   - Latitude and Longitude coordinates

2. **Set Time Parameters**
   - Time of day (HH:MM format)
   - Day of the week

3. **Specify Environmental Conditions**
   - Weather conditions
   - Light conditions
   - Road surface conditions

4. **Configure Road Details**
   - Road type
   - Speed limit
   - Urban or rural area

5. **Add Junction Information**
   - Junction type
   - Traffic control
   - Pedestrian crossings

6. **Set Traffic Details**
   - Number of vehicles
   - Number of casualties

7. **Click "Predict Risk Level"**

### Understanding Results

**Risk Levels:**
- 🔴 **High Risk**: Avoid area if possible, extreme caution required
- 🟠 **Medium Risk**: Exercise caution, use safety measures
- 🟢 **Low Risk**: Relatively safe, follow standard safety practices

**Metrics Provided:**
- **Severity Score**: Numerical severity (1.0 - 3.0)
- **Confidence**: Model confidence percentage
- **Risk Factors**: Key contributing factors
- **Recommendations**: Personalized safety advice
- **Probability Distribution**: Likelihood of each risk level

## 🔌 API Documentation

### Backend Endpoints

#### POST `/api/predict`
Make a single risk prediction

**Request Body:**
```json
{
  "Latitude": 51.5074,
  "Longitude": -0.1278,
  "Time": "18:30",
  "Day_of_Week": "Friday",
  "Weather_Conditions": "Raining",
  "Light_Conditions": "Darkness - lights lit",
  "Speed_limit": 30,
  ...
}
```

**Response:**
```json
{
  "risk_level": "High",
  "severity_score": 2.76,
  "confidence": 0.92,
  "risk_factors": ["Low visibility - night time", "Adverse weather"],
  "recommendations": ["Avoid walking if possible", "Use well-lit routes"],
  "prediction_probabilities": {
    "High": 0.92,
    "Medium": 0.06,
    "Low": 0.02
  }
}
```

#### GET `/api/health`
Check API and model health status

#### GET `/api/metrics`
Get model performance metrics

#### POST `/api/batch-predict`
Make multiple predictions at once

#### GET `/api/feature-template`
Get input template with default values

Full API documentation: `http://localhost:8000/docs`

## 📁 Project Structure

### Backend (`bd/`)
```
bd/
├── main.py                     # FastAPI application entry
├── requirements.txt            # Python dependencies
├── models/
│   └── predictor.py           # ML model loader and predictor
├── routes/
│   └── prediction.py          # API endpoints
├── utils/
│   └── preprocessing.py       # Feature preprocessing
├── mlt/                       # ML model files
│   ├── SafeStride_Optimized.joblib
│   ├── label_encoder.joblib
│   ├── feature_names.joblib
│   └── model_metrics.joblib
└── README.md
```

### Frontend (`fd/`)
```
fd/
├── src/
│   ├── components/
│   │   ├── Header.jsx         # App header
│   │   ├── PredictionForm.jsx # Input form
│   │   ├── ResultDisplay.jsx  # Results display
│   │   └── MetricsCard.jsx    # Metrics dashboard
│   ├── services/
│   │   └── api.js            # API service
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── .env                      # Environment variables
└── README.md
```

## 🧪 Testing

### Backend Testing

Test with curl:
```powershell
curl -X POST "http://localhost:8000/api/predict" `
  -H "Content-Type: application/json" `
  -d '{
    "Time": "18:30",
    "Day_of_Week": "Friday",
    "Weather_Conditions": "Raining",
    "Speed_limit": 30
  }'
```

Or use the interactive API docs at `http://localhost:8000/docs`

### Frontend Testing

1. Check health status indicator in header
2. Submit test prediction
3. Verify results display correctly
4. Test PDF export
5. Check prediction history
6. Toggle dark mode
7. Test on mobile devices

## 🚢 Deployment

### Backend Deployment (Railway/Render)

1. Create new project
2. Connect GitHub repository
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables if needed
5. Deploy!

### Frontend Deployment (Vercel/Netlify)

1. Build project: `npm run build`
2. Upload `dist/` folder or connect GitHub
3. Set environment variable:
   - `VITE_API_URL`: Your deployed backend URL
4. Deploy!

## 🔧 Configuration

### Backend Configuration

Edit `.env` file in `bd/`:
```env
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=info
MODEL_DIR=mlt
```

### Frontend Configuration

Edit `.env` file in `fd/`:
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=SafeStride
VITE_APP_VERSION=1.0.0
```

## 🐛 Troubleshooting

### Backend Issues

**Model files not found:**
- Ensure all `.joblib` files are in `bd/mlt/` directory
- Check file names match exactly

**Port already in use:**
```powershell
# Change port in main.py or use different port
uvicorn main:app --port 8001
```

### Frontend Issues

**API connection failed:**
- Verify backend is running
- Check CORS settings in backend
- Confirm `VITE_API_URL` in `.env`

**Build errors:**
```powershell
# Clear and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Common Issues

**CORS errors:**
- Backend has CORS middleware configured for all origins
- In production, specify allowed origins

**Module not found:**
- Reinstall dependencies
- Check Python/Node version compatibility

## 📈 Performance

- Backend: ~50ms average prediction time
- Frontend: React 18 with Vite for fast HMR
- Model: Optimized XGBoost with joblib serialization
- API: Async FastAPI for concurrent requests

## 🔒 Security

- Input validation with Pydantic
- CORS configuration
- Error handling without exposing internals
- No sensitive data in localStorage
- Environment variables for configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- SafeStride Development Team

## 🙏 Acknowledgments

- XGBoost team for the ML framework
- FastAPI for the excellent web framework
- React and Vite teams
- Tailwind CSS for the styling framework

## 📞 Support

For support:
- Check documentation in `bd/README.md` and `fd/README.md`
- Review troubleshooting section
- Open an issue on GitHub



---

Built with ❤️ using FastAPI, React, and XGBoost

