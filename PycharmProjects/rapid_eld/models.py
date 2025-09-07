"""
Database models for the ELD Client Portal
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Index

db = SQLAlchemy()

class Driver(db.Model):
    """Driver model"""
    __tablename__ = 'drivers'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    company_id = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hos_logs = db.relationship('HOSLog', backref='driver', lazy='dynamic')
    dvir_reports = db.relationship('DVIRReport', backref='driver', lazy='dynamic')
    alerts = db.relationship('Alert', backref='driver', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'license_number': self.license_number,
            'phone': self.phone,
            'email': self.email,
            'company_id': self.company_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Vehicle(db.Model):
    """Vehicle model"""
    __tablename__ = 'vehicles'
    
    id = db.Column(db.String(50), primary_key=True)
    vin = db.Column(db.String(17), unique=True, nullable=False)
    make = db.Column(db.String(50))
    model = db.Column(db.String(50))
    year = db.Column(db.Integer)
    license_plate = db.Column(db.String(20))
    company_id = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    dvir_reports = db.relationship('DVIRReport', backref='vehicle', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'vin': self.vin,
            'make': self.make,
            'model': self.model,
            'year': self.year,
            'license_plate': self.license_plate,
            'company_id': self.company_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class HOSLog(db.Model):
    """Hours of Service log model"""
    __tablename__ = 'hos_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.String(50), db.ForeignKey('drivers.id'), nullable=False)
    vehicle_id = db.Column(db.String(50), db.ForeignKey('vehicles.id'))
    log_type = db.Column(db.String(20), nullable=False)  # 'driving', 'on_duty', 'off_duty', 'sleeper_berth'
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    location = db.Column(db.String(200))
    odometer_reading = db.Column(db.Integer)
    is_edited = db.Column(db.Boolean, default=False)
    edit_reason = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_hos_driver_time', 'driver_id', 'start_time'),
        Index('idx_hos_type_time', 'log_type', 'start_time'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'driver_id': self.driver_id,
            'vehicle_id': self.vehicle_id,
            'log_type': self.log_type,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'location': self.location,
            'odometer_reading': self.odometer_reading,
            'is_edited': self.is_edited,
            'edit_reason': self.edit_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class DVIRReport(db.Model):
    """Driver Vehicle Inspection Report model"""
    __tablename__ = 'dvir_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.String(50), db.ForeignKey('drivers.id'), nullable=False)
    vehicle_id = db.Column(db.String(50), db.ForeignKey('vehicles.id'), nullable=False)
    inspection_type = db.Column(db.String(20), nullable=False)  # 'pre_trip', 'post_trip', 'roadside'
    inspection_date = db.Column(db.DateTime, nullable=False)
    defects = db.Column(db.JSON)  # Store defects as JSON
    is_safe_to_drive = db.Column(db.Boolean, nullable=False)
    signature = db.Column(db.Text)  # Base64 encoded signature
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_dvir_driver_date', 'driver_id', 'inspection_date'),
        Index('idx_dvir_vehicle_date', 'vehicle_id', 'inspection_date'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'driver_id': self.driver_id,
            'vehicle_id': self.vehicle_id,
            'inspection_type': self.inspection_type,
            'inspection_date': self.inspection_date.isoformat() if self.inspection_date else None,
            'defects': self.defects,
            'is_safe_to_drive': self.is_safe_to_drive,
            'signature': self.signature,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Alert(db.Model):
    """Alert model for HOS violations and other notifications"""
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.String(50), db.ForeignKey('drivers.id'), nullable=False)
    alert_type = db.Column(db.String(50), nullable=False)  # 'hos_violation', 'dvir_defect', 'system_alert'
    severity = db.Column(db.String(20), nullable=False)  # 'low', 'medium', 'high', 'critical'
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    is_resolved = db.Column(db.Boolean, default=False)
    resolved_at = db.Column(db.DateTime)
    resolved_by = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_alert_driver_status', 'driver_id', 'is_read', 'is_resolved'),
        Index('idx_alert_type_severity', 'alert_type', 'severity'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'driver_id': self.driver_id,
            'alert_type': self.alert_type,
            'severity': self.severity,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'is_resolved': self.is_resolved,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'resolved_by': self.resolved_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Company(db.Model):
    """Company model for multi-tenant support"""
    __tablename__ = 'companies'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.Text)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    dot_number = db.Column(db.String(20))  # DOT number for compliance
    mc_number = db.Column(db.String(20))   # MC number
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    drivers = db.relationship('Driver', backref='company', lazy='dynamic')
    vehicles = db.relationship('Vehicle', backref='company', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'dot_number': self.dot_number,
            'mc_number': self.mc_number,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
