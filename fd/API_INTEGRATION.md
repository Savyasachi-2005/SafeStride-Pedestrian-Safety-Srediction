# API Integration Reference

## Backend API Response Structure

### GET /api/metrics

**Response:**
```json
{
  "metrics": {
    "test_accuracy": 0.982166698455083,
    "f1_score": 0.9844286587378188,
    "n_features": 68,
    "n_samples_train": 125828,
    "n_samples_test": 31458
  },
  "model_name": "SafeStride XGBoost Optimized",
  "model_version": "1.0.0"
}
```

## Frontend Component Mapping

### HeroSection.jsx - Stats Cards

Maps to 4 animated stat cards:

1. **Test Accuracy**
   - Value: `modelMetrics.metrics.test_accuracy * 100`
   - Display: `98.22%`
   - Icon: Award (Emerald gradient)

2. **F1 Score**
   - Value: `modelMetrics.metrics.f1_score * 100`
   - Display: `98.44%`
   - Icon: TrendingDown (Blue gradient)

3. **Features**
   - Value: `modelMetrics.metrics.n_features`
   - Display: `68`
   - Icon: Shield (Purple gradient)

4. **Training Samples**
   - Value: `Math.round(modelMetrics.metrics.n_samples_train / 1000)`
   - Display: `126K`
   - Icon: Users (Amber gradient)

### App.jsx - Footer Metrics

Displays:
- Model Name: `modelMetrics.model_name`
- Version: `modelMetrics.model_version`
- Accuracy: `modelMetrics.metrics.test_accuracy * 100`
- F1 Score: `modelMetrics.metrics.f1_score * 100`

### MetricsCard.jsx - Detailed Metrics

Shows:
- Model header with name and version
- 4 metric cards (Accuracy, F1, Precision, Recall)
- Additional metrics section for remaining fields
- Performance indicator card

## Data Flow

```
Backend API
    ↓
apiService.getMetrics()
    ↓
App.jsx (loadModelMetrics)
    ↓
modelMetrics state
    ↓
Props to:
  - HeroSection (for stats)
  - Footer (for model info)
  - MetricsCard (for detailed view)
```

## Loading States

- **Before API call**: Shows skeleton loaders with pulsing animation
- **During fetch**: Loading indicators
- **After success**: Animated CountUp to display real values
- **On error**: Graceful fallback (empty stats array)

## Key Features

✅ **No Fake Data**: All numbers come from actual model performance
✅ **Real-time Updates**: Fetches metrics on component mount
✅ **Smooth Animations**: CountUp effect for engaging presentation
✅ **Responsive Display**: Adapts format based on metric type
✅ **Error Handling**: Graceful degradation if API fails

## Type Safety

```typescript
interface MetricsResponse {
  metrics: {
    test_accuracy: number;
    f1_score: number;
    n_features: number;
    n_samples_train: number;
    n_samples_test: number;
  };
  model_name: string;
  model_version: string;
}
```

## Usage Example

```javascript
// In App.jsx
const loadModelMetrics = async () => {
  try {
    const metrics = await apiService.getMetrics();
    setModelMetrics(metrics);
  } catch (error) {
    console.error('Failed to load metrics:', error);
  }
};

// In HeroSection.jsx
const stats = modelMetrics?.metrics ? [
  {
    value: modelMetrics.metrics.test_accuracy * 100,
    suffix: '%',
    label: 'Test Accuracy',
  },
  // ... more stats
] : [];
```

## Formatting Rules

| Metric | Format | Example |
|--------|--------|---------|
| test_accuracy | `* 100` with 2 decimals + `%` | 98.22% |
| f1_score | `* 100` with 2 decimals + `%` | 98.44% |
| n_features | Raw number, no decimals | 68 |
| n_samples_train | `/ 1000` rounded + `K` | 126K |
| n_samples_test | Raw number with commas | 31,458 |

## Error Scenarios

1. **Backend Not Running**
   - Hero stats show skeleton loaders
   - Footer shows "Loading..."
   - User can still use prediction form

2. **Network Error**
   - Console logs error
   - No stats displayed
   - App remains functional

3. **Invalid Response**
   - Optional chaining prevents crashes
   - Empty array returned for stats
   - Fallback UI displayed

## Testing

To verify correct integration:

1. Start backend: `uvicorn main:app --reload`
2. Visit: `http://localhost:8000/api/metrics`
3. Verify response matches expected structure
4. Check frontend console for successful fetch
5. Confirm stats animate with real values

## Future Enhancements

- [ ] Add more metrics (ROC-AUC, PR-AUC)
- [ ] Show training/test split ratio
- [ ] Display model training date
- [ ] Add metric comparison over time
- [ ] Show confidence intervals
