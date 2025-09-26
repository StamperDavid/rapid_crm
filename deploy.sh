#!/bin/bash

# Rapid CRM ELD Service - Production Deployment Script
# This script sets up the complete ELD compliance service platform

set -e

echo "🚀 Rapid CRM ELD Service - Production Deployment"
echo "================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p instance
mkdir -p public/uploads
mkdir -p logs

# Set up environment variables
echo "⚙️ Setting up environment variables..."
if [ ! -f .env.production ]; then
    cat > .env.production << EOF
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
EOF
    echo "✅ Created .env.production file with demo keys"
    echo "⚠️  IMPORTANT: Replace demo API keys with real keys before going live!"
else
    echo "✅ .env.production already exists"
fi

# Initialize database if it doesn't exist
echo "🗄️ Initializing database..."
if [ ! -f instance/rapid_crm.db ]; then
    echo "Creating new database..."
    # Copy the schema and initialize
    cp src/database/schema.sql instance/
    cp src/database/seedData_empty.sql instance/
    
    # Initialize with demo data
    echo "📊 Adding demo data..."
    node add_api_keys.js
    echo "✅ Database initialized with demo data"
else
    echo "✅ Database already exists"
fi

# Build and start services
echo "🏗️ Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend service is healthy"
else
    echo "❌ Backend service is not responding"
    echo "📋 Checking logs..."
    docker-compose logs backend
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend service is healthy"
else
    echo "❌ Frontend service is not responding"
    echo "📋 Checking logs..."
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "📱 Access Points:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:3001/api"
echo "   • Health Check: http://localhost:3001/api/health"
echo ""
echo "🔑 Demo Credentials:"
echo "   • Admin Login: admin@rapidcrm.com / admin123"
echo "   • Demo Client: demo@abctrucking.com / demo123"
echo ""
echo "📊 ELD Service Features:"
echo "   • Client onboarding with subscription billing"
echo "   • Real-time ELD data integration"
echo "   • Compliance monitoring and reporting"
echo "   • Revenue analytics dashboard"
echo "   • AI-powered assistance"
echo ""
echo "⚠️  Next Steps:"
echo "   1. Replace demo API keys in .env.production with real keys"
echo "   2. Configure your ELD provider integrations"
echo "   3. Set up Stripe webhooks for payment processing"
echo "   4. Add your first clients through the onboarding flow"
echo ""
echo "📚 Documentation:"
echo "   • API Documentation: http://localhost:3001/api/docs"
echo "   • Admin Panel: http://localhost:3000/admin"
echo "   • Client Portal: http://localhost:3000/client-portal"
echo ""
echo "🛠️ Management Commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop services: docker-compose down"
echo "   • Restart services: docker-compose restart"
echo "   • Update services: docker-compose pull && docker-compose up -d"
echo ""
echo "🚀 Your ELD compliance service is ready for business!"


