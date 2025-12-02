import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Award, BarChart3, Users, Database } from 'lucide-react';

const MetricsCard = ({ metrics }) => {
  if (!metrics || !metrics.metrics) {
    return (
      <div className="card">
        <p className="text-center text-gray-500">Loading metrics...</p>
      </div>
    );
  }

  const modelMetrics = metrics.metrics;
  
  // Main performance metrics
  const performanceMetrics = [
    {
      name: 'Test Accuracy',
      value: modelMetrics.test_accuracy,
      icon: Target,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-500',
    },
    {
      name: 'F1 Score',
      value: modelMetrics.f1_score,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      borderColor: 'border-blue-500',
    },
    {
      name: 'ROC-AUC',
      value: modelMetrics.roc_auc,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      borderColor: 'border-purple-500',
    },
    {
      name: 'Precision',
      value: modelMetrics.precision,
      icon: Zap,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20',
      borderColor: 'border-amber-500',
    },
  ];

  // Additional metrics
  const additionalMetrics = [
    {
      name: 'Sensitivity (Recall)',
      value: modelMetrics.sensitivity,
      suffix: '%',
    },
    {
      name: 'Specificity',
      value: modelMetrics.specificity,
      suffix: '%',
    },
  ];

  // Dataset info
  const datasetInfo = [
    {
      name: 'Training Samples',
      value: modelMetrics.n_samples_train?.toLocaleString() || 'N/A',
      icon: Users,
      color: 'text-green-600',
    },
    {
      name: 'Test Samples',
      value: modelMetrics.n_samples_test?.toLocaleString() || 'N/A',
      icon: Database,
      color: 'text-blue-600',
    },
    {
      name: 'Features',
      value: modelMetrics.n_features || 'N/A',
      icon: BarChart3,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Model Info Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-brand-blue to-blue-600 text-white"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Award className="w-16 h-16" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">
            {metrics.model_name || 'SafeStride Model'}
          </h2>
          <p className="text-sm opacity-90 mb-1">
            Version: {metrics.model_version || '1.0.0'}
          </p>
          <p className="text-sm opacity-90">
            Dataset: {metrics.dataset || 'US Accidents (2016-2023)'}
          </p>
          {metrics.classes && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {metrics.classes.map((cls, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold"
                >
                  {cls}
                </span>
              ))}\n            </div>
          )}
        </div>
      </motion.div>

      {/* Performance Metrics Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Model Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const value = metric.value !== undefined && metric.value !== null
              ? (metric.value * 100).toFixed(2)
              : 'N/A';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`card ${metric.bgColor} border-l-4 ${metric.borderColor} hover:shadow-xl transition-shadow`}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-8 h-8 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    {metric.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {value !== 'N/A' ? `${value}%` : 'N/A'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Additional Classification Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">
          Classification Metrics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {additionalMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {metric.name}
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {metric.value !== undefined && metric.value !== null
                  ? `${(metric.value * 100).toFixed(2)}${metric.suffix || ''}`
                  : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Dataset Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">
          Dataset Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {datasetInfo.map((info, idx) => {
            const Icon = info.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl"
              >
                <Icon className={`w-10 h-10 ${info.color}`} />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {info.name}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {info.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card bg-gradient-to-r from-green-500 to-emerald-600 text-white"
      >
        <div className="flex items-center gap-4">
          <Award className="w-12 h-12 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-2">Excellent Performance</h4>
            <p className="text-sm opacity-90">
              This binary classification model achieves high accuracy in predicting
              accident severity, with strong performance across all key metrics.
              The high ROC-AUC score ({(modelMetrics.roc_auc * 100).toFixed(2)}%)
              indicates excellent discrimination between risk levels.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MetricsCard;
