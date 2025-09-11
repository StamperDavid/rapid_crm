# Rapid ELD - Electronic Logging Device Module

A modular Electronic Logging Device (ELD) system for Hours of Service (HOS) and Driver Vehicle Inspection Report (DVIR) compliance. Designed to be used standalone or integrated with existing client portal applications.

## Features

- **Modular Design**: Can be used standalone or integrated with existing applications
- **Hours of Service (HOS) Management**: Track driver hours and detect violations
- **Driver Vehicle Inspection Reports (DVIR)**: Manage vehicle inspection reports
- **Flexible Data Storage**: Pluggable data store interface with multiple implementations
- **Optional Web API**: RESTful endpoints when Flask is available
- **Background Processing**: Celery tasks for data synchronization (optional)
- **Geotab Integration**: Connects to Geotab API for fleet data

## Installation

### Core Installation (Standalone)
For basic functionality without web framework dependencies:

```bash
pip install -r requirements-core.txt
```

### Full Installation (With Flask Integration)
For complete functionality including web API:

```bash
pip install -r requirements.txt
```

## Usage

### Standalone Usage

```python
from rapid_eld import ELDService

# Create service with default in-memory storage
service = ELDService()

# Get HOS status
hos_status = service.get_hos_status()
print(f"HOS Status: {hos_status}")

# Get alerts
alerts = service.get_alerts()
print(f"Alerts: {alerts}")

# Generate roadside inspection report
report = service.generate_roadside_inspection_report("driver_123")
print(f"Report: {report}")
```

### Flask Integration

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from eld_integration import setup_flask_integration

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///eld.db'
db = SQLAlchemy(app)

# Setup ELD integration
data_store = setup_flask_integration(app, db)

# Create tables
with app.app_context():
    db.create_all()

app.run()
```

### Custom Data Store

```python
from rapid_eld import ELDDataStore, ELDService
from typing import Dict, List, Optional, Any

class MyCustomDataStore(ELDDataStore):
    def store_hos_log(self, log_data: Dict[str, Any]) -> bool:
        # Your custom storage logic
        return True
    
    def get_hos_logs(self, driver_id: Optional[str] = None, 
                    start_date: Optional[datetime] = None,
                    end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        # Your custom retrieval logic
        return []
    
    # Implement other required methods...

# Use custom data store
service = ELDService(MyCustomDataStore())
```

## API Endpoints (Flask Integration)

When Flask is available, the following endpoints are automatically registered:

### HOS Status
- **GET** `/api/eld/hos-status` - Get real-time HOS status for all drivers
- **GET** `/api/eld/hos-status?driver_id=123` - Get HOS status for specific driver

### Alerts
- **GET** `/api/eld/alerts` - Get all ELD-related alerts
- **GET** `/api/eld/alerts?driver_id=123` - Get alerts for specific driver
- **GET** `/api/eld/alerts?type=hos_violation` - Get alerts by type

### Roadside Inspection
- **POST** `/api/eld/roadside-inspection` - Generate roadside inspection report
  - Body: `{"driverId": "driver_id"}`

## Background Tasks (Celery Integration)

When Celery is available, the following tasks are registered:

- `fetch_eld_data` - Main sync task (run every 5-15 minutes)
- `run_hos_violation_check` - AI-powered violation detection

To start Celery workers:
```bash
celery -A rapid_eld worker --loglevel=info
celery -A rapid_eld beat --loglevel=info
```

## Configuration

### Environment Variables

- `REDIS_URL` - Redis connection URL (for Celery)
- `GEOTAB_API_KEY` - Geotab API key
- `GEOTAB_USERNAME` - Geotab username
- `GEOTAB_DATABASE` - Geotab database name

## Integration Examples

See `integration_examples.py` for comprehensive examples of:
- Standalone usage
- Flask integration
- Custom data store implementation
- Celery integration
- Client portal integration

## Architecture

The module is designed with separation of concerns:

- **`rapid_eld.py`**: Core ELD business logic and service classes
- **`eld_integration.py`**: Integration adapters for different frameworks
- **`integration_examples.py`**: Usage examples and patterns
- **`models.py`**: Database models (for reference)
- **`app.py`**: Example Flask application

## Development

The module uses an abstract data store interface, making it easy to:
- Use in-memory storage for testing
- Integrate with existing databases
- Implement custom storage backends
- Mock data stores for unit testing

## License

This project is designed to be modular and easily integrable with existing client portal applications while maintaining independence and reusability.
