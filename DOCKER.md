# Docker Containerization Guide

## Overview
Rapid CRM is now fully containerized with Docker, providing a consistent development and production environment.

## Architecture
- **Frontend**: React + Vite + Nginx (Production) / Vite Dev Server (Development)
- **Backend**: Express.js + SQLite
- **Database**: SQLite with persistent volumes
- **Networking**: Docker bridge network for service communication

## Quick Start

### Production Deployment
```bash
# Build and start all services
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Development Environment
```bash
# Start development environment with hot reload
npm run docker:dev

# View logs
npm run docker:logs
```

## Services

### Frontend (Port 3000)
- **Production**: Nginx serving built React app
- **Development**: Vite dev server with hot reload
- **API Proxy**: Routes `/api/*` requests to backend

### Backend (Port 3001)
- **Express.js server** with SQLite database
- **Health check endpoint**: `/api/health`
- **Database initialization** on first run
- **Persistent data** via Docker volumes

### Database
- **SQLite database** with persistent storage
- **Automatic initialization** with schema and seed data
- **Volume mounting** for data persistence

## Environment Configuration

### Copy environment template
```bash
cp env.example .env
```

### Key Environment Variables
- `NODE_ENV`: development/production
- `PORT`: Backend server port (default: 3001)
- `DB_PATH`: Database file path
- `VITE_API_HOST`: Frontend API host configuration

## Docker Commands

### Build Images
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build backend
```

### Run Services
```bash
# Start in background
docker-compose up -d

# Start with logs
docker-compose up

# Start development environment
docker-compose -f docker-compose.dev.yml up
```

### Manage Services
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Database Management
```bash
# Access database container
docker-compose exec database sh

# Backup database
docker cp rapid-crm_database_1:/app/data/rapid_crm.db ./backup.db

# Restore database
docker cp ./backup.db rapid-crm_database_1:/app/data/rapid_crm.db
```

## Development Workflow

### Local Development
1. **Start development environment**:
   ```bash
   npm run docker:dev
   ```

2. **Access services**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Health Check: http://localhost:3001/api/health

3. **Make changes**: Files are mounted as volumes for hot reload

### Production Deployment
1. **Build production images**:
   ```bash
   npm run docker:build
   ```

2. **Deploy to production**:
   ```bash
   npm run docker:up
   ```

3. **Monitor services**:
   ```bash
   npm run docker:logs
   ```

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Use different ports in docker-compose.yml
```

#### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Check database logs
docker-compose logs database
```

#### Build Issues
```bash
# Clean build cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Health Checks
- **Backend**: `curl http://localhost:3001/api/health`
- **Frontend**: `curl http://localhost:3000`

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f database
```

## Security Considerations

### Production Deployment
1. **Use environment variables** for sensitive data
2. **Enable HTTPS** with reverse proxy (nginx/traefik)
3. **Regular security updates** of base images
4. **Network isolation** with custom Docker networks
5. **Resource limits** in docker-compose.yml

### Environment Variables
- Never commit `.env` files
- Use Docker secrets for sensitive data
- Rotate API keys regularly

## Performance Optimization

### Production Optimizations
- **Multi-stage builds** for smaller images
- **Nginx caching** for static assets
- **Gzip compression** enabled
- **Health checks** for container orchestration
- **Resource limits** and monitoring

### Monitoring
- **Container health checks**
- **Application metrics** via `/api/health`
- **Log aggregation** with Docker logging drivers
- **Resource monitoring** with Docker stats

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec database sqlite3 /app/data/rapid_crm.db ".backup /app/backup/rapid_crm_$(date +%Y%m%d_%H%M%S).db"

# Restore from backup
docker-compose exec database sqlite3 /app/data/rapid_crm.db ".restore /app/backup/rapid_crm_20240101_120000.db"
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v rapid-crm_rapid-crm-db:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v rapid-crm_rapid-crm-db:/data -v $(pwd):/backup alpine tar xzf /backup/db-backup.tar.gz -C /data
```
