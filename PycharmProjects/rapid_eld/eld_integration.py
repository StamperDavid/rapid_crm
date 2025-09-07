"""
Integration adapter for connecting the ELD module to existing client portal applications.
This module provides adapters for common frameworks and databases.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from rapid_eld import ELDDataStore, ELDService, set_data_store

# Optional imports for different integrations
try:
    from flask_sqlalchemy import SQLAlchemy
    from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON
    from sqlalchemy.ext.declarative import declarative_base
    FLASK_SQLALCHEMY_AVAILABLE = True
except ImportError:
    FLASK_SQLALCHEMY_AVAILABLE = False

try:
    from django.db import models
    DJANGO_AVAILABLE = True
except ImportError:
    DJANGO_AVAILABLE = False

# --- Flask-SQLAlchemy Integration ---
if FLASK_SQLALCHEMY_AVAILABLE:
    Base = declarative_base()
    
    class FlaskELDDataStore(ELDDataStore):
        """Flask-SQLAlchemy implementation of ELD data storage"""
        
        def __init__(self, db: SQLAlchemy):
            self.db = db
            self._create_models()
        
        def _create_models(self):
            """Create ELD models if they don't exist"""
            
            class HOSLogModel(Base):
                __tablename__ = 'eld_hos_logs'
                
                id = Column(Integer, primary_key=True)
                driver_id = Column(String(50), nullable=False)
                vehicle_id = Column(String(50))
                log_type = Column(String(20), nullable=False)
                start_time = Column(DateTime, nullable=False)
                end_time = Column(DateTime)
                location = Column(String(200))
                odometer_reading = Column(Integer)
                is_edited = Column(Boolean, default=False)
                edit_reason = Column(Text)
                created_at = Column(DateTime, default=datetime.utcnow)
                updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
            
            class DVIRReportModel(Base):
                __tablename__ = 'eld_dvir_reports'
                
                id = Column(Integer, primary_key=True)
                driver_id = Column(String(50), nullable=False)
                vehicle_id = Column(String(50), nullable=False)
                inspection_type = Column(String(20), nullable=False)
                inspection_date = Column(DateTime, nullable=False)
                defects = Column(JSON)
                is_safe_to_drive = Column(Boolean, nullable=False)
                signature = Column(Text)
                created_at = Column(DateTime, default=datetime.utcnow)
                updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
            
            class AlertModel(Base):
                __tablename__ = 'eld_alerts'
                
                id = Column(Integer, primary_key=True)
                driver_id = Column(String(50), nullable=False)
                alert_type = Column(String(50), nullable=False)
                severity = Column(String(20), nullable=False)
                title = Column(String(200), nullable=False)
                message = Column(Text, nullable=False)
                is_read = Column(Boolean, default=False)
                is_resolved = Column(Boolean, default=False)
                resolved_at = Column(DateTime)
                resolved_by = Column(String(50))
                created_at = Column(DateTime, default=datetime.utcnow)
                updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
            
            self.HOSLogModel = HOSLogModel
            self.DVIRReportModel = DVIRReportModel
            self.AlertModel = AlertModel
        
        def store_hos_log(self, log_data: Dict[str, Any]) -> bool:
            try:
                log = self.HOSLogModel(**log_data)
                self.db.session.add(log)
                self.db.session.commit()
                return True
            except Exception as e:
                self.db.session.rollback()
                print(f"Error storing HOS log: {e}")
                return False
        
        def get_hos_logs(self, driver_id: Optional[str] = None, 
                        start_date: Optional[datetime] = None,
                        end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
            query = self.db.session.query(self.HOSLogModel)
            
            if driver_id:
                query = query.filter(self.HOSLogModel.driver_id == driver_id)
            if start_date:
                query = query.filter(self.HOSLogModel.start_time >= start_date)
            if end_date:
                query = query.filter(self.HOSLogModel.start_time <= end_date)
            
            logs = query.all()
            return [self._model_to_dict(log) for log in logs]
        
        def store_dvir_report(self, dvir_data: Dict[str, Any]) -> bool:
            try:
                report = self.DVIRReportModel(**dvir_data)
                self.db.session.add(report)
                self.db.session.commit()
                return True
            except Exception as e:
                self.db.session.rollback()
                print(f"Error storing DVIR report: {e}")
                return False
        
        def get_dvir_reports(self, driver_id: Optional[str] = None,
                            vehicle_id: Optional[str] = None) -> List[Dict[str, Any]]:
            query = self.db.session.query(self.DVIRReportModel)
            
            if driver_id:
                query = query.filter(self.DVIRReportModel.driver_id == driver_id)
            if vehicle_id:
                query = query.filter(self.DVIRReportModel.vehicle_id == vehicle_id)
            
            reports = query.all()
            return [self._model_to_dict(report) for report in reports]
        
        def store_alert(self, alert_data: Dict[str, Any]) -> bool:
            try:
                alert = self.AlertModel(**alert_data)
                self.db.session.add(alert)
                self.db.session.commit()
                return True
            except Exception as e:
                self.db.session.rollback()
                print(f"Error storing alert: {e}")
                return False
        
        def get_alerts(self, driver_id: Optional[str] = None,
                      alert_type: Optional[str] = None) -> List[Dict[str, Any]]:
            query = self.db.session.query(self.AlertModel)
            
            if driver_id:
                query = query.filter(self.AlertModel.driver_id == driver_id)
            if alert_type:
                query = query.filter(self.AlertModel.alert_type == alert_type)
            
            alerts = query.all()
            return [self._model_to_dict(alert) for alert in alerts]
        
        def _model_to_dict(self, model) -> Dict[str, Any]:
            """Convert SQLAlchemy model to dictionary"""
            result = {}
            for column in model.__table__.columns:
                value = getattr(model, column.name)
                if isinstance(value, datetime):
                    result[column.name] = value.isoformat()
                else:
                    result[column.name] = value
            return result

# --- Django Integration ---
if DJANGO_AVAILABLE:
    class DjangoELDDataStore(ELDDataStore):
        """Django ORM implementation of ELD data storage"""
        
        def __init__(self):
            # This would use Django models defined in your Django app
            pass
        
        def store_hos_log(self, log_data: Dict[str, Any]) -> bool:
            # Implementation would use Django ORM
            pass
        
        def get_hos_logs(self, driver_id: Optional[str] = None, 
                        start_date: Optional[datetime] = None,
                        end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
            # Implementation would use Django ORM
            pass
        
        def store_dvir_report(self, dvir_data: Dict[str, Any]) -> bool:
            # Implementation would use Django ORM
            pass
        
        def get_dvir_reports(self, driver_id: Optional[str] = None,
                            vehicle_id: Optional[str] = None) -> List[Dict[str, Any]]:
            # Implementation would use Django ORM
            pass
        
        def store_alert(self, alert_data: Dict[str, Any]) -> bool:
            # Implementation would use Django ORM
            pass
        
        def get_alerts(self, driver_id: Optional[str] = None,
                      alert_type: Optional[str] = None) -> List[Dict[str, Any]]:
            # Implementation would use Django ORM
            pass

# --- Integration Helper Functions ---
def setup_flask_integration(app, db: SQLAlchemy):
    """Setup ELD module integration with Flask application"""
    if not FLASK_SQLALCHEMY_AVAILABLE:
        raise ImportError("Flask-SQLAlchemy is required for Flask integration")
    
    # Create data store
    data_store = FlaskELDDataStore(db)
    set_data_store(data_store)
    
    # Register blueprint if available
    try:
        from rapid_eld import eld_blueprint
        if eld_blueprint:
            app.register_blueprint(eld_blueprint)
    except ImportError:
        pass
    
    return data_store

def setup_django_integration():
    """Setup ELD module integration with Django application"""
    if not DJANGO_AVAILABLE:
        raise ImportError("Django is required for Django integration")
    
    # Create data store
    data_store = DjangoELDDataStore()
    set_data_store(data_store)
    
    return data_store

def create_eld_service(data_store: Optional[ELDDataStore] = None) -> ELDService:
    """Create an ELD service instance with optional custom data store"""
    return ELDService(data_store)
