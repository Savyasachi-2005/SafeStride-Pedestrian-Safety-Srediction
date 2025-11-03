import React, { useState } from 'react';
import { MapPin, Calendar, Cloud, Sun, Car, AlertTriangle } from 'lucide-react';

const PredictionForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    Latitude: 51.5074,
    Longitude: -0.1278,
    Time: '12:00',
    Day_of_Week: 'Monday',
    Weather_Conditions: 'Fine',
    Light_Conditions: 'Daylight',
    Road_Type: 'Single carriageway',
    Road_Surface_Conditions: 'Dry',
    Speed_limit: 30,
    Junction_Detail: 'Not at junction',
    Junction_Control: 'Not at junction',
    Urban_or_Rural_Area: 'Urban',
    Number_of_Vehicles: 1,
    Number_of_Casualties: 1,
    Pedestrian_Crossing: 'No physical crossing',
    Carriageway_Hazards: 'None',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'Speed_limit' ||
        name === 'Number_of_Vehicles' ||
        name === 'Number_of_Casualties' ||
        name === 'Latitude' ||
        name === 'Longitude'
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const weatherConditions = [
    'Fine',
    'Raining',
    'Snowing',
    'Fine + high winds',
    'Raining + high winds',
    'Snowing + high winds',
    'Fog or mist',
    'Other',
    'Unknown',
  ];

  const lightConditions = [
    'Daylight',
    'Darkness - lights lit',
    'Darkness - lights unlit',
    'Darkness - no lighting',
    'Darkness - lighting unknown',
  ];

  const roadTypes = [
    'Single carriageway',
    'Dual carriageway',
    'Roundabout',
    'One way street',
    'Slip road',
    'Unknown',
  ];

  const roadSurfaceConditions = [
    'Dry',
    'Wet or damp',
    'Snow',
    'Frost or ice',
    'Flood over 3cm deep',
  ];

  const urbanRural = ['Urban', 'Rural'];

  const junctionDetails = [
    'Not at junction',
    'Roundabout',
    'Mini-roundabout',
    'T or staggered junction',
    'Crossroads',
    'Slip road',
    'Multiple junction',
    'Private drive',
  ];

  const junctionControls = [
    'Not at junction',
    'Give way or uncontrolled',
    'Stop sign',
    'Traffic signal',
    'Auto traffic signal',
  ];

  const pedestrianCrossings = [
    'No physical crossing',
    'Zebra crossing',
    'Pelican crossing',
    'Puffin crossing',
    'Toucan crossing',
    'Pedestrian phase at traffic signal',
  ];

  const carriageHazards = [
    'None',
    'Vehicle load on road',
    'Other object on road',
    'Previous accident',
    'Dog on road',
    'Other animal on road',
    'Pedestrian in carriageway',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Section */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold">Location</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Latitude</label>
            <input
              type="number"
              name="Latitude"
              value={formData.Latitude}
              onChange={handleChange}
              step="0.0001"
              min="-90"
              max="90"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Longitude</label>
            <input
              type="number"
              name="Longitude"
              value={formData.Longitude}
              onChange={handleChange}
              step="0.0001"
              min="-180"
              max="180"
              className="input-field"
              required
            />
          </div>
        </div>
      </div>

      {/* Time and Date Section */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold">Time & Date</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Time (HH:MM)
            </label>
            <input
              type="time"
              name="Time"
              value={formData.Time}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Day of Week</label>
            <select
              name="Day_of_Week"
              value={formData.Day_of_Week}
              onChange={handleChange}
              className="input-field"
              required
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Weather and Light Section */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Cloud className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold">Weather & Lighting</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Weather Conditions
            </label>
            <select
              name="Weather_Conditions"
              value={formData.Weather_Conditions}
              onChange={handleChange}
              className="input-field"
              required
            >
              {weatherConditions.map((weather) => (
                <option key={weather} value={weather}>
                  {weather}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Light Conditions
            </label>
            <select
              name="Light_Conditions"
              value={formData.Light_Conditions}
              onChange={handleChange}
              className="input-field"
              required
            >
              {lightConditions.map((light) => (
                <option key={light} value={light}>
                  {light}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Road Section */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Car className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold">Road Conditions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Road Type</label>
            <select
              name="Road_Type"
              value={formData.Road_Type}
              onChange={handleChange}
              className="input-field"
              required
            >
              {roadTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Road Surface
            </label>
            <select
              name="Road_Surface_Conditions"
              value={formData.Road_Surface_Conditions}
              onChange={handleChange}
              className="input-field"
              required
            >
              {roadSurfaceConditions.map((surface) => (
                <option key={surface} value={surface}>
                  {surface}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Speed Limit (mph)
            </label>
            <input
              type="number"
              name="Speed_limit"
              value={formData.Speed_limit}
              onChange={handleChange}
              min="0"
              max="120"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Area Type</label>
            <select
              name="Urban_or_Rural_Area"
              value={formData.Urban_or_Rural_Area}
              onChange={handleChange}
              className="input-field"
              required
            >
              {urbanRural.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Junction Section */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold">Junction & Crossing</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Junction Detail
            </label>
            <select
              name="Junction_Detail"
              value={formData.Junction_Detail}
              onChange={handleChange}
              className="input-field"
              required
            >
              {junctionDetails.map((junction) => (
                <option key={junction} value={junction}>
                  {junction}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Junction Control
            </label>
            <select
              name="Junction_Control"
              value={formData.Junction_Control}
              onChange={handleChange}
              className="input-field"
              required
            >
              {junctionControls.map((control) => (
                <option key={control} value={control}>
                  {control}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Pedestrian Crossing
            </label>
            <select
              name="Pedestrian_Crossing"
              value={formData.Pedestrian_Crossing}
              onChange={handleChange}
              className="input-field"
              required
            >
              {pedestrianCrossings.map((crossing) => (
                <option key={crossing} value={crossing}>
                  {crossing}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Carriageway Hazards
            </label>
            <select
              name="Carriageway_Hazards"
              value={formData.Carriageway_Hazards}
              onChange={handleChange}
              className="input-field"
              required
            >
              {carriageHazards.map((hazard) => (
                <option key={hazard} value={hazard}>
                  {hazard}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles and Casualties Section */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Traffic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Vehicles
            </label>
            <input
              type="number"
              name="Number_of_Vehicles"
              value={formData.Number_of_Vehicles}
              onChange={handleChange}
              min="0"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Casualties
            </label>
            <input
              type="number"
              name="Number_of_Casualties"
              value={formData.Number_of_Casualties}
              onChange={handleChange}
              min="0"
              className="input-field"
              required
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full md:w-auto px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            'Predict Risk Level'
          )}
        </button>
      </div>
    </form>
  );
};

export default PredictionForm;
