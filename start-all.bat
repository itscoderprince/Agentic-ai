@echo off
title Agentic AI - Multi-Service Launcher
cls
echo ================================================================
echo 🚀 Launching Agentic AI Services in separate windows...
echo ================================================================

echo Starting Redis container (if Docker is running)...
docker-compose -f backend\docker-compose.yml up -d 2>nul

echo.
echo Starting Gateway Service on Port 1000...
start "Gateway Server (Port 1000)" cmd /k "cd backend\services\gateway && npm run dev"

echo Starting Auth Service on Port 2000...
start "Auth Service (Port 2000)" cmd /k "cd backend\services\auth && npm run dev"

echo Starting Chat Service on Port 3000...
start "Chat Service (Port 3000)" cmd /k "cd backend\services\chat && npm run dev"

echo Starting Agent Service on Port 4000...
start "Agent Service (Port 4000)" cmd /k "cd backend\services\agent && npm run dev"

echo Starting Frontend on Port 5173...
start "Frontend UI (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ================================================================
echo ✅ All services launched in their own command windows!
echo To stop everything, close each window or run: stop-all.bat
echo ================================================================
pause

