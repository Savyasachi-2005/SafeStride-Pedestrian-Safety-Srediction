# SafeStride - Complete Setup Script
# This script sets up and starts both backend and frontend

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           SafeStride - Complete Setup                ║" -ForegroundColor Cyan
Write-Host "║   Pedestrian Safety Prediction System                ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Function to check if port is in use
function Test-PortInUse {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

Write-Host "📋 Pre-flight checks..." -ForegroundColor Yellow
Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Python not found! Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  ✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js not found! Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version 2>&1
    Write-Host "  ✅ npm v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Setup Backend
Write-Host "🔧 Setting up Backend..." -ForegroundColor Cyan
Write-Host ""

Set-Location "$projectRoot\bd"

# Create venv if not exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate and install
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
pip install -r requirements.txt --quiet --disable-pip-version-check
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Check model files
Write-Host ""
Write-Host "Checking ML model files..." -ForegroundColor Yellow
$modelPath = "mlt"
if (-not (Test-Path $modelPath)) {
    $modelPath = "MLT"
}

$modelFiles = @(
    "$modelPath\SafeStride_Optimized.joblib",
    "$modelPath\label_encoder.joblib",
    "$modelPath\feature_names.joblib",
    "$modelPath\model_metrics.joblib"
)

$allFilesExist = $true
foreach ($file in $modelFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $(Split-Path $file -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $(Split-Path $file -Leaf) NOT FOUND" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "⚠️  Some model files are missing! Please check mlt/ folder" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Setup Frontend
Write-Host "🔧 Setting up Frontend..." -ForegroundColor Cyan
Write-Host ""

Set-Location "$projectRoot\fd"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Write-Host "(This may take a few minutes...)" -ForegroundColor Yellow
    npm install
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Start Backend (in one terminal):" -ForegroundColor Cyan
Write-Host "   cd bd" -ForegroundColor White
Write-Host "   .\start.ps1" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Start Frontend (in another terminal):" -ForegroundColor Cyan
Write-Host "   cd fd" -ForegroundColor White
Write-Host "   .\start.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Or use the individual start scripts:" -ForegroundColor Yellow
Write-Host "   .\bd\start.ps1  (Backend)" -ForegroundColor White
Write-Host "   .\fd\start.ps1  (Frontend)" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Backend will run on:  http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Green
Write-Host "API Docs available:   http://localhost:8000/docs" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Set-Location $projectRoot
