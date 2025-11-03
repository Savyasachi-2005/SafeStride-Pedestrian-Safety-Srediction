# SafeStride Frontend

Modern React frontend for SafeStride - Pedestrian Accident Risk Prediction System

## Features

- 🎯 **Interactive Prediction Form** - Comprehensive input form for all accident parameters
- 📊 **Real-time Risk Assessment** - Instant predictions with visual indicators
- 📈 **Model Metrics Dashboard** - View ML model performance statistics
- 📜 **Prediction History** - Track your recent risk assessments
- 🌓 **Dark Mode** - Toggle between light and dark themes
- 📄 **PDF Export** - Download prediction results as PDF
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **jsPDF** - PDF generation
- **Chart.js** - Data visualization

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running on `http://localhost:8000`

### Installation

1. **Install dependencies:**
```powershell
npm install
```

2. **Configure environment variables:**

Edit `.env` file if needed:
```env
VITE_API_URL=http://localhost:8000
```

3. **Start development server:**
```powershell
npm run dev
```

The app will be available at: `http://localhost:5173`

### Build for Production

```powershell
npm run build
```

Production files will be in the `dist/` folder.

### Preview Production Build

```powershell
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # App header with dark mode toggle
│   │   ├── PredictionForm.jsx  # Input form for predictions
│   │   ├── ResultDisplay.jsx   # Display prediction results
│   │   └── MetricsCard.jsx     # Show model metrics
│   ├── services/
│   │   └── api.js             # API service layer
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles with Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env                       # Environment variables
```

## Usage

### Making a Prediction

1. Navigate to the **New Prediction** tab
2. Fill in all required fields:
   - Location (Latitude/Longitude)
   - Time and date details
   - Weather and light conditions
   - Road conditions
   - Junction details
   - Traffic information
3. Click **Predict Risk Level**
4. View results in the Results tab

### Viewing Results

The results display includes:
- **Risk Level**: High, Medium, or Low
- **Severity Score**: Numerical severity (1-3)
- **Confidence**: Model confidence percentage
- **Risk Factors**: Identified contributing factors
- **Recommendations**: Safety suggestions
- **Probability Distribution**: Risk level probabilities

### Exporting Results

Click **Export as PDF** to download a detailed report of the risk assessment.

### Viewing History

- Access the **History** tab to see recent predictions
- History is stored in browser localStorage
- Clear history using the **Clear History** button

### Model Metrics

View the ML model's performance metrics in the **Model Metrics** tab:
- Accuracy
- F1 Score
- Precision
- Recall

## API Integration

The frontend communicates with the FastAPI backend through the API service (`src/services/api.js`).

### Available Endpoints

- `POST /api/predict` - Make single prediction
- `POST /api/batch-predict` - Make batch predictions
- `GET /api/health` - Check API health
- `GET /api/metrics` - Get model metrics
- `GET /api/feature-template` - Get input template

### Error Handling

The app includes comprehensive error handling:
- Connection errors (backend not running)
- Validation errors (invalid input)
- Server errors (API failures)

## Customization

### Changing Theme Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom color palette
      },
    },
  },
}
```

### Adding New Features

1. Create component in `src/components/`
2. Import and use in `App.jsx`
3. Add any new API calls to `src/services/api.js`

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable:
   - `VITE_API_URL`: Your deployed backend URL
4. Deploy!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload `dist/` folder to Netlify
3. Configure environment variables in Netlify dashboard
4. Set redirects for SPA routing

### Deploy to GitHub Pages

```powershell
npm run build
# Deploy dist/ folder to gh-pages branch
```

## Troubleshooting

### API Connection Issues

- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in backend
- Verify `.env` file has correct `VITE_API_URL`

### Build Errors

```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Dark Mode Issues

Clear browser cache and localStorage:
```javascript
localStorage.clear()
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lazy loading for components
- Optimized bundle size with Vite
- Efficient state management
- Debounced API calls

## Contributing

1. Follow React best practices
2. Use functional components with hooks
3. Maintain consistent styling with Tailwind
4. Add error handling for all API calls
5. Test on multiple devices

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check the troubleshooting section
- Review backend README
- Check browser console for errors
