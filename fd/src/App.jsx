import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedHeader from './components/EnhancedHeader';
import HeroSection from './components/HeroSection';
import EnhancedPredictionForm from './components/EnhancedPredictionForm';
import EnhancedResultDisplay from './components/EnhancedResultDisplay';
import PredictionHistory from './components/PredictionHistory';
import ComparisonMode from './components/ComparisonMode';
import { LoadingSpinner } from './components/LoadingComponents';
import MetricsCard from './components/MetricsCard';
import { apiService } from './services/api';
import { Clock, BarChart3, History, Home, AlertCircle, X } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('safestride_theme');
    return saved === 'dark';
  });
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonPredictions, setComparisonPredictions] = useState(null);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('safestride_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('safestride_theme', 'light');
    }
  }, [darkMode]);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('safestride_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('safestride_history', JSON.stringify(history));
    }
  }, [history]);

  // Check API health on mount
  useEffect(() => {
    checkApiHealth();
    loadModelMetrics();
  }, []);

  const checkApiHealth = async () => {
    try {
      const health = await apiService.checkHealth();
      setApiHealth(health);
    } catch (error) {
      console.error('Health check failed:', error);
      setApiHealth({ status: 'error', message: error.message });
    }
  };

  const loadModelMetrics = async () => {
    try {
      const metrics = await apiService.getMetrics();
      setModelMetrics(metrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handlePrediction = async (formData) => {
    setLoading(true);
    setError(null);
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await apiService.predict(formData);
      setPredictionResult(result);
      setActiveTab('result');
      
      // Scroll to result section after a brief delay
      setTimeout(() => {
        const resultSection = document.getElementById('result-section');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } catch (error) {
      console.error('Prediction failed:', error);
      setError(error.message || 'Failed to make prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPrediction = () => {
    setPredictionResult(null);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToHistory = (result) => {
    const newEntry = {
      ...result,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [newEntry, ...prev].slice(0, 10)); // Keep last 10
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('safestride_history');
    }
  };

  const handleCompare = (predictions) => {
    setComparisonPredictions(predictions);
    setComparisonMode(true);
  };

  const closeComparison = () => {
    setComparisonMode(false);
    setComparisonPredictions(null);
  };

  // Navigation tabs
  const tabs = [
    { id: 'predict', name: 'New Prediction', icon: Home },
    { id: 'result', name: 'Results', icon: BarChart3, disabled: !predictionResult },
    { id: 'metrics', name: 'Model Metrics', icon: BarChart3 },
    { id: 'history', name: 'History', icon: History },
  ];

  const handleNavigation = (action) => {
    switch (action) {
      case 'home':
        setPredictionResult(null);
        setActiveTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'predict':
        setPredictionResult(null);
        setActiveTab('home');
        setTimeout(() => {
          document.getElementById('prediction-form')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
        break;
      case 'history':
        setActiveTab('history');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark transition-colors duration-300 custom-scrollbar">
      <EnhancedHeader 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        apiHealth={apiHealth}
        onNavigate={handleNavigation}
      />

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-24 right-4 z-50 max-w-md"
          >
            <div className="bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">Prediction Failed</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>

        {/* Hero Section */}
        {activeTab === 'home' && !predictionResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroSection modelMetrics={modelMetrics} />
          </motion.div>
        )}

        {/* Prediction Form Section */}
        {activeTab === 'home' && !predictionResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <EnhancedPredictionForm onSubmit={handlePrediction} loading={loading} />
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl"
            >
              <LoadingSpinner message="Analyzing risk factors..." />
            </motion.div>
          </motion.div>
        )}

        {/* Result Section */}
        <AnimatePresence>
          {activeTab === 'result' && predictionResult && (
            <motion.div
              id="result-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EnhancedResultDisplay
                result={predictionResult}
                onNewPrediction={handleNewPrediction}
                addToHistory={addToHistory}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Section */}
        <AnimatePresence>
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-4 py-12"
            >
              <PredictionHistory
                history={history}
                clearHistory={clearHistory}
                onCompare={handleCompare}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison Modal */}
        <AnimatePresence>
          {comparisonMode && comparisonPredictions && (
            <ComparisonMode
              predictions={comparisonPredictions}
              onClose={closeComparison}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Enhanced Footer */}
      <motion.footer
        className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 mt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 to-blue-500/5 dark:from-brand-blue/10 dark:to-blue-500/10" />
        <div className="relative container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                SafeStride
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                AI-powered pedestrian safety prediction system. Making roads safer
                through intelligent risk assessment.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                Technology
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• XGBoost Machine Learning</li>
                <li>• FastAPI Backend</li>
                <li>• React + Framer Motion</li>
                <li>• Real-time Prediction</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                Model Info
              </h3>
              {modelMetrics ? (
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• {modelMetrics.model_name}</li>
                  <li>• Version: {modelMetrics.model_version}</li>
                  <li>• Accuracy: {(modelMetrics.metrics.test_accuracy * 100).toFixed(2)}%</li>
                  <li>• F1 Score: {(modelMetrics.metrics.f1_score * 100).toFixed(2)}%</li>
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Loading...</p>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              SafeStride © {new Date().getFullYear()} - Pedestrian Safety Prediction
              System
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
              Built with ❤️ for safer roads
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;
