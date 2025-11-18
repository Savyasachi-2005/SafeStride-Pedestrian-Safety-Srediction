"""
Quick API test - sends a request to the running backend
"""
import requests
import json

API_URL = "http://127.0.0.1:8000/api/predict"

# Test payload - Low Risk scenario
payload = {
    "Start_Lat": 39.7392,
    "Start_Lng": -104.9903,
    "Distance(mi)": 0.5,
    "Temperature(F)": 60.0,
    "Humidity(%)": 65.0,
    "Pressure(in)": 29.92,
    "Visibility(mi)": 10.0,
    "Wind_Speed(mph)": 5.0,
    "Precipitation(in)": 0.0,
    "Weather_Condition": "Fair",
    "Crossing": 0,
    "Junction": 0,
    "Traffic_Signal": 1,
    "Stop": 0,
    "Hour": 12,
    "Day_of_Week": 2,
    "Month": 6,
    "Year": 2024,
    "City": "Denver",
    "State": "CO",
    "Street": "Main St",
    "Sunrise_Sunset": "Day"
}

print("=" * 80)
print("TESTING API ENDPOINT")
print("=" * 80)
print(f"\nSending request to: {API_URL}")
print("\nPayload:")
print(json.dumps(payload, indent=2))

try:
    response = requests.post(API_URL, json=payload, timeout=10)
    
    print(f"\n📡 Response Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("\n✅ SUCCESS!")
        print("\n📊 Prediction Result:")
        print(json.dumps(result, indent=2))
    else:
        print(f"\n❌ ERROR: {response.status_code}")
        print(response.text)
        
except requests.exceptions.ConnectionError:
    print("\n❌ ERROR: Cannot connect to backend.")
    print("Make sure the backend is running on http://127.0.0.1:8000")
except Exception as e:
    print(f"\n❌ ERROR: {e}")
