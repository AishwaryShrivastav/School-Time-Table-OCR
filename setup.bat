@echo off
COLOR 0A
echo.
echo ===============================================
echo    Timetable OCR Platform - Setup Script
echo ===============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo [OK] Node.js detected
echo.

REM Backend Setup
echo ===============================================
echo    Setting up Backend...
echo ===============================================
echo.

cd backend

echo Installing backend dependencies...
call npm install

if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

echo [OK] Backend dependencies installed successfully

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo [OK] .env file created
    echo [WARNING] Please add your OpenAI API key to backend\.env
) else (
    echo [OK] .env file already exists
)

REM Create uploads directory
if not exist uploads mkdir uploads
echo [OK] uploads directory ready

cd ..

echo.

REM Frontend Setup
echo ===============================================
echo    Setting up Frontend...
echo ===============================================
echo.

cd frontend

echo Installing frontend dependencies...
call npm install

if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

echo [OK] Frontend dependencies installed successfully

cd ..

echo.
echo ===============================================
echo    Setup Complete!
echo ===============================================
echo.
echo Next Steps:
echo   1. Add your OpenAI API key to backend\.env
echo   2. Start the backend: cd backend && npm run dev
echo   3. In a new terminal, start the frontend: cd frontend && npm run dev
echo   4. Open http://localhost:3000 in your browser
echo.
echo Sample files are available in the samples\ directory for testing.
echo.
pause

