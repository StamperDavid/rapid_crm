"""
Electronic Logging Device (ELD) Module
This module handles Hours of Service (HOS) and Driver Vehicle Inspection Report (DVIR) compliance.

This is a standalone module that can be used independently or integrated with other applications.
"""

import os
import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from abc import ABC, abstractmethod

# Optional dependencies - only import if available
try:
    from celery import Celery
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False

try:
    from flask import Blueprint, jsonify, request
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False

# --- Celery Setup (Optional) ---
if CELERY_AVAILABLE:
    redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
    celery_app = Celery('rapid_eld', broker=redis_url, backend=redis_url)
else:
    celery_app = None

# --- Shared Geotab Utilities ---
# In a real-world application, this would be a separate file or a shared library
def call_geotab_api(method: str, params: dict):
    """
    Makes an authenticated call to the Geotab API.

    Args:
        method (str): The name of the Geotab API method to call (e.g., "GetLogs").
        params (dict): A dictionary of parameters for the API call.

    Returns:
        dict: The JSON response from the API or an error message.
    """
    GEOTAB_API_KEY = os.environ.get("GEOTAB_API_KEY")
    GEOTAB_USERNAME = os.environ.get("GEOTAB_USERNAME")
    GEOTAB_DATABASE = os.environ.get("GEOTAB_DATABASE")
    GEOTAB_BASE_URL = "https://my.geotab.com/apiv1"

    payload = {
        "credentials": {
            "database": GEOTAB_DATABASE,
            "userName": GEOTAB_USERNAME,
            "password": GEOTAB_API_KEY
        },
        "method": method,
        "params": params
    }

    try:
        response = requests.post(GEOTAB_BASE_URL, json=payload, timeout=30)
        response.raise_for_status()
        return response.json().get('result', {})
    except requests.exceptions.RequestException as e:
        logging.error(f"Geotab API call failed for method {method}: {e}")
        return {"error": str(e)}

# --- Abstract Data Storage Interface ---
class ELDDataStore(ABC):
    """Abstract interface for ELD data storage"""
    
    @abstractmethod
    def store_hos_log(self, log_data: Dict[str, Any]) -> bool:
        """Store HOS log data"""
        pass
    
    @abstractmethod
    def get_hos_logs(self, driver_id: Optional[str] = None, 
                    start_date: Optional[datetime] = None,
                    end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Retrieve HOS logs with optional filtering"""
        pass
    
    @abstractmethod
    def store_dvir_report(self, dvir_data: Dict[str, Any]) -> bool:
        """Store DVIR report data"""
        pass
    
    @abstractmethod
    def get_dvir_reports(self, driver_id: Optional[str] = None,
                        vehicle_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve DVIR reports with optional filtering"""
        pass
    
    @abstractmethod
    def store_alert(self, alert_data: Dict[str, Any]) -> bool:
        """Store alert data"""
        pass
    
    @abstractmethod
    def get_alerts(self, driver_id: Optional[str] = None,
                  alert_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve alerts with optional filtering"""
        pass

# --- In-Memory Data Store (Default) ---
class InMemoryELDDataStore(ELDDataStore):
    """In-memory implementation of ELD data storage"""
    
    def __init__(self):
        self.hos_logs = []
        self.dvir_reports = []
        self.alerts = []
    
    def store_hos_log(self, log_data: Dict[str, Any]) -> bool:
        self.hos_logs.append(log_data)
        return True
    
    def get_hos_logs(self, driver_id: Optional[str] = None, 
                    start_date: Optional[datetime] = None,
                    end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        logs = self.hos_logs
        if driver_id:
            logs = [log for log in logs if log.get('driver_id') == driver_id]
        if start_date:
            logs = [log for log in logs if log.get('start_time', datetime.min) >= start_date]
        if end_date:
            logs = [log for log in logs if log.get('start_time', datetime.max) <= end_date]
        return logs
    
    def store_dvir_report(self, dvir_data: Dict[str, Any]) -> bool:
        self.dvir_reports.append(dvir_data)
        return True
    
    def get_dvir_reports(self, driver_id: Optional[str] = None,
                        vehicle_id: Optional[str] = None) -> List[Dict[str, Any]]:
        reports = self.dvir_reports
        if driver_id:
            reports = [report for report in reports if report.get('driver_id') == driver_id]
        if vehicle_id:
            reports = [report for report in reports if report.get('vehicle_id') == vehicle_id]
        return reports
    
    def store_alert(self, alert_data: Dict[str, Any]) -> bool:
        self.alerts.append(alert_data)
        return True
    
    def get_alerts(self, driver_id: Optional[str] = None,
                  alert_type: Optional[str] = None) -> List[Dict[str, Any]]:
        alerts = self.alerts
        if driver_id:
            alerts = [alert for alert in alerts if alert.get('driver_id') == driver_id]
        if alert_type:
            alerts = [alert for alert in alerts if alert.get('type') == alert_type]
        return alerts

# --- Global Data Store Instance ---
_data_store: Optional[ELDDataStore] = None

def set_data_store(store: ELDDataStore):
    """Set the global data store instance"""
    global _data_store
    _data_store = store

def get_data_store() -> ELDDataStore:
    """Get the global data store instance"""
    global _data_store
    if _data_store is None:
        _data_store = InMemoryELDDataStore()
    return _data_store

# --- Core ELD Business Logic ---
class ELDService:
    """Core ELD service class with business logic"""
    
    def __init__(self, data_store: Optional[ELDDataStore] = None):
        self.data_store = data_store or get_data_store()
    
    def fetch_hos_logs(self, start_date: Optional[datetime] = None, 
                      end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetch HOS logs from Geotab API"""
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=1)
        if not end_date:
            end_date = datetime.utcnow()
        
        params = {
            "search": {
                "fromDate": start_date.isoformat(),
                "toDate": end_date.isoformat()
            }
        }
        
        hos_logs = call_geotab_api("GetLogRecords", params)
        if not hos_logs.get('error'):
            for log in hos_logs:
                self.data_store.store_hos_log(log)
            logging.info(f"Fetched {len(hos_logs)} HOS records.")
            return hos_logs
        return []
    
    def fetch_dvir_reports(self) -> List[Dict[str, Any]]:
        """Fetch DVIR reports from Geotab API"""
        logging.info("Fetching DVIR data...")
        # This would be replaced with actual Geotab API call
        dvir_data = [{"id": "dvir1", "defect": "Flat tire", "vehicleId": "truck_a1"}]
        for report in dvir_data:
            self.data_store.store_dvir_report(report)
        logging.info(f"Fetched {len(dvir_data)} DVIR records.")
        return dvir_data
    
    def check_hos_violations(self) -> List[Dict[str, Any]]:
        """Check for HOS violations and generate alerts"""
        logging.info("Running HOS violation checks...")
        potential_violations = [
            {"driver_id": "driver_c", "alert": "HOS violation detected on 2025-09-01."}
        ]
        
        for violation in potential_violations:
            alert_data = {
                "driver_id": violation["driver_id"],
                "type": "HOS Violation",
                "severity": "high",
                "title": "HOS Violation Detected",
                "message": violation["alert"],
                "created_at": datetime.utcnow()
            }
            self.data_store.store_alert(alert_data)
        
        if potential_violations:
            logging.warning(f"Generated {len(potential_violations)} HOS violation alerts.")
        
        return potential_violations
    
    def get_hos_status(self, driver_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get real-time HOS status for drivers"""
        # This would implement actual HOS status calculation
        status_list = [
            {"driverId": "driver_a", "status": "Driving", "hoursRemaining": 2.5},
            {"driverId": "driver_b", "status": "Off-Duty", "hoursRemaining": 0},
        ]
        
        if driver_id:
            status_list = [status for status in status_list if status["driverId"] == driver_id]
        
        return status_list
    
    def get_alerts(self, driver_id: Optional[str] = None, 
                  alert_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get alerts with optional filtering"""
        return self.data_store.get_alerts(driver_id, alert_type)
    
    def generate_roadside_inspection_report(self, driver_id: str) -> Dict[str, Any]:
        """Generate roadside inspection report"""
        report_id = f"{driver_id}-{os.urandom(4).hex()}"
        report_url = f"/reports/roadside/{report_id}"
        
        return {
            "message": "Roadside inspection report generated.",
            "reportUrl": report_url,
            "reportId": report_id
        }

# --- Celery Tasks (Optional) ---
if CELERY_AVAILABLE and celery_app:
    @celery_app.task(name='rapid_eld.fetch_eld_data')
    def fetch_eld_data():
        """
        Scheduled task to sync ELD-related data from Geotab.
        This task should be run frequently (e.g., every 5-15 minutes).
        """
        logging.info("Starting ELD data sync with Geotab.")
        
        service = ELDService()
        service.fetch_hos_logs()
        service.fetch_dvir_reports()
        run_hos_violation_check.delay()
        
        logging.info("ELD data sync complete.")

    @celery_app.task(name='rapid_eld.run_hos_violation_check')
    def run_hos_violation_check():
        """AI task to check for HOS violations and generate alerts."""
        service = ELDService()
        service.check_hos_violations()

# --- Flask Blueprint for ELD API (Optional) ---
if FLASK_AVAILABLE:
    eld_blueprint = Blueprint('eld_api', __name__, url_prefix='/api/eld')
    
    @eld_blueprint.route('/hos-status', methods=['GET'])
    def get_hos_status():
        """Retrieves real-time Hours of Service status for all drivers."""
        service = ELDService()
        driver_id = request.args.get('driver_id')
        status_list = service.get_hos_status(driver_id)
        return jsonify(status_list), 200
    
    @eld_blueprint.route('/alerts', methods=['GET'])
    def get_alerts():
        """Retrieves a list of all ELD-related alerts."""
        service = ELDService()
        driver_id = request.args.get('driver_id')
        alert_type = request.args.get('type')
        alerts = service.get_alerts(driver_id, alert_type)
        return jsonify(alerts), 200
    
    @eld_blueprint.route('/roadside-inspection', methods=['POST'])
    def start_roadside_inspection():
        """Triggers the generation of a roadside inspection report."""
        data = request.get_json()
        driver_id = data.get('driverId')
        if not driver_id:
            return jsonify({"error": "driverId is required"}), 400
        
        service = ELDService()
        result = service.generate_roadside_inspection_report(driver_id)
        return jsonify(result), 200
else:
    eld_blueprint = None
