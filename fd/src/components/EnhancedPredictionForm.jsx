import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Cloud, Sun, Car, AlertTriangle,
  Navigation, Clock, Wind, Droplets, CheckCircle,
  ArrowRight, ArrowLeft, Loader
} from 'lucide-react';

const EnhancedPredictionForm = ({ onSubmit, loading }) => {
  const [currentStep, setCurrentStep] = useState(0);
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

  const [validatedFields, setValidatedFields] = useState({});

  const steps = [
    {
      title: 'Location Details',
      icon: <MapPin className="w-6 h-6" />,
      fields: ['Latitude', 'Longitude', 'Urban_or_Rural_Area'],
    },
    {
      title: 'Time & Environment',
      icon: <Clock className="w-6 h-6" />,
      fields: ['Time', 'Day_of_Week', 'Weather_Conditions', 'Light_Conditions'],
    },
    {
      title: 'Road Conditions',
      icon: <Car className="w-6 h-6" />,
      fields: [
        'Road_Type',
        'Road_Surface_Conditions',
        'Speed_limit',
        'Junction_Detail',
        'Junction_Control',
        'Pedestrian_Crossing',
        'Carriageway_Hazards',
      ],
    },
    {
      title: 'Incident Details',
      icon: <AlertTriangle className="w-6 h-6" />,
      fields: ['Number_of_Vehicles', 'Number_of_Casualties'],
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue =
      ['Speed_limit', 'Number_of_Vehicles', 'Number_of_Casualties', 'Latitude', 'Longitude'].includes(name)
        ? parseFloat(value) || 0
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Validate field
    setValidatedFields((prev) => ({
      ...prev,
      [name]: value !== '' && value !== null,
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

  const renderInput = (name, label, type = 'text', icon = null, options = null) => {
    const value = formData[name];
    const isValid = validatedFields[name];

    if (options) {
      return (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <span className="flex items-center gap-2">
              {icon}
              {label}
            </span>
          </label>
          <div className="relative">
            <select
              name={name}
              value={value}
              onChange={handleChange}
              className="input-field appearance-none pr-10"
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <motion.div
                animate={{ rotate: isValid ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {isValid && <CheckCircle className="w-5 h-5 text-brand-emerald" />}
              </motion.div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <span className="flex items-center gap-2">
            {icon}
            {label}
          </span>
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            className="input-field"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
          {isValid && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <CheckCircle className="w-5 h-5 text-brand-emerald" />
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderStepContent = () => {
    const currentFields = steps[currentStep].fields;

    const fieldConfigs = {
      Latitude: { label: 'Latitude', type: 'number', icon: <Navigation className="w-4 h-4" /> },
      Longitude: { label: 'Longitude', type: 'number', icon: <Navigation className="w-4 h-4" /> },
      Urban_or_Rural_Area: {
        label: 'Area Type',
        icon: <MapPin className="w-4 h-4" />,
        options: ['Urban', 'Rural'],
      },
      Time: { label: 'Time', type: 'time', icon: <Clock className="w-4 h-4" /> },
      Day_of_Week: {
        label: 'Day of Week',
        icon: <Calendar className="w-4 h-4" />,
        options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      Weather_Conditions: {
        label: 'Weather Conditions',
        icon: <Cloud className="w-4 h-4" />,
        options: [
          'Fine',
          'Raining',
          'Snowing',
          'Fine + high winds',
          'Raining + high winds',
          'Snowing + high winds',
          'Fog or mist',
          'Other',
          'Unknown',
        ],
      },
      Light_Conditions: {
        label: 'Light Conditions',
        icon: <Sun className="w-4 h-4" />,
        options: [
          'Daylight',
          'Darkness - lights lit',
          'Darkness - lights unlit',
          'Darkness - no lighting',
          'Darkness - lighting unknown',
        ],
      },
      Road_Type: {
        label: 'Road Type',
        icon: <Car className="w-4 h-4" />,
        options: [
          'Single carriageway',
          'Dual carriageway',
          'Roundabout',
          'One way street',
          'Slip road',
          'Unknown',
        ],
      },
      Road_Surface_Conditions: {
        label: 'Road Surface',
        icon: <Droplets className="w-4 h-4" />,
        options: ['Dry', 'Wet or damp', 'Snow', 'Frost or ice', 'Flood over 3cm deep'],
      },
      Speed_limit: { label: 'Speed Limit (mph)', type: 'number', icon: <Car className="w-4 h-4" /> },
      Junction_Detail: {
        label: 'Junction Detail',
        icon: <Car className="w-4 h-4" />,
        options: [
          'Not at junction',
          'Roundabout',
          'Mini-roundabout',
          'T or staggered junction',
          'Crossroads',
          'Slip road',
          'Multiple junction',
          'Other junction',
        ],
      },
      Junction_Control: {
        label: 'Junction Control',
        icon: <AlertTriangle className="w-4 h-4" />,
        options: [
          'Not at junction',
          'Authorised person',
          'Auto traffic signal',
          'Stop sign',
          'Give way or uncontrolled',
        ],
      },
      Pedestrian_Crossing: {
        label: 'Pedestrian Crossing',
        icon: <MapPin className="w-4 h-4" />,
        options: [
          'No physical crossing',
          'Zebra',
          'Pelican, puffin, toucan or similar',
          'Pedestrian phase at traffic signal',
          'Footbridge or subway',
          'Central refuge',
        ],
      },
      Carriageway_Hazards: {
        label: 'Carriageway Hazards',
        icon: <AlertTriangle className="w-4 h-4" />,
        options: [
          'None',
          'Vehicle load on road',
          'Other object on road',
          'Previous accident',
          'Pedestrian in carriageway',
          'Animal in carriageway',
        ],
      },
      Number_of_Vehicles: {
        label: 'Number of Vehicles',
        type: 'number',
        icon: <Car className="w-4 h-4" />,
      },
      Number_of_Casualties: {
        label: 'Number of Casualties',
        type: 'number',
        icon: <AlertTriangle className="w-4 h-4" />,
      },
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentFields.map((field) => {
          const config = fieldConfigs[field];
          return (
            <div key={field}>
              {renderInput(
                field,
                config.label,
                config.type,
                config.icon,
                config.options
              )}
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
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                {steps[currentStep].title}
              </h3>
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
