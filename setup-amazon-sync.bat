@echo off
REM Quick Setup Script for Amazon Sync Feature (Windows)
REM This script sets up the Python adapter for real Amazon order syncing

setlocal enabledelayedexpansion

echo.
echo 🚀 Aura Amazon Sync - Quick Setup (Windows)
echo ============================================
echo.

REM Check Python version
echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.9+ first.
    echo Visit: https://www.python.org/downloads/
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✓ Found Python %PYTHON_VERSION%
echo.

REM Create virtual environment
echo 📦 Setting up Python environment...
if not exist ".venv" (
    python -m venv .venv
    echo ✓ Created virtual environment
) else (
    echo ✓ Virtual environment already exists
)
echo.

REM Activate venv
call .venv\Scripts\activate.bat
echo ✓ Activated virtual environment
echo.

REM Install dependencies
echo 📚 Installing dependencies...
pip install -q -r api-adapter/requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Check for .env file
echo 🔐 Checking Amazon credentials...
if not exist ".env" (
    echo ⚠️  .env file not found
    echo 📝 Creating .env file...
    if exist ".env.example" (
        copy .env.example .env
    ) else (
        type nul > .env
    )
)

REM Check for credentials
findstr /M "AMAZON_EMAIL" .env >nul
if errorlevel 1 (
    echo ❌ AMAZON_EMAIL not set in .env
    echo.
    echo To set up real Amazon sync, add your credentials to .env:
    echo.
    echo   AMAZON_EMAIL=your.email@amazon.com
    echo   AMAZON_PASSWORD=your_password
    echo.
    echo Or for AWS API auth:
    echo   AWS_ACCESS_KEY_ID=your_key
    echo   AWS_SECRET_ACCESS_KEY=your_secret
    echo   AWS_REGION=us-east-1
    echo.
    echo Then re-run this script.
    exit /b 1
)
echo ✓ Amazon credentials found in .env
echo.

echo ✅ Setup Complete!
echo.
echo Next steps:
echo 1. Make sure .env has AMAZON_EMAIL and AMAZON_PASSWORD set
echo 2. In another terminal, run:
echo    .venv\Scripts\activate.bat
echo    uvicorn api-adapter.adapter:app --reload --port 8001
echo 3. Update .env with:
echo    RETAILER_ADAPTER_URL=http://localhost:8001
echo    USE_LOCAL_RETAILER_ADAPTER=true
echo 4. Restart dev server: npm run dev
echo 5. Go to closet and click 'Fetch My Amazon Orders'
echo.
echo For help, see AMAZON_SYNC_FIX.md
echo.

pause
