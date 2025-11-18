# SafeStride API Quick Reference

## 🚀 Quick Start

```powershell
cd "g:\SIT\3rd year\MLT\project\bd"
.\start.ps1
```

Server runs at: **http://localhost:8000**

Interactive Docs: **http://localhost:8000/docs**

---

## 📥 Required Input (10 Fields)

### JSON Structure
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

### Field Types
| Field | Type | Format/Range |
|-------|------|--------------|
| Number_of_Vehicles | int | ≥ 0 |
| Number_of_Casualties | int | ≥ 0 |
| Speed_limit | int | 0-120 |
| Time | string | "HH:MM" (24-hour) |
| Date | string | "YYYY-MM-DD" |
| Road_Type | string | See options below |
| Road_Surface_Conditions | string | See options below |
| Light_Conditions | string | See options below |
| Weather_Conditions | string | See options below |
| Urban_or_Rural_Area | string | "Urban" or "Rural" |

---

## 🎯 Valid Categorical Values

### Road_Type
- Single carriageway
- Dual carriageway
- Roundabout
- One way street
- Slip road

### Road_Surface_Conditions
- Dry
- Wet or damp
- Snow
- Frost or ice
- Flood over 3cm deep

### Light_Conditions
- Daylight
- Darkness - lights lit
- Darkness - lights unlit
- Darkness - no lighting
- Darkness - lighting unknown

### Weather_Conditions
- Fine no high winds
- Raining no high winds
- Snowing no high winds
- Fine + high winds
- Raining + high winds
- Snowing + high winds
- Fog or mist
- Other
- Unknown

### Urban_or_Rural_Area
- Urban
- Rural

---

## 📤 Response Structure

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
    "Poor road surface conditions"
  ],
  "recommendations": [
    "⚠️ Avoid walking in this area if possible",
    "Use alternative routes with better lighting"
  ]
}
```

---

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict` | POST | Single prediction |
| `/api/batch-predict` | POST | Multiple predictions |
| `/api/health` | GET | Health check |
| `/api/metrics` | GET | Model metrics |
| `/api/feature-template` | GET | Get template & examples |

---

## 💻 Testing Commands

### PowerShell
```powershell
# Single prediction
$body = @{
    Number_of_Vehicles = 2
    Number_of_Casualties = 1
    Time = "18:30"
    Date = "2024-03-15"
    Road_Type = "Single carriageway"
    Speed_limit = 50
    Road_Surface_Conditions = "Wet or damp"
    Light_Conditions = "Darkness - lights lit"
    Weather_Conditions = "Raining no high winds"
    Urban_or_Rural_Area = "Urban"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/predict" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### cURL (if available)
```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
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

### JavaScript (Frontend)
```javascript
const response = await fetch('http://localhost:8000/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    Number_of_Vehicles: 2,
    Number_of_Casualties: 1,
    Time: "18:30",
    Date: "2024-03-15",
    Road_Type: "Single carriageway",
    Speed_limit: 50,
    Road_Surface_Conditions: "Wet or damp",
    Light_Conditions: "Darkness - lights lit",
    Weather_Conditions: "Raining no high winds",
    Urban_or_Rural_Area: "Urban"
  })
});

const result = await response.json();
console.log(result);
```

---

## 🧪 Example Scenarios

### Low Risk - Daytime Urban
```json
{
  "Number_of_Vehicles": 1,
  "Number_of_Casualties": 1,
  "Time": "14:30",
  "Date": "2024-03-15",
  "Road_Type": "Single carriageway",
  "Speed_limit": 30,
  "Road_Surface_Conditions": "Dry",
  "Light_Conditions": "Daylight",
  "Weather_Conditions": "Fine no high winds",
  "Urban_or_Rural_Area": "Urban"
}
```

### Medium Risk - Evening Rush Hour
```json
{
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
```

### High Risk - Night Multi-Vehicle
```json
{
  "Number_of_Vehicles": 3,
  "Number_of_Casualties": 2,
  "Time": "23:30",
  "Date": "2024-12-25",
  "Road_Type": "Dual carriageway",
  "Speed_limit": 70,
  "Road_Surface_Conditions": "Frost or ice",
  "Light_Conditions": "Darkness - lights unlit",
  "Weather_Conditions": "Snowing no high winds",
  "Urban_or_Rural_Area": "Rural"
}
```

---

## 🔧 Troubleshooting

### Server won't start
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Install dependencies
pip install -r requirements.txt
```

### Model not found
```powershell
# Verify model files exist
Get-ChildItem MLT

# Should show 4 .joblib files:
# - SafeStride_Model.joblib
# - SafeStride_LabelEncoder.joblib
# - SafeStride_Features.joblib
# - SafeStride_Metadata.joblib
```

### Invalid input errors
- Check Time format: "HH:MM" (e.g., "18:30", not "6:30 PM")
- Check Date format: "YYYY-MM-DD" (e.g., "2024-03-15")
- Verify categorical values match exactly (case-sensitive)
- Ensure numeric fields are integers, not strings

---

## 📚 More Information

- **Full Documentation**: `MODEL_INTEGRATION.md`
- **Update Summary**: `BACKEND_UPDATE_SUMMARY.md`
- **Interactive API Docs**: http://localhost:8000/docs
- **Get Examples**: `GET /api/feature-template`

---

**✓ You're all set! Start the server and begin making predictions.**
