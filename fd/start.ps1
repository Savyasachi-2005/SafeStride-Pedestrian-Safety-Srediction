# SafeStride Frontend - Quick Start Script
# Run this script to set up and start the frontend

Write-Host "🚀 SafeStride Frontend Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "📋 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Found Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

# Check npm installation
try {
    $npmVersion = npm --version 2>&1
    Write-Host "✅ Found npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
Set-Location $PSScriptRoot

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Check .env file
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "⚠️  .env file not found. Using default settings." -ForegroundColor Yellow
    Write-Host "Backend API URL: http://localhost:8000" -ForegroundColor Cyan
}

# Start development server
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🎉 Setup complete! Starting development server..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Make sure backend is running at: http://localhost:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
