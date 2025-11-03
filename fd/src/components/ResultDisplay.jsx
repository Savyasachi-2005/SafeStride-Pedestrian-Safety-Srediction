import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  FileText,
  Download,
} from 'lucide-react';
import jsPDF from 'jspdf';

const ResultDisplay = ({ result, onNewPrediction, addToHistory }) => {
  if (!result) return null;

  const { risk_level, severity_score, confidence, risk_factors, recommendations, prediction_probabilities } = result;

  // Determine color scheme based on risk level
  const getRiskColors = () => {
    switch (risk_level) {
      case 'High':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-500',
          text: 'text-red-700 dark:text-red-400',
          icon: 'text-red-600',
          gradient: 'from-red-500 to-red-700',
        };
      case 'Medium':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/20',
          border: 'border-orange-500',
          text: 'text-orange-700 dark:text-orange-400',
          icon: 'text-orange-600',
          gradient: 'from-orange-500 to-orange-700',
        };
      case 'Low':
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          border: 'border-green-500',
          text: 'text-green-700 dark:text-green-400',
          icon: 'text-green-600',
          gradient: 'from-green-500 to-green-700',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          border: 'border-gray-500',
          text: 'text-gray-700 dark:text-gray-400',
          icon: 'text-gray-600',
          gradient: 'from-gray-500 to-gray-700',
        };
    }
  };

  const colors = getRiskColors();

  // Get appropriate icon
  const RiskIcon = () => {
    switch (risk_level) {
      case 'High':
        return <AlertTriangle className={`w-12 h-12 ${colors.icon}`} />;
      case 'Medium':
        return <AlertCircle className={`w-12 h-12 ${colors.icon}`} />;
      case 'Low':
        return <CheckCircle className={`w-12 h-12 ${colors.icon}`} />;
      default:
        return <AlertCircle className={`w-12 h-12 ${colors.icon}`} />;
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text('SafeStride Risk Assessment Report', pageWidth / 2, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
    
    // Risk Level
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Risk Level Assessment', 20, 45);
    doc.setFontSize(24);
    
    // Set color based on risk
    if (risk_level === 'High') doc.setTextColor(220, 38, 38);
    else if (risk_level === 'Medium') doc.setTextColor(251, 146, 60);
    else doc.setTextColor(34, 197, 94);
    
    doc.text(risk_level, 20, 55);
    
    // Metrics
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Severity Score: ${severity_score.toFixed(2)} / 3.00`, 20, 70);
    doc.text(`Confidence: ${(confidence * 100).toFixed(1)}%`, 20, 80);
    
    // Risk Factors
    doc.setFontSize(14);
    doc.text('Identified Risk Factors', 20, 95);
    doc.setFontSize(11);
    let yPos = 105;
    risk_factors.forEach((factor, index) => {
      doc.text(`${index + 1}. ${factor}`, 25, yPos);
      yPos += 7;
    });
    
    // Recommendations
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Safety Recommendations', 20, yPos);
    yPos += 10;
    doc.setFontSize(11);
    recommendations.forEach((rec, index) => {
      const cleanRec = rec.replace(/[⚠️⚡✓]/g, '').trim();
      const lines = doc.splitTextToSize(cleanRec, pageWidth - 50);
      doc.text(`${index + 1}. ${lines[0]}`, 25, yPos);
      yPos += 7;
      for (let i = 1; i < lines.length; i++) {
        doc.text(lines[i], 30, yPos);
        yPos += 7;
      }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('SafeStride - Pedestrian Safety Prediction System', pageWidth / 2, 280, { align: 'center' });
    
    // Save
    doc.save(`safestride-report-${Date.now()}.pdf`);
  };

  // Save to history
  React.useEffect(() => {
    if (addToHistory) {
      addToHistory({
        ...result,
        timestamp: new Date().toISOString(),
      });
    }
  }, [result]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Risk Level Card */}
      <div className={`card border-2 ${colors.border} ${colors.bg}`}>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <RiskIcon />
            <div>
              <h2 className="text-3xl font-bold mb-1">{risk_level} Risk</h2>
              <p className={`text-sm ${colors.text}`}>
                Pedestrian Accident Risk Assessment
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{(confidence * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Severity Score */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-3">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <h3 className="font-semibold">Severity Score</h3>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold">{severity_score.toFixed(2)}</span>
            <span className="text-gray-600 dark:text-gray-400 pb-1">/ 3.00</span>
          </div>
          <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${colors.gradient}`}
              style={{ width: `${(severity_score / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Confidence Score */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-3">
            <CheckCircle className="w-6 h-6 text-primary-600" />
            <h3 className="font-semibold">Confidence</h3>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold">{(confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-3">
            <FileText className="w-6 h-6 text-primary-600" />
            <h3 className="font-semibold">Probabilities</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(prediction_probabilities).map(([level, prob]) => (
              <div key={level} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{level}</span>
                <span className="font-semibold">{(prob * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <AlertCircle className="w-6 h-6 text-primary-600" />
          <span>Identified Risk Factors</span>
        </h3>
        <ul className="space-y-2">
          {risk_factors.map((factor, index) => (
            <li
              key={index}
              className="flex items-start space-x-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              <span className={`font-bold ${colors.text}`}>•</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <CheckCircle className="w-6 h-6 text-primary-600" />
          <span>Safety Recommendations</span>
        </h3>
        <ul className="space-y-3">
          {recommendations.map((rec, index) => (
            <li
              key={index}
              className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              <span className="font-bold text-primary-600">{index + 1}.</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={exportToPDF}
          className="btn-primary flex items-center justify-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Export as PDF</span>
        </button>
        <button onClick={onNewPrediction} className="btn-secondary">
          Make Another Prediction
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;
