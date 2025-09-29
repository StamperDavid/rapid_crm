@echo off
echo 🚀 Starting Sports Funder Application...
echo.

REM Change to project directory
cd /d "C:\Users\David\PycharmProjects\sports_funder"

REM Activate virtual environment
echo 📦 Activating virtual environment...
call .\venv\Scripts\activate.bat

REM Install missing dependencies
echo 📦 Installing missing dependencies...
pip install python-jose[cryptography] structlog

REM Create database tables
echo 🗄️  Setting up database...
python -c "from app.core.database import engine; from app.models import *; Base.metadata.create_all(bind=engine); print('Database tables created successfully')"

REM Start the server
echo 🌐 Starting FastAPI server...
echo Server will be available at: http://localhost:8000
echo API Keys page will be at: http://localhost:8000/api-keys
echo.
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause

