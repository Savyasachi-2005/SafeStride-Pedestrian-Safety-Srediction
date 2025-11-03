# SafeStride Backend - Quick Start Script
# Run this script to set up and start the backend server

Write-Host "🚀 SafeStride Backend Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Python installation
Write-Host "📋 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Set-Location $PSScriptRoot

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host ""
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "🔌 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host ""
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet --disable-pip-version-check

# Check ML model files
Write-Host ""
Write-Host "🤖 Checking ML model files..." -ForegroundColor Yellow
$modelFiles = @(
    "mlt\SafeStride_Optimized.joblib",
    "mlt\label_encoder.joblib",
    "mlt\feature_names.joblib",
    "mlt\model_metrics.joblib"
)

$allFilesExist = $true
foreach ($file in $modelFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file NOT FOUND" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "⚠️  Some model files are missing!" -ForegroundColor Red
    Write-Host "Please ensure all .joblib files are in the mlt/ folder" -ForegroundColor Yellow
    exit 1
}

# Start the server
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🎉 Setup complete! Starting server..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python main.py
