"""
Integration examples showing how to use the ELD module with different frameworks
"""

# Example 1: Standalone usage (no external dependencies)
from rapid_eld import ELDService, InMemoryELDDataStore

def standalone_example():
    """Example of using ELD module standalone"""
    print("=== Standalone ELD Usage ===")
    
    # Create service with in-memory storage
    service = ELDService()
    
    # Get HOS status
    hos_status = service.get_hos_status()
    print(f"HOS Status: {hos_status}")
    
    # Get alerts
    alerts = service.get_alerts()
    print(f"Alerts: {alerts}")
    
    # Generate roadside inspection report
    report = service.generate_roadside_inspection_report("driver_123")
    print(f"Roadside Report: {report}")

# Example 2: Flask integration
def flask_integration_example():
    """Example of integrating with Flask application"""
    print("\n=== Flask Integration ===")
    
    try:
        from flask import Flask
        from flask_sqlalchemy import SQLAlchemy
        from eld_integration import setup_flask_integration
        from rapid_eld import eld_blueprint
        
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///eld.db'
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        db = SQLAlchemy(app)
        
        # Setup ELD integration
        data_store = setup_flask_integration(app, db)
        
        # Create tables
        with app.app_context():
            db.create_all()
        
        print("Flask integration setup complete!")
        print("Available routes:")
        print("- GET /api/eld/hos-status")
        print("- GET /api/eld/alerts")
        print("- POST /api/eld/roadside-inspection")
        
    except ImportError as e:
        print(f"Flask integration not available: {e}")

# Example 3: Custom data store integration
def custom_datastore_example():
    """Example of using custom data store"""
    print("\n=== Custom Data Store ===")
    
    from rapid_eld import ELDDataStore, ELDService, set_data_store
    from typing import Dict, List, Optional, Any
    from datetime import datetime
    
    class CustomDataStore(ELDDataStore):
        """Custom data store implementation"""
        
        def __init__(self):
            self.data = {
                'hos_logs': [],
                'dvir_reports': [],
                'alerts': []
            }
        
        def store_hos_log(self, log_data: Dict[str, Any]) -> bool:
            self.data['hos_logs'].append(log_data)
            print(f"Stored HOS log: {log_data}")
            return True
        
        def get_hos_logs(self, driver_id: Optional[str] = None, 
                        start_date: Optional[datetime] = None,
                        end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
            logs = self.data['hos_logs']
            if driver_id:
                logs = [log for log in logs if log.get('driver_id') == driver_id]
            return logs
        
        def store_dvir_report(self, dvir_data: Dict[str, Any]) -> bool:
            self.data['dvir_reports'].append(dvir_data)
            print(f"Stored DVIR report: {dvir_data}")
            return True
        
        def get_dvir_reports(self, driver_id: Optional[str] = None,
                            vehicle_id: Optional[str] = None) -> List[Dict[str, Any]]:
            reports = self.data['dvir_reports']
            if driver_id:
                reports = [report for report in reports if report.get('driver_id') == driver_id]
            return reports
        
        def store_alert(self, alert_data: Dict[str, Any]) -> bool:
            self.data['alerts'].append(alert_data)
            print(f"Stored alert: {alert_data}")
            return True
        
        def get_alerts(self, driver_id: Optional[str] = None,
                      alert_type: Optional[str] = None) -> List[Dict[str, Any]]:
            alerts = self.data['alerts']
            if driver_id:
                alerts = [alert for alert in alerts if alert.get('driver_id') == driver_id]
            return alerts
    
    # Use custom data store
    custom_store = CustomDataStore()
    service = ELDService(custom_store)
    
    # Test the service
    service.check_hos_violations()
    alerts = service.get_alerts()
    print(f"Custom store alerts: {alerts}")

# Example 4: Celery integration
def celery_integration_example():
    """Example of using Celery for background tasks"""
    print("\n=== Celery Integration ===")
    
    try:
        from rapid_eld import fetch_eld_data, run_hos_violation_check
        
        print("Celery tasks available:")
        print("- fetch_eld_data: Sync ELD data from Geotab")
        print("- run_hos_violation_check: Check for HOS violations")
        
        # In a real application, you would start these tasks with:
        # fetch_eld_data.delay()  # Run immediately
        # fetch_eld_data.apply_async(countdown=300)  # Run in 5 minutes
        
        print("To start Celery worker: celery -A rapid_eld worker --loglevel=info")
        print("To start Celery beat: celery -A rapid_eld beat --loglevel=info")
        
    except ImportError as e:
        print(f"Celery integration not available: {e}")

# Example 5: Integration with existing client portal
def client_portal_integration_example():
    """Example of integrating with existing client portal"""
    print("\n=== Client Portal Integration ===")
    
    # This shows how you would integrate with an existing Flask app
    integration_code = '''
# In your existing Flask app (e.g., app.py):

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from eld_integration import setup_flask_integration

app = Flask(__name__)
db = SQLAlchemy(app)

# Setup ELD integration
eld_data_store = setup_flask_integration(app, db)

# Your existing routes and blueprints...
@app.route('/dashboard')
def dashboard():
    # Your existing dashboard logic
    return render_template('dashboard.html')

# The ELD routes are now available at /api/eld/*
'''
    
    print("Integration code for existing Flask app:")
    print(integration_code)

if __name__ == "__main__":
    # Run all examples
    standalone_example()
    flask_integration_example()
    custom_datastore_example()
    celery_integration_example()
    client_portal_integration_example()
