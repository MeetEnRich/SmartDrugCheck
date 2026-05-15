@echo off
TITLE SmartDrugCheck - Launching System
echo ========================================
echo        SmartDrugCheck System Start
echo ========================================
echo.

:: Start Backend in a new window
echo [1/2] Launching Django Backend Proxy...
start cmd /k "TITLE DrugCheck Backend && cd backend && ..\venv\Scripts\activate && python manage.py runserver"

:: Give backend a second to breathe
timeout /t 2 >nul

:: Start Frontend in a new window
echo [2/2] Launching Vite Frontend Dashboard...
start cmd /k "TITLE DrugCheck Frontend && cd frontend && npm run dev"

echo.
echo ========================================
echo SYSTEM RUNNING: Check the opened windows.
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:8000
echo ========================================
pause
