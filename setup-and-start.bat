@echo off
echo ========================================
echo ECG Compression Platform Setup Script
echo ========================================
echo.

echo 1. Checking current directory...
cd /d "%~dp0"
echo Current directory: %cd%
echo.

echo 2. Running system diagnosis...
node diagnose.js
echo.

echo 3. Installing dependencies...
echo Running npm install...
npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed!
    echo Please check your Node.js installation.
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully!
echo.

echo 4. Starting server...
echo Press Ctrl+C to stop the server
echo.
node start-server.js

pause