@echo off
TITLE SmartDrugCheck - First Time Setup
echo ========================================
echo       SmartDrugCheck Project Setup
echo ========================================
echo.

:: 1. Setup Python Virtual Environment
echo [1/3] Creating Python Virtual Environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.8+ and add to PATH.
    pause
    exit /b
)

:: 2. Install Python Dependencies
echo [2/3] Installing Backend Dependencies...
call venv\Scripts\activate
pip install -r requirements.txt

:: 3. Install Node Dependencies
echo [3/3] Installing Frontend Dependencies (NPM)...
cd frontend
call npm install

echo.
echo ========================================
echo SETUP COMPLETE!
echo You can now use start_system.bat to run the app.
echo ========================================
pause
