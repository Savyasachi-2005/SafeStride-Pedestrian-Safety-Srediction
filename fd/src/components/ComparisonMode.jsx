import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Download,
  ArrowRight,
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';

const ComparisonMode = ({ predictions, onClose }) => {
  if (!predictions || predictions.length !== 2) {
    return null;
  }

  const [pred1, pred2] = predictions;

  const getRiskConfig = (level) => {
    switch (level) {
      case 'High':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bg: 'bg-red-50 dark:bg-red-900/10',
          badge: 'bg-red-500',
        };
      case 'Medium':
        return {
          icon: AlertCircle,
          color: 'text-orange-600',
          bg: 'bg-orange-50 dark:bg-orange-900/10',
          badge: 'bg-orange-500',
        };
      case 'Low':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50 dark:bg-green-900/10',
          badge: 'bg-green-500',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-50 dark:bg-gray-900/10',
          badge: 'bg-gray-500',
        };
    }
  };

  const config1 = getRiskConfig(pred1.risk_level);
  const config2 = getRiskConfig(pred2.risk_level);

  // Calculate differences
  const severityDiff = ((pred2.severity_score - pred1.severity_score) * 100).toFixed(2);
  const confidenceDiff = ((pred2.confidence - pred1.confidence) * 100).toFixed(2);

  const getDiffIndicator = (diff) => {
    const numDiff = parseFloat(diff);
    if (numDiff > 0) {
      return {
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'text-red-600',
        text: `+${diff}%`,
      };
    } else if (numDiff < 0) {
      return {
        icon: <TrendingDown className="w-4 h-4" />,
        color: 'text-green-600',
        text: `${diff}%`,
      };
    } else {
      return {
        icon: <Minus className="w-4 h-4" />,
        color: 'text-gray-600',
        text: 'Same',
      };
    }
  };

  const severityIndicator = getDiffIndicator(severityDiff);
  const confidenceIndicator = getDiffIndicator(confidenceDiff);

  // Comparison chart data
  const chartData = {
    labels: ['Severity Score', 'Confidence'],
    datasets: [
      {
        label: 'Prediction 1',
        data: [pred1.severity_score * 100, pred1.confidence * 100],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'Prediction 2',
        data: [pred2.severity_score * 100, pred2.confidence * 100],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#6b7280',
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#6b7280',
          callback: (value) => `${value}%`,
        },
      },
      x: {
        ticks: { color: '#6b7280' },
      },
    },
  };

  const exportComparison = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('SafeStride Prediction Comparison', pageWidth / 2, 20, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });

    // Prediction 1
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Prediction 1', 20, 45);
    doc.setFontSize(11);
    doc.text(`Risk Level: ${pred1.risk_level}`, 20, 55);
    doc.text(`Severity: ${(pred1.severity_score * 100).toFixed(2)}%`, 20, 62);
    doc.text(`Confidence: ${(pred1.confidence * 100).toFixed(2)}%`, 20, 69);
    doc.text(`Time: ${new Date(pred1.timestamp).toLocaleString()}`, 20, 76);

    // Prediction 2
    doc.setFontSize(14);
    doc.text('Prediction 2', 20, 95);
    doc.setFontSize(11);
    doc.text(`Risk Level: ${pred2.risk_level}`, 20, 105);
    doc.text(`Severity: ${(pred2.severity_score * 100).toFixed(2)}%`, 20, 112);
    doc.text(`Confidence: ${(pred2.confidence * 100).toFixed(2)}%`, 20, 119);
    doc.text(`Time: ${new Date(pred2.timestamp).toLocaleString()}`, 20, 126);

    // Differences
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text('Differences', 20, 145);
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Severity Difference: ${severityDiff}%`, 20, 155);
    doc.text(`Confidence Difference: ${confidenceDiff}%`, 20, 162);

    doc.save(`safestride-comparison-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-brand-blue" />
                Prediction Comparison
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Side-by-side analysis of two predictions
              </p>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={exportComparison}
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={onClose}
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Side by Side Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prediction 1 */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`card ${config1.bg} border-l-4 border-${config1.badge.replace('bg-', '')}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <config1.icon className={`w-8 h-8 ${config1.color}`} />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Prediction 1
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(pred1.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className={`inline-block px-4 py-2 rounded-full ${config1.badge} text-white font-bold mb-4`}>
                {pred1.risk_level} Risk
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Severity Score
                  </span>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {(pred1.severity_score * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Confidence
                  </span>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {(pred1.confidence * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Prediction 2 */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`card ${config2.bg} border-l-4 border-${config2.badge.replace('bg-', '')}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <config2.icon className={`w-8 h-8 ${config2.color}`} />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Prediction 2
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(pred2.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className={`inline-block px-4 py-2 rounded-full ${config2.badge} text-white font-bold mb-4`}>
                {pred2.risk_level} Risk
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Severity Score
                  </span>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {(pred2.severity_score * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Confidence
                  </span>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {(pred2.confidence * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Differences Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <ArrowRight className="w-6 h-6 text-brand-blue" />
              Key Differences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Severity Change</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {severityIndicator.text}
                  </span>
                  <span className={severityIndicator.color}>{severityIndicator.icon}</span>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Confidence Change</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {confidenceIndicator.text}
                  </span>
                  <span className={confidenceIndicator.color}>{confidenceIndicator.icon}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Comparison Chart */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Visual Comparison
            </h3>
            <div className="h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Analysis */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="card bg-gradient-to-r from-brand-blue to-blue-600 text-white"
          >
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Quick Analysis
            </h3>
            <div className="space-y-2 text-sm opacity-90">
              {pred1.risk_level !== pred2.risk_level && (
                <p>
                  • Risk level changed from <strong>{pred1.risk_level}</strong> to{' '}
                  <strong>{pred2.risk_level}</strong>
                </p>
              )}
              {Math.abs(parseFloat(severityDiff)) > 10 && (
                <p>
                  • Significant severity change detected ({severityDiff}% difference)
                </p>
              )}
              {parseFloat(confidenceDiff) > 0 && (
                <p>• Model confidence increased in second prediction</p>
              )}
              {parseFloat(confidenceDiff) < 0 && (
                <p>• Model confidence decreased in second prediction</p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ComparisonMode;
