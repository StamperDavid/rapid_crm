#!/usr/bin/env python3
"""
Self-contained Sports Funder Application Startup Script
This script ensures everything runs in isolation with a single database.
"""

import sys
import os
import subprocess
from pathlib import Path

def main():
    """Start the Sports Funder application in complete isolation."""
    
    # Ensure we're in the project directory
    project_dir = Path(__file__).parent
    os.chdir(project_dir)
    
    # Set environment variables for complete isolation
    os.environ['PYTHONPATH'] = str(project_dir)
    os.environ['DATABASE_URL'] = 'sqlite:///./sports_funder_isolated.db'
    
    print("Starting Sports Funder - Completely Self-Contained Application")
    print("=" * 60)
    print(f"Project Directory: {project_dir}")
    print(f"Database: sports_funder_isolated.db (SQLite - completely isolated)")
    print(f"Python Path: {sys.executable}")
    print("=" * 60)
    
    # Import and start the application
    try:
        from app.main import app
        import uvicorn
        
        print("All imports successful - application is self-contained!")
        print("Starting server on http://localhost:8000")
        print("Dashboard will be available at: http://localhost:8000/dashboard")
        print("API Keys management: http://localhost:8000/api-keys")
        print("=" * 60)
        
        # Start the server
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            log_level="info"
        )
        
    except ImportError as e:
        print(f"Import Error: {e}")
        print("Make sure all dependencies are installed in the virtual environment.")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
