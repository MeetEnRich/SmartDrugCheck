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
if %errorlevel% neq 0 (
    echo [ERROR] Could not activate virtual environment.
    pause
    exit /b
)
pip install -r requirements.txt
echo Running database migrations...
cd backend
python manage.py makemigrations api
python manage.py migrate
cd ..
echo Migrations complete.
echo.
echo [Optional] Creating Django Admin superuser...
echo    If you want admin access at http://127.0.0.1:8000/admin/
echo    run this command manually in the backend folder:
echo    python manage.py createsuperuser
echo.

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
