import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Shield,
  Download,
  RefreshCw,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EnhancedResultDisplay = ({ result, onNewPrediction }) => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    if (result) {
      // Animate progress - use confidence as the main score display
      const timer = setTimeout(() => {
        const scoreValue = result.confidence * 100;
        setProgressValue(scoreValue);
      }, 300);

      // Trigger confetti for low risk
      if (result.risk_level === 'Low') {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#6ee7b7'],
          });
        }, 500);
      }

      // Shake animation for high risk
      if (result.risk_level === 'High') {
        const element = document.getElementById('risk-card');
        if (element) {
          element.classList.add('animate-bounce-in');
        }
      }

      return () => clearTimeout(timer);
    }
  }, [result]);

  if (!result) return null;

  // Handle new binary API response format
  const prediction = result.prediction || 'Low Risk'; // "High Risk" or "Low Risk"
  const label = result.label || 0; // 1 or 0
  const probability = result.probability || 0;
  const raw_proba = result.raw_proba || [0, 0]; // [prob_low, prob_high]
  
  // Convert to old format for compatibility
  const risk_level = prediction.includes('High') ? 'HIGH' : 'LOW';
  const confidence = probability;
  const probability_distribution = {
    'Low Risk': raw_proba[0],
    'High Risk': raw_proba[1],
  };
  const predicted_severity = risk_level;
    
  // Handle risk_factors - API returns array
  const risk_factors_array = result.risk_factors || [];
  const risk_factors = risk_factors_array.length > 0 
    ? risk_factors_array.reduce((acc, factor, index) => {
        acc[factor] = 0.7 - (index * 0.1); // Assign decreasing values for visualization
        return acc;
      }, {})
    : {};
    
  const recommendations = result.recommendations || [];

  const getRiskConfig = () => {
    const normalizedRiskLevel = risk_level.toUpperCase();
    
    // Binary classification: only HIGH and LOW
    switch (normalizedRiskLevel) {
      case 'HIGH':
        return {
          gradient: 'from-red-500 via-red-600 to-red-700',
          bg: 'bg-red-50 dark:bg-red-900/10',
          border: 'border-red-500',
          text: 'text-red-700 dark:text-red-400',
          icon: AlertTriangle,
          ringColor: '#ef4444',
          message: 'High risk detected! Exercise extreme caution.',
          displayName: 'High Risk',
        };
      case 'LOW':
      default:
        return {
          gradient: 'from-emerald-500 via-green-600 to-teal-700',
          bg: 'bg-emerald-50 dark:bg-emerald-900/10',
          border: 'border-emerald-500',
          text: 'text-emerald-700 dark:text-emerald-400',
          icon: CheckCircle,
          ringColor: '#10b981',
          message: 'Low risk detected. Stay alert and follow safety guidelines.',
          displayName: 'Low Risk',
        };
    }
  };

  const config = getRiskConfig();
  const RiskIcon = config.icon;

  // Circular progress ring
  const CircularProgress = ({ value, color }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="stroke-gray-200 dark:stroke-gray-700"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
    );
  };

  // Chart data
  const chartData = {
    labels: risk_factors ? Object.keys(risk_factors).slice(0, 5) : [],
    datasets: [
      {
        label: 'Risk Contribution',
        data: risk_factors ? Object.values(risk_factors).slice(0, 5) : [],
        backgroundColor: (context) => {
          const value = context.parsed.y;
          if (value > 0.7) return 'rgba(239, 68, 68, 0.8)';
          if (value > 0.4) return 'rgba(245, 158, 11, 0.8)';
          return 'rgba(16, 185, 129, 0.8)';
        },
        borderColor: (context) => {
          const value = context.parsed.y;
          if (value > 0.7) return 'rgba(239, 68, 68, 1)';
          if (value > 0.4) return 'rgba(245, 158, 11, 1)';
          return 'rgba(16, 185, 129, 1)';
        },
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => `Impact: ${(context.parsed.y * 100).toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 1,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          callback: (value) => `${(value * 100).toFixed(0)}%`,
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('SafeStride', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Risk Assessment Report', pageWidth / 2, 30, { align: 'center' });

    // Date
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 36, { align: 'center' });

    // Risk Level
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Risk Assessment', 20, 55);

    doc.setFontSize(28);
    if (risk_level === 'HIGH') doc.setTextColor(220, 38, 38);
    else doc.setTextColor(34, 197, 94);
    doc.text(config.displayName, 20, 70);

    // Metrics
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Predicted Severity: ${predicted_severity}`, 20, 85);
    doc.text(`Confidence: ${(confidence * 100).toFixed(2)}%`, 20, 95);

    // Recommendations
    if (recommendations && recommendations.length > 0) {
      doc.setFontSize(14);
      doc.text('Safety Recommendations:', 20, 115);
      
      doc.setFontSize(11);
      let yPos = 125;
      recommendations.forEach((rec, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 7;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('© 2025 SafeStride - AI-Powered Road Safety', pageWidth / 2, 280, {
      align: 'center',
    });

    doc.save(`SafeStride_Risk_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Risk Card */}
          <motion.div
            id="risk-card"
            className={`card mb-8 relative overflow-hidden`}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5`}
            />

            <div className="relative z-10">
              {/* Header with icon */}
              <div className="flex items-start justify-between mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                >
                  <motion.div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${config.gradient} shadow-2xl`}
                    animate={
                      risk_level === 'High'
                        ? { rotate: [0, -10, 10, -10, 0] }
                        : {}
                    }
                    transition={{ duration: 0.5, repeat: risk_level === 'High' ? Infinity : 0, repeatDelay: 2 }}
                  >
                    <RiskIcon className="w-10 h-10 text-white" />
                  </motion.div>
                </motion.div>

                <div className="flex gap-3">
                  <motion.button
                    className="btn-secondary"
                    onClick={exportToPDF}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    className="btn-primary"
                    onClick={onNewPrediction}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Risk Level Display */}
              <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                {/* Left: Circular Progress */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <CircularProgress
                      value={progressValue}
                      color={config.ringColor}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        className="text-5xl font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                      >
                        <span className={config.text}>
                          {(confidence * 100).toFixed(1)}%
                        </span>
                      </motion.div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                        Confidence
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Details */}
                <div>
                  <motion.h2
                    className="text-4xl font-bold mb-4"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className={config.text}>{config.displayName} Risk</span>
                  </motion.h2>
                  
                  {predicted_severity && (
                    <motion.div
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg mb-4"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Predicted Severity:
                      </span>
                      <span className="text-lg font-bold text-brand-blue">
                        {predicted_severity}
                      </span>
                    </motion.div>
                  )}

                  <motion.p
                    className="text-lg text-gray-600 dark:text-gray-300 mb-6"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {config.message}
                  </motion.p>

                  <motion.div
                    className="space-y-3"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Confidence Level
                      </span>
                      <span className="text-2xl font-bold text-brand-blue">
                        {(confidence * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className={`flex items-center gap-3 p-4 ${config.bg} rounded-xl border-2 ${config.border}`}>
                      <Shield className={`w-6 h-6 ${config.text}`} />
                      <span className={`font-semibold ${config.text}`}>
                        Risk Level: {config.displayName}
                      </span>
                    </div>
                    
                    {/* Probability Distribution */}
                    {probability_distribution && Object.keys(probability_distribution).length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Probability Distribution:
                        </p>
                        {Object.entries(probability_distribution).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {key}:
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full ${
                                    key === 'Fatal' ? 'bg-red-500' :
                                    key === 'Serious' ? 'bg-orange-500' :
                                    'bg-green-500'
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${value * 100}%` }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-12 text-right">
                                {(value * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Risk Factors Chart */}
          {risk_factors && Object.keys(risk_factors).length > 0 && (
            <motion.div
              className="card mb-8"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-brand-blue" />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Contributing Risk Factors
                </h3>
              </div>
              <div className="h-80">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </motion.div>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <motion.div
              className="card"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-brand-amber" />
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Safety Recommendations
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: showRecommendations ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showRecommendations && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 space-y-4 overflow-hidden"
                  >
                    {recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {rec}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EnhancedResultDisplay;
