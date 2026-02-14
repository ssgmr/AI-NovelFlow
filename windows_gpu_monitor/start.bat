@echo off
chcp 65001 >nul
echo ==========================================
echo GPU Monitor Service
echo ==========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found
    pause
    exit /b 1
)

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install flask==3.0.0 flask-cors==4.0.0 nvidia-ml-py==12.570.86 -q

REM Start service
echo.
echo Starting GPU Monitor Service...
echo URL: http://localhost:9999/gpu-stats
echo.
python gpu_monitor.py

pause
