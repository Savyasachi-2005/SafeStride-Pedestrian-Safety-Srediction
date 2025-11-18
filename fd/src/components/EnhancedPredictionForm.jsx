import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Cloud, Sun, Car, AlertTriangle,
  Navigation, Clock, Wind, Droplets, CheckCircle,
  ArrowRight, ArrowLeft, Loader, Gauge, Users
} from 'lucide-react';

const EnhancedPredictionForm = ({ onSubmit, loading }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Get current hour
  const getCurrentHour = () => {
    return new Date().getHours();
  };

  // Get current day of week (0=Monday, 6=Sunday)
  const getCurrentDayOfWeek = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday=0 to Sunday=6
  };

  const [formData, setFormData] = useState({
    // Geographic
    Start_Lat: 39.7392,
    Start_Lng: -104.9903,
    'Distance(mi)': 0.5,
    
    // Weather
    'Temperature(F)': 60.0,
    'Humidity(%)': 65.0,
    'Pressure(in)': 29.92,
    'Visibility(mi)': 10.0,
    'Wind_Speed(mph)': 5.0,
    'Precipitation(in)': 0.0,
    Weather_Condition: 'Fair',
    
    // Road Features
    Crossing: 0,
    Junction: 0,
    Traffic_Signal: 0,
    Stop: 0,
    
    // Temporal
    Hour: getCurrentHour(),
    Day_of_Week: getCurrentDayOfWeek(),
    Month: new Date().getMonth() + 1,
    Year: new Date().getFullYear(),
    
    // Location
    City: 'Denver',
    State: 'CO',
    Street: 'Main St',
    Sunrise_Sunset: 'Day',
  });

  const [validatedFields, setValidatedFields] = useState({
    Start_Lat: true,
    Start_Lng: true,
    'Distance(mi)': true,
    'Temperature(F)': true,
    'Humidity(%)': true,
    'Pressure(in)': true,
    'Visibility(mi)': true,
    'Wind_Speed(mph)': true,
    'Precipitation(in)': true,
    Weather_Condition: true,
    Crossing: true,
    Junction: true,
    Traffic_Signal: true,
    Stop: true,
    Hour: true,
    Day_of_Week: true,
    Month: true,
    Year: true,
    City: true,
    State: true,
    Street: true,
    Sunrise_Sunset: true,
  });

  const steps = [
    {
      title: 'Location',
      icon: <MapPin className="w-6 h-6" />,
      fields: ['Start_Lat', 'Start_Lng', 'Distance(mi)', 'City', 'State', 'Street'],
      description: 'Geographic location details',
    },
    {
      title: 'Weather',
      icon: <Cloud className="w-6 h-6" />,
      fields: ['Temperature(F)', 'Humidity(%)', 'Pressure(in)', 'Visibility(mi)', 'Wind_Speed(mph)', 'Precipitation(in)', 'Weather_Condition'],
      description: 'Weather conditions',
    },
    {
      title: 'Road Features',
      icon: <Car className="w-6 h-6" />,
      fields: ['Crossing', 'Junction', 'Traffic_Signal', 'Stop'],
      description: 'Road infrastructure',
    },
    {
      title: 'Time',
      icon: <Clock className="w-6 h-6" />,
      fields: ['Hour', 'Day_of_Week', 'Month', 'Year', 'Sunrise_Sunset'],
      description: 'Temporal information',
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Parse numeric values
    let parsedValue = value;
    if (['Start_Lat', 'Start_Lng', 'Distance(mi)', 'Temperature(F)', 'Humidity(%)', 
         'Pressure(in)', 'Visibility(mi)', 'Wind_Speed(mph)', 'Precipitation(in)'].includes(name)) {
      parsedValue = parseFloat(value) || 0;
    } else if (['Crossing', 'Junction', 'Traffic_Signal', 'Stop', 'Hour', 'Day_of_Week', 'Month', 'Year'].includes(name)) {
      parsedValue = parseInt(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Validate field
    let isValid = true;
    if (name === 'Start_Lat') {
      isValid = parsedValue >= -90 && parsedValue <= 90;
    } else if (name === 'Start_Lng') {
      isValid = parsedValue >= -180 && parsedValue <= 180;
    } else if (name === 'Hour') {
      isValid = parsedValue >= 0 && parsedValue <= 23;
    } else if (name === 'Day_of_Week') {
      isValid = parsedValue >= 0 && parsedValue <= 6;
    } else if (name === 'Month') {
      isValid = parsedValue >= 1 && parsedValue <= 12;
    } else if (name === 'Humidity(%)') {
      isValid = parsedValue >= 0 && parsedValue <= 100;
    } else if (['Crossing', 'Junction', 'Traffic_Signal', 'Stop'].includes(name)) {
      isValid = parsedValue === 0 || parsedValue === 1;
    } else {
      isValid = value !== '' && value !== null;
    }

    setValidatedFields((prev) => ({
      ...prev,
      [name]: isValid,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    const currentFields = steps[currentStep].fields;
    return currentFields.every((field) => validatedFields[field]);
  };

  const renderInput = (name, config) => {
    const value = formData[name];
    const isValid = validatedFields[name];
    const { label, type = 'text', icon, options, min, max, step, help } = config;

    if (options) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <span className="flex items-center gap-2">
              {icon}
              {label}
              <span className="text-red-500">*</span>
            </span>
          </label>
          <div className="relative">
            <select
              name={name}
              value={value}
              onChange={handleChange}
              required
              className={`input-field appearance-none pr-10 ${
                isValid
                  ? 'border-green-500 focus:border-green-500'
                  : 'border-gray-300 focus:border-brand-blue'
              }`}
            >
              {options.map((option) => {
                // Handle both simple strings and {value, label} objects
                const optionValue = typeof option === 'object' ? option.value : option;
                const optionLabel = typeof option === 'object' ? option.label : option;
                return (
                  <option key={optionValue} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {isValid && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </motion.div>
              )}
            </div>
          </div>
          {help && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{help}</p>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <span className="flex items-center gap-2">
            {icon}
            {label}
            <span className="text-red-500">*</span>
          </span>
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            required
            className={`input-field ${
              isValid
                ? 'border-green-500 focus:border-green-500'
                : !validatedFields[name] && value
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-brand-blue'
            }`}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
          {isValid && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
            </motion.div>
          )}
        </div>
        {help && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{help}</p>
        )}
        {!isValid && value && type === 'number' && (
          <p className="mt-1 text-xs text-red-500">
            Please enter a value between {min} and {max}
          </p>
        )}
      </motion.div>
    );
  };

  const renderStepContent = () => {
    const currentFields = steps[currentStep].fields;

    const fieldConfigs = {
      // Geographic
      Start_Lat: {
        label: 'Latitude',
        type: 'number',
        icon: <MapPin className="w-4 h-4" />,
        min: -90,
        max: 90,
        step: 0.0001,
        help: 'Enter latitude (-90 to 90)',
      },
      Start_Lng: {
        label: 'Longitude',
        type: 'number',
        icon: <MapPin className="w-4 h-4" />,
        min: -180,
        max: 180,
        step: 0.0001,
        help: 'Enter longitude (-180 to 180)',
      },
      'Distance(mi)': {
        label: 'Distance (miles)',
        type: 'number',
        icon: <Navigation className="w-4 h-4" />,
        min: 0,
        max: 10,
        step: 0.1,
        help: 'Accident extent in miles',
      },
      City: {
        label: 'City',
        type: 'text',
        icon: <MapPin className="w-4 h-4" />,
        help: 'City name',
      },
      State: {
        label: 'State',
        type: 'text',
        icon: <MapPin className="w-4 h-4" />,
        help: 'State code (e.g., CA, NY)',
      },
      Street: {
        label: 'Street',
        type: 'text',
        icon: <Navigation className="w-4 h-4" />,
        help: 'Street name (e.g., "I-405", "Main St")',
      },
      
      // Weather
      'Temperature(F)': {
        label: 'Temperature (°F)',
        type: 'number',
        icon: <Cloud className="w-4 h-4" />,
        min: -50,
        max: 150,
        step: 0.1,
        help: 'Temperature in Fahrenheit',
      },
      'Humidity(%)': {
        label: 'Humidity (%)',
        type: 'number',
        icon: <Droplets className="w-4 h-4" />,
        min: 0,
        max: 100,
        step: 1,
        help: 'Humidity percentage (0-100)',
      },
      'Pressure(in)': {
        label: 'Pressure (inches)',
        type: 'number',
        icon: <Gauge className="w-4 h-4" />,
        min: 28,
        max: 31,
        step: 0.01,
        help: 'Air pressure in inches',
      },
      'Visibility(mi)': {
        label: 'Visibility (miles)',
        type: 'number',
        icon: <Sun className="w-4 h-4" />,
        min: 0,
        max: 20,
        step: 0.1,
        help: 'Visibility in miles',
      },
      'Wind_Speed(mph)': {
        label: 'Wind Speed (mph)',
        type: 'number',
        icon: <Wind className="w-4 h-4" />,
        min: 0,
        max: 100,
        step: 0.1,
        help: 'Wind speed in mph',
      },
      'Precipitation(in)': {
        label: 'Precipitation (inches)',
        type: 'number',
        icon: <Droplets className="w-4 h-4" />,
        min: 0,
        max: 10,
        step: 0.01,
        help: 'Precipitation amount in inches',
      },
      Weather_Condition: {
        label: 'Weather Condition',
        icon: <Cloud className="w-4 h-4" />,
        options: [
          'Fair',
          'Fog',
          'Haze',
          'Heavy Rain',
          'Light Drizzle',
          'Light Rain',
          'Light Snow',
          'Light Thunderstorms and Rain',
          'Mostly Cloudy',
          'Overcast',
          'Partly Cloudy',
          'Rain',
          'Scattered Clouds',
          'Thunderstorm',
          'Other',
        ],
        help: 'Select weather condition',
      },
      
      // Road Features
      Crossing: {
        label: 'Pedestrian Crossing',
        icon: <AlertTriangle className="w-4 h-4" />,
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Yes' },
        ],
        help: 'Is there a pedestrian crossing?',
      },
      Junction: {
        label: 'Junction',
        icon: <Navigation className="w-4 h-4" />,
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Yes' },
        ],
        help: 'Is there a junction?',
      },
      Traffic_Signal: {
        label: 'Traffic Signal',
        icon: <AlertTriangle className="w-4 h-4" />,
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Yes' },
        ],
        help: 'Is there a traffic signal?',
      },
      Stop: {
        label: 'Stop Sign',
        icon: <AlertTriangle className="w-4 h-4" />,
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Yes' },
        ],
        help: 'Is there a stop sign?',
      },
      
      // Temporal
      Hour: {
        label: 'Hour of Day',
        type: 'number',
        icon: <Clock className="w-4 h-4" />,
        min: 0,
        max: 23,
        step: 1,
        help: 'Hour (0-23, 24-hour format)',
      },
      Day_of_Week: {
        label: 'Day of Week',
        icon: <Calendar className="w-4 h-4" />,
        options: [
          { value: 0, label: 'Monday' },
          { value: 1, label: 'Tuesday' },
          { value: 2, label: 'Wednesday' },
          { value: 3, label: 'Thursday' },
          { value: 4, label: 'Friday' },
          { value: 5, label: 'Saturday' },
          { value: 6, label: 'Sunday' },
        ],
        help: 'Select day of week',
      },
      Month: {
        label: 'Month',
        type: 'number',
        icon: <Calendar className="w-4 h-4" />,
        min: 1,
        max: 12,
        step: 1,
        help: 'Month (1-12)',
      },
      Year: {
        label: 'Year',
        type: 'number',
        icon: <Calendar className="w-4 h-4" />,
        min: 2016,
        max: 2030,
        step: 1,
        help: 'Year',
      },
      Sunrise_Sunset: {
        label: 'Time of Day',
        icon: <Sun className="w-4 h-4" />,
        options: ['Day', 'Night'],
        help: 'Is it day or night?',
      },
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentFields.map((field) => {
          const config = fieldConfigs[field];
          return (
            <div key={field} className={currentFields.length === 2 ? 'md:col-span-1' : ''}>
              {renderInput(field, config)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div id="prediction-form" className="max-w-5xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <motion.div
                  className={`flex items-center gap-3 ${
                    index === currentStep
                      ? 'text-brand-blue dark:text-blue-400'
                      : index < currentStep
                      ? 'text-brand-emerald dark:text-emerald-400'
                      : 'text-gray-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      index === currentStep
                        ? 'border-brand-blue bg-brand-blue text-white'
                        : index < currentStep
                        ? 'border-brand-emerald bg-brand-emerald text-white'
                        : 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600'
                    } transition-all duration-300`}
                    animate={
                      index === currentStep
                        ? { scale: [1, 1.1, 1] }
                        : {}
                    }
                    transition={{ duration: 0.5, repeat: index === currentStep ? Infinity : 0 }}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </motion.div>
                  <span className="hidden md:block font-semibold text-sm">
                    {step.title}
                  </span>
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-2">
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-brand-blue to-brand-emerald"
                        initial={{ width: '0%' }}
                        animate={{
                          width: index < currentStep ? '100%' : '0%',
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {steps[currentStep].title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {steps[currentStep].description}
                </p>
              </div>
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
              whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
            >
              <span className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Previous
              </span>
            </motion.button>

            {currentStep < steps.length - 1 ? (
              <motion.button
                type="button"
                onClick={nextStep}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  Next
                  <ArrowRight className="w-5 h-5" />
                </span>
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!loading ? { scale: 1.05 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
              >
                <span className="flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Get Prediction
                    </>
                  )}
                </span>
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EnhancedPredictionForm;
