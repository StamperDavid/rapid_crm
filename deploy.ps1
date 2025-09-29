# Rapid CRM ELD Service - Production Deployment Script (PowerShell)
# This script sets up the complete ELD compliance service platform

Write-Host "🚀 Rapid CRM ELD Service - Production Deployment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose is installed: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Create necessary directories
Write-Host "📁 Creating directories..." -ForegroundColor Yellow
if (!(Test-Path "instance")) { New-Item -ItemType Directory -Path "instance" }
if (!(Test-Path "public\uploads")) { New-Item -ItemType Directory -Path "public\uploads" }
if (!(Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" }

# Set up environment variables
Write-Host "⚙️ Setting up environment variables..." -ForegroundColor Yellow
if (!(Test-Path ".env.production")) {
    $envContent = @"
# Production Environment Variables
NODE_ENV=production
PORT=3001
VITE_API_URL=http://localhost:3001

# ELD Service Configuration
ELD_AUTOMATION_ENABLED=true
ELD_COMPLIANCE_MONITORING=true
IFTA_QUARTERLY_AUTOMATION=true
AI_AGENT_INTEGRATION=true

# Stripe Configuration (Demo Keys - Replace with real keys for production)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_demo_key_replace_with_real
REACT_APP_STRIPE_SECRET_KEY=sk_live_demo_key_replace_with_real
REACT_APP_STRIPE_WEBHOOK_SECRET=whsec_demo_secret_replace_with_real

# ELD Provider API Keys (Demo Keys - Replace with real keys for production)
SAMSARA_API_KEY=demo_samsara_key_replace_with_real
GEOTAB_API_KEY=demo_geotab_key_replace_with_real
VERIZON_CONNECT_API_KEY=demo_verizon_key_replace_with_real
OMNITRACS_API_KEY=demo_omnitracs_key_replace_with_real
"@
    
    Set-Content -Path ".env.production" -Value $envContent
    Write-Host "✅ Created .env.production file with demo keys" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Replace demo API keys with real keys before going live!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.production already exists" -ForegroundColor Green
}

# Initialize database if it doesn't exist
Write-Host "🗄️ Initializing database..." -ForegroundColor Yellow
if (!(Test-Path "instance\rapid_crm.db")) {
    Write-Host "Creating new database..." -ForegroundColor Yellow
    # Copy the schema and initialize
    Copy-Item "src\database\schema.sql" "instance\"
    Copy-Item "src\database\seedData_empty.sql" "instance\"
    
    # Initialize with demo data
    Write-Host "📊 Adding demo data..." -ForegroundColor Yellow
    node add_api_keys.js
    Write-Host "✅ Database initialized with demo data" -ForegroundColor Green
} else {
    Write-Host "✅ Database already exists" -ForegroundColor Green
}

# Build and start services
Write-Host "🏗️ Building Docker images..." -ForegroundColor Yellow
docker-compose build

Write-Host "🚀 Starting services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check if services are running
Write-Host "🔍 Checking service health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend service is healthy" -ForegroundColor Green
    } else {
        throw "Backend service returned status code: $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Backend service is not responding" -ForegroundColor Red
    Write-Host "📋 Checking logs..." -ForegroundColor Yellow
    docker-compose logs backend
    exit 1
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend service is healthy" -ForegroundColor Green
    } else {
        throw "Frontend service returned status code: $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Frontend service is not responding" -ForegroundColor Red
    Write-Host "📋 Checking logs..." -ForegroundColor Yellow
    docker-compose logs frontend
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access Points:" -ForegroundColor Cyan
Write-Host "   • Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   • Backend API: http://localhost:3001/api" -ForegroundColor White
Write-Host "   • Health Check: http://localhost:3001/api/health" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Demo Credentials:" -ForegroundColor Cyan
Write-Host "   • Admin Login: admin@rapidcrm.com / admin123" -ForegroundColor White
Write-Host "   • Demo Client: demo@abctrucking.com / demo123" -ForegroundColor White
Write-Host ""
Write-Host "📊 ELD Service Features:" -ForegroundColor Cyan
Write-Host "   • Client onboarding with subscription billing" -ForegroundColor White
Write-Host "   • Real-time ELD data integration" -ForegroundColor White
Write-Host "   • Compliance monitoring and reporting" -ForegroundColor White
Write-Host "   • Revenue analytics dashboard" -ForegroundColor White
Write-Host "   • AI-powered assistance" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Replace demo API keys in .env.production with real keys" -ForegroundColor White
Write-Host "   2. Configure your ELD provider integrations" -ForegroundColor White
Write-Host "   3. Set up Stripe webhooks for payment processing" -ForegroundColor White
Write-Host "   4. Add your first clients through the onboarding flow" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   • API Documentation: http://localhost:3001/api/docs" -ForegroundColor White
Write-Host "   • Admin Panel: http://localhost:3000/admin" -ForegroundColor White
Write-Host "   • Client Portal: http://localhost:3000/client-portal" -ForegroundColor White
Write-Host ""
Write-Host "🛠️ Management Commands:" -ForegroundColor Cyan
Write-Host "   • View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   • Stop services: docker-compose down" -ForegroundColor White
Write-Host "   • Restart services: docker-compose restart" -ForegroundColor White
Write-Host "   • Update services: docker-compose pull && docker-compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Your ELD compliance service is ready for business!" -ForegroundColor Green



