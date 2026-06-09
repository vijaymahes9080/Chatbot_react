@echo off
title AetherMind Environment Integrity Checker
color 0E
cls

echo ====================================================================
echo   🔍 A E T H E R M I N D   E N V I R O N M E N T   I N T E G R I T Y
echo ====================================================================
echo.

setlocal enabledelayedexpansion

:: 1. Verify Python
echo [*] Verifying Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to your PATH.
    echo Please install Python 3.10+ and select 'Add Python to PATH' during installation.
    goto end_fail
)
for /f "tokens=2" %%i in ('python --version') do set py_ver=%%i
echo [✓] Python detected: Version !py_ver!

:: 2. Verify Node.js
echo.
echo [*] Verifying Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not added to your PATH.
    echo Please install Node.js 18+ from https://nodejs.org.
    goto end_fail
)
for /f "tokens=1" %%i in ('node --version') do set node_ver=%%i
echo [✓] Node.js detected: Version !node_ver!

:: 3. Verify npm
echo.
echo [*] Verifying npm installation...
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] npm is not detected or failed to run.
) else (
    for /f "tokens=1" %%i in ('call npm --version') do set npm_ver=%%i
    echo [✓] npm detected: Version !npm_ver!
)

:: 4. Verify Python dependencies
echo.
echo [*] Checking Backend Python packages...
python -c "import fastapi, sqlalchemy, langchain, chromadb" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Some Python packages are missing.
    echo Attempting to install missing requirements from requirements.txt...
    cd backend
    python -m pip install -r requirements.txt
    cd ..
    python -c "import fastapi, sqlalchemy, langchain, chromadb" >nul 2>&1
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install backend dependencies. Please check your internet connection or virtual environment.
        goto end_fail
    )
    echo [✓] Python packages installed and verified!
) else (
    echo [✓] All core Python packages [FastAPI, SQLAlchemy, LangChain, ChromaDB] are verified!
)

:: 5. Verify Frontend node_modules
echo.
echo [*] Checking Frontend packages...
if not exist "node_modules\" (
    echo [WARNING] Frontend node_modules folder not found.
    echo Attempting to run npm install...
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] npm install failed. Please run 'npm install' manually.
        goto end_fail
    )
    echo [✓] Frontend packages installed successfully!
) else (
    echo [✓] Frontend packages [node_modules] verified!
)

:: 6. Run Backend API Integration Tests
echo.
echo [*] Running FastAPI integration test suite...
python backend/verify_backend.py
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Integration tests failed! Please check backend logs or database connections.
    goto end_fail
)

echo.
echo ====================================================================
echo   🎉 ENVIRONMENT CHECKS COMPLETED: AETHERMIND IS READY FOR RUNNING!
echo ====================================================================
echo.
endlocal
exit /b 0

:end_fail
echo.
echo ====================================================================
echo   ❌ ENVIRONMENT CHECKS FAILED: PLEASE CORRECT THE ERRORS ABOVE!
echo ====================================================================
echo.
endlocal
exit /b 1
