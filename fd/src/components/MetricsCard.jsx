import React from 'react';
import { TrendingUp, Target, Zap, Award } from 'lucide-react';

const MetricsCard = ({ metrics }) => {
  if (!metrics || !metrics.metrics) {
    return (
      <div className="card">
        <p className="text-center text-gray-500">Loading metrics...</p>
      </div>
    );
  }

  const modelMetrics = metrics.metrics;
  
  // Extract common metric names (adjust based on your actual metrics)
  const getMetricValue = (key) => {
    if (modelMetrics[key] !== undefined) {
      return (modelMetrics[key] * 100).toFixed(2);
    }
    return 'N/A';
  };

  const metricsData = [
    {
      name: 'Accuracy',
      value: getMetricValue('accuracy') || getMetricValue('test_accuracy'),
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      name: 'F1 Score',
      value: getMetricValue('f1_score') || getMetricValue('f1'),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      name: 'Precision',
      value: getMetricValue('precision'),
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      name: 'Recall',
      value: getMetricValue('recall'),
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Model Info Header */}
      <div className="card">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">{metrics.model_name || 'SafeStride Model'}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Version: {metrics.model_version || '1.0.0'}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={`card ${metric.bgColor} border-l-4 ${
                metric.color.replace('text-', 'border-')
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-8 h-8 ${metric.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {metric.name}
                </p>
                <p className="text-3xl font-bold">
                  {metric.value !== 'N/A' ? `${metric.value}%` : 'N/A'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Metrics (if available) */}
      {Object.keys(modelMetrics).length > 4 && (
        <div className="card">
          <h4 className="font-semibold mb-3">Additional Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {Object.entries(modelMetrics).map(([key, value]) => {
              // Skip metrics already shown above
              if (['accuracy', 'test_accuracy', 'f1_score', 'f1', 'precision', 'recall'].includes(key)) {
                return null;
              }
              
              return (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="font-semibold">
                    {typeof value === 'number' 
                      ? value < 1 
                        ? (value * 100).toFixed(2) + '%'
                        : value.toFixed(4)
                      : value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Indicator */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="text-center">
          <Award className="w-12 h-12 mx-auto mb-3" />
          <h4 className="font-bold text-lg mb-2">Model Performance</h4>
          <p className="text-sm opacity-90">
            This model has been trained and optimized for accurate pedestrian accident risk prediction
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;
