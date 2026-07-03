# LearnSphere Development Startup Script
Write-Host "Starting LearnSphere Development Environment..." -ForegroundColor Cyan

# Start Backend
Write-Host "`nStarting Backend (port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# Wait a moment then start Frontend
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend (port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`nDevelopment servers are starting..." -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "API Docs: http://localhost:5000/health" -ForegroundColor White
