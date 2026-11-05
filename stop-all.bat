@echo off
title Agentic AI - Stop All Services
cls
echo ================================================================
echo 🛑 Stopping all Node.js and Docker services...
echo ================================================================

echo Terminating Node processes...
taskkill /F /IM node.exe /T 2>nul

echo Stopping Docker Redis container...
docker-compose -f backend\docker-compose.yml down 2>nul

echo.
echo ✅ All Node services and containers have been stopped cleanly!
echo Ports 1000, 2000, 3000, 4000, and 5173 are now free.
echo ================================================================
pause

