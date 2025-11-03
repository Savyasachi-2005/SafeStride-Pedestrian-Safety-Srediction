import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.message);
    
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.detail || error.response.data?.message || 'Server error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Error in request setup
      throw new Error(error.message || 'Failed to make request');
    }
  }
);

// API Service Methods
export const apiService = {
  /**
   * Make a single prediction
   * @param {Object} inputData - Input features for prediction
   * @returns {Promise} Prediction result
   */
  async predict(inputData) {
    try {
      const response = await api.post('/api/predict', inputData);
      return response.data;
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  },

  /**
   * Make batch predictions
   * @param {Array} predictions - Array of prediction inputs
   * @returns {Promise} Batch prediction results
   */
  async batchPredict(predictions) {
    try {
      const response = await api.post('/api/batch-predict', { predictions });
      return response.data;
    } catch (error) {
      console.error('Batch prediction error:', error);
      throw error;
    }
  },

  /**
   * Check API health
   * @returns {Promise} Health status
   */
  async checkHealth() {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },

  /**
   * Get model metrics
   * @returns {Promise} Model performance metrics
   */
  async getMetrics() {
    try {
      const response = await api.get('/api/metrics');
      return response.data;
    } catch (error) {
      console.error('Get metrics error:', error);
      throw error;
    }
  },

  /**
   * Get feature template
   * @returns {Promise} Feature template with default values
   */
  async getFeatureTemplate() {
    try {
      const response = await api.get('/api/feature-template');
      return response.data;
    } catch (error) {
      console.error('Get template error:', error);
      throw error;
    }
  },
};

export default api;
