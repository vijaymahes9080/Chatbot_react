@echo off
title AetherMind AI Chatbot Workstation Launcher
color 0B
cls

echo ====================================================================
echo   🌌 A E T H E R M I N D   A I   C H A T B O T   W O R K S T A T I O N
echo ====================================================================
echo.
echo   Welcome to AetherMind - The Multi-Model AI Playground & RAG Engine.
echo.
echo   [1] Start Full Platform (Backend + Frontend)
echo   [2] Start Backend API Server Only
echo   [3] Start Frontend UI Server Only
echo   [4] Run System Environment Integrity Tests
echo   [5] Exit Workspace
echo.
echo ====================================================================
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto start_all
if "%choice%"=="2" goto start_backend
if "%choice%"=="3" goto start_frontend
if "%choice%"=="4" goto run_tests
if "%choice%"=="5" goto exit_app
goto invalid_choice

:start_all
echo.
echo [*] Initializing Backend API Server in a new window...
start "AetherMind Backend" cmd /k "color 0E && title AetherMind Backend && echo [*] Booting FastAPI backend... && cd backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo [*] Initializing Frontend Vite Server in a new window...
start "AetherMind Frontend" cmd /k "color 0D && title AetherMind Frontend && echo [*] Booting Vite frontend... && cmd /c npm run dev"

echo [*] Waiting for services to initialize...
timeout /t 3 >nul
start http://localhost:5173
echo [✓] Done! Both servers are running in separate windows.
pause
exit

:start_backend
echo.
echo [*] Starting Backend API Server in this window...
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
exit

:start_frontend
echo.
echo [*] Starting Frontend UI Server in this window...
cmd /c npm run dev
pause
exit

:run_tests
echo.
echo [*] Running System Environment Integrity Check...
call test_environment.bat
pause
exit

:invalid_choice
echo.
echo [!] Invalid selection. Please choose an option between 1 and 5.
pause
exit

:exit_app
exit
