@echo off
echo 🏈 Starting Sports Funder - Completely Self-Contained Application
echo ============================================================

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Set environment variables for isolation
set PYTHONPATH=%CD%
set DATABASE_URL=sqlite:///./sports_funder_isolated.db

REM Start the application
python start_isolated_app.py

pause
