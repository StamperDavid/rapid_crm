# Sports Funder - Enterprise Sports Funding Platform

A comprehensive enterprise-level sports funding application built with FastAPI, PostgreSQL, and modern cloud technologies. This platform enables schools, coaches, and players to raise funds through product sales with complete sales tracking and attribution.

## 🚀 Features

### Core Functionality
- **Hierarchical Sales Tracking**: Complete attribution from sales agent → school → coach → player
- **QR Code Onboarding**: Streamlined registration process with QR code scanning
- **AI-Powered Assistant**: Google Gemini integration for customer support and recommendations
- **Multi-Channel Notifications**: SMS, email, and push notifications via Twilio
- **Local Business Integration**: Partner business directory with Google Reviews
- **Comprehensive Order Management**: Full e-commerce functionality with payment processing

### Enterprise Features
- **Scalable Architecture**: Built for high-volume transactions and concurrent users
- **Security**: JWT authentication, password hashing, and secure API endpoints
- **Monitoring**: Structured logging, health checks, and error tracking
- **Cloud-Ready**: Designed for Google Cloud Platform deployment
- **API-First**: RESTful API with OpenAPI documentation

## 🏗️ Architecture

### Technology Stack
- **Backend**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with OAuth2
- **AI**: Google Gemini API
- **Notifications**: Twilio SMS
- **Storage**: Google Cloud Storage
- **Deployment**: Docker, Google Cloud Run
- **Frontend**: React/Vue.js (planned)
- **Mobile**: React Native (planned)

### Database Schema
The application uses a hierarchical relationship model:
```
SalesAgent → School → Coach → Player → Order
```

## 📦 Installation

### Prerequisites
- Python 3.11+
- PostgreSQL 13+
- Docker & Docker Compose (optional)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sports_funder
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb sports_funder
   
   # Run migrations (when implemented)
   alembic upgrade head
   ```

6. **Run the application**
   ```bash
   uvicorn app.main:app --reload
   ```

### Docker Setup

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | JWT secret key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GOOGLE_API_KEY` | Google Gemini API key | No |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | No |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | No |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | No |

### API Configuration
- **Base URL**: `/api/v1`
- **Authentication**: Bearer token (JWT)
- **Documentation**: `/docs` (Swagger UI)
- **Alternative Docs**: `/redoc`

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh token

### Schools
- `POST /api/v1/schools/` - Create school
- `GET /api/v1/schools/` - List schools
- `GET /api/v1/schools/{id}` - Get school details
- `GET /api/v1/schools/{id}/qr-code` - Get school QR code

### AI Assistant
- `POST /api/v1/ai/ask` - Ask AI question
- `POST /api/v1/ai/recommendations` - Get product recommendations
- `POST /api/v1/ai/fundraising-tips` - Get fundraising tips

## 🔄 Sales Tracking Flow

1. **Sales Agent Onboarding**
   - Agent creates school record
   - System generates unique QR code for school

2. **Coach Onboarding**
   - Coach scans school QR code
   - Coach registers and gets linked to school
   - System generates coach QR code

3. **Player Onboarding**
   - Player scans coach QR code
   - Player registers and gets linked to coach
   - System tracks hierarchical relationship

4. **Sales Attribution**
   - Customer makes purchase through player's link
   - System traces sale back through: Player → Coach → School → Sales Agent
   - Commission and attribution automatically calculated

## 🚀 Deployment

### Google Cloud Platform

1. **Set up GCP project**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable required APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   ```

3. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy sports-funder \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Environment-Specific Configuration
- **Development**: Local PostgreSQL, debug mode enabled
- **Staging**: Cloud SQL, limited external API calls
- **Production**: Cloud SQL, full monitoring, SSL certificates

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

## 📊 Monitoring & Logging

- **Structured Logging**: JSON format with correlation IDs
- **Health Checks**: `/health` endpoint for monitoring
- **Error Tracking**: Comprehensive exception handling
- **Performance**: Request timing and database query monitoring

## 🔒 Security

- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Data Protection**: Password hashing with bcrypt
- **API Security**: Rate limiting and CORS configuration
- **Input Validation**: Pydantic models for all inputs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/docs`

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core backend API
- ✅ Database schema
- ✅ Authentication system
- ✅ QR code generation
- ✅ AI assistant integration

### Phase 2 (Next)
- 🔄 Payment processing (Stripe integration)
- 🔄 Frontend web application
- 🔄 Mobile app (React Native)
- 🔄 Advanced reporting dashboard

### Phase 3 (Future)
- 📋 Multi-tenant architecture
- 📋 Advanced analytics
- 📋 White-label solutions
- 📋 International expansion



