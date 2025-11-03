import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Trash2,
  Download,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  X,
} from 'lucide-react';

const PredictionHistory = ({ history, clearHistory, onCompare }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const getRiskIcon = (level) => {
    switch (level) {
      case 'High':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'Medium':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'Low':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRiskColors = (level) => {
    switch (level) {
      case 'High':
        return {
          bg: 'bg-red-50 dark:bg-red-900/10',
          border: 'border-red-500',
          text: 'text-red-700 dark:text-red-400',
          badge: 'bg-red-500',
        };
      case 'Medium':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/10',
          border: 'border-orange-500',
          text: 'text-orange-700 dark:text-orange-400',
          badge: 'bg-orange-500',
        };
      case 'Low':
        return {
          bg: 'bg-green-50 dark:bg-green-900/10',
          border: 'border-green-500',
          text: 'text-green-700 dark:text-green-400',
          badge: 'bg-green-500',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/10',
          border: 'border-gray-500',
          text: 'text-gray-700 dark:text-gray-400',
          badge: 'bg-gray-500',
        };
    }
  };

  // Filter history
  const filteredHistory = history.filter((entry) => {
    const matchesSearch =
      searchTerm === '' ||
      entry.risk_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.timestamp && entry.timestamp.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter =
      filterRisk === 'all' || entry.risk_level === filterRisk;

    return matchesSearch && matchesFilter;
  });

  // Toggle item selection for comparison
  const toggleSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle compare
  const handleCompare = () => {
    if (selectedItems.length === 2) {
      const items = history.filter((h) => selectedItems.includes(h.id));
      onCompare(items);
    }
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Risk Level', 'Severity Score', 'Confidence'];
    const rows = filteredHistory.map((entry) => [
      entry.timestamp,
      entry.risk_level,
      entry.severity_score,
      (entry.confidence * 100).toFixed(2) + '%',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safestride-history-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center py-16"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <History className="w-20 h-20 mx-auto text-gray-400 mb-4" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
          No Predictions Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Make your first prediction to start building your history
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <History className="w-7 h-7 text-brand-blue" />
              Prediction History
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredHistory.length} of {history.length} predictions
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-4 h-4" />
              Filters
            </motion.button>

            {selectedItems.length === 2 && (
              <motion.button
                onClick={handleCompare}
                className="btn-primary flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <TrendingUp className="w-4 h-4" />
                Compare Selected
              </motion.button>
            )}

            <motion.button
              onClick={exportToCSV}
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </motion.button>

            <motion.button
              onClick={clearHistory}
              className="btn-danger flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search predictions..."
                    className="input-field pl-10"
                  />
                </div>

                {/* Risk Filter */}
                <div>
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="High">High Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="Low">Low Risk</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Selection Info */}
      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-500 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              {selectedItems.length} prediction{selectedItems.length > 1 ? 's' : ''} selected
              {selectedItems.length === 2 && ' - Click "Compare Selected" to compare'}
            </p>
            <button
              onClick={() => setSelectedItems([])}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* History Timeline */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredHistory.map((entry, index) => {
            const colors = getRiskColors(entry.risk_level);
            const isSelected = selectedItems.includes(entry.id);

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`card border-l-4 ${colors.border} ${colors.bg} ${
                  isSelected ? 'ring-4 ring-brand-blue/50' : ''
                } cursor-pointer hover:shadow-xl transition-all duration-300`}
                onClick={() => toggleSelection(entry.id)}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Risk Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${colors.badge} bg-opacity-10`}>
                      {getRiskIcon(entry.risk_level)}
                    </div>

                    <div className="flex-1">
                      {/* Risk Level Badge */}
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${colors.badge} text-white`}
                        >
                          {entry.risk_level} Risk
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {entry.timestamp
                            ? new Date(entry.timestamp).toLocaleString()
                            : 'Unknown time'}
                        </span>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Severity Score
                          </p>
                          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {(entry.severity_score * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Confidence
                          </p>
                          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {(entry.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                        {entry.risk_factors && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Top Risk Factors
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {Object.keys(entry.risk_factors)
                                .slice(0, 2)
                                .join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Selection Checkbox */}
                  <div className="flex-shrink-0">
                    <motion.div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-brand-blue border-brand-blue'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      animate={{ scale: isSelected ? [1, 1.2, 1] : 1 }}
                    >
                      {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {filteredHistory.length === 0 && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No predictions match your filters</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterRisk('all');
            }}
            className="btn-secondary mt-4"
          >
            Clear Filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default PredictionHistory;
