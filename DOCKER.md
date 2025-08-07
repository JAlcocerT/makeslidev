# 🐳 MakeSlidev Docker Deployment

This guide covers how to deploy MakeSlidev using Docker for production environments.

## 🚀 Quick Start

### Option 1: Using Make Commands (Recommended)
```bash
# Build and deploy in one command
make docker-deploy

# Or step by step
make docker-build
make docker-up
```

### Option 2: Using Docker Script
```bash
# Build images
./docker-makeslidev.sh build

# Start services
./docker-makeslidev.sh up
```

### Option 3: Using Docker Compose Directly
```bash
# Build and start
docker-compose up --build -d

# Stop
docker-compose down
```

## 📋 Available Commands

### Make Commands
- `make docker-build` - Build Docker images
- `make docker-up` - Start all services
- `make docker-down` - Stop all services  
- `make docker-restart` - Restart services
- `make docker-logs` - Show container logs
- `make docker-status` - Check service status
- `make docker-clean` - Clean up containers and volumes
- `make docker-deploy` - Full deployment (build + up)

### Docker Script Commands
- `./docker-makeslidev.sh build` - Build images
- `./docker-makeslidev.sh up` - Start services
- `./docker-makeslidev.sh down` - Stop services
- `./docker-makeslidev.sh restart [service]` - Restart services
- `./docker-makeslidev.sh logs [service]` - Show logs
- `./docker-makeslidev.sh status` - Show status
- `./docker-makeslidev.sh clean` - Clean up
- `./docker-makeslidev.sh shell` - Open backend shell
- `./docker-makeslidev.sh db` - Open MongoDB shell

## 🏗️ Architecture

MakeSlidev uses a multi-container architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   (Next.js)     │    │   (Express)     │    │   (Database)    │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Services

#### 🌐 Frontend (Next.js)
- **Container**: `makeslidev-frontend`
- **Port**: `3000`
- **Image**: Multi-stage build with Alpine Linux
- **Features**: Standalone output, optimized for production

#### 🔧 Backend (Express + TypeScript)
- **Container**: `makeslidev-backend`
- **Port**: `8080`
- **Image**: Multi-stage build with Alpine Linux
- **Features**: API endpoints, Slidev template processing

#### 🗄️ Database (MongoDB)
- **Container**: `makeslidev-mongodb`
- **Port**: `27017`
- **Image**: Official MongoDB 7.0
- **Features**: Persistent data storage, automatic initialization

## 🔧 Configuration

### Environment Variables

#### Backend
```bash
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb://admin:makeslidev123@mongodb:27017/makeslidev?authSource=admin
JWT_SECRET=makeslidev-jwt-secret-change-in-production
CORS_ORIGIN=http://localhost:3000
```

#### Frontend
```bash
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

#### MongoDB
```bash
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=makeslidev123
MONGO_INITDB_DATABASE=makeslidev
```

### Customization

To customize the deployment:

1. **Change Ports**: Edit `docker-compose.yml`
2. **Update Environment**: Modify environment variables in `docker-compose.yml`
3. **Database Config**: Update MongoDB credentials and initialization script
4. **Build Args**: Modify Dockerfile build arguments

## 📱 Access URLs

After deployment, access your application at:

- 🌐 **Frontend**: http://localhost:3000
- 🔗 **Slidev Editor**: http://localhost:3000/slidev
- 🔧 **Backend API**: http://localhost:8080
- 📚 **API Documentation**: http://localhost:8080/api-docs
- 🗄️ **MongoDB**: mongodb://admin:makeslidev123@localhost:27017/makeslidev

## 🏥 Health Checks

All containers include health checks:

- **Backend**: `GET /v1/health-check`
- **Frontend**: `GET /api/health`
- **MongoDB**: Built-in MongoDB health check

Check health status:
```bash
make docker-status
# or
./docker-makeslidev.sh status
```

## 📊 Monitoring

### View Logs
```bash
# All services
make docker-logs

# Specific service
./docker-makeslidev.sh logs backend
./docker-makeslidev.sh logs frontend
./docker-makeslidev.sh logs mongodb
```

### Container Status
```bash
make docker-status
```

### Resource Usage
```bash
docker stats makeslidev-frontend makeslidev-backend makeslidev-mongodb
```

## 🔒 Security

### Production Security Checklist

- [ ] Change default MongoDB credentials
- [ ] Update JWT secret
- [ ] Configure proper CORS origins
- [ ] Use HTTPS in production
- [ ] Set up proper firewall rules
- [ ] Enable MongoDB authentication
- [ ] Use Docker secrets for sensitive data

### Security Features

- **Non-root users**: All containers run as non-root users
- **Multi-stage builds**: Minimal production images
- **Health checks**: Automatic container health monitoring
- **Network isolation**: Services communicate via Docker network

## 🚀 Production Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ RAM
- 10GB+ disk space

### Deployment Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd makeslidev
   ```

2. **Configure Environment**
   ```bash
   # Update docker-compose.yml with production values
   # Change passwords, secrets, and URLs
   ```

3. **Deploy**
   ```bash
   make docker-deploy
   ```

4. **Verify Deployment**
   ```bash
   make docker-status
   curl http://localhost:3000/slidev
   ```

### Scaling

To scale services:
```bash
docker-compose up -d --scale backend=3
```

## 🧹 Maintenance

### Backup Database
```bash
docker exec makeslidev-mongodb mongodump --uri="mongodb://admin:makeslidev123@localhost:27017/makeslidev?authSource=admin" --out=/backup
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
make docker-deploy
```

### Clean Up
```bash
# Remove containers and volumes
make docker-clean

# Remove unused images
docker image prune -f
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :8080

# Kill the process or change ports in docker-compose.yml
```

#### Container Won't Start
```bash
# Check logs
make docker-logs

# Check container status
docker ps -a
```

#### Database Connection Issues
```bash
# Check MongoDB logs
./docker-makeslidev.sh logs mongodb

# Test connection
./docker-makeslidev.sh db
```

#### Build Failures
```bash
# Clean build cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache
```

### Debug Mode

To run in debug mode:
```bash
# Start with logs
docker-compose up

# Or check specific service
docker-compose logs -f backend
```

## 📈 Performance

### Optimization Tips

1. **Resource Limits**: Set memory/CPU limits in `docker-compose.yml`
2. **Volume Mounts**: Use bind mounts for development, volumes for production
3. **Image Size**: Multi-stage builds keep images small
4. **Caching**: Docker layer caching speeds up builds

### Monitoring

Use tools like:
- **Portainer**: Container management UI
- **cAdvisor**: Container metrics
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization

## 🎯 Next Steps

After successful deployment:

1. **Set up HTTPS** with reverse proxy (nginx/traefik)
2. **Configure CI/CD** pipeline
3. **Set up monitoring** and alerting
4. **Implement backup** strategy
5. **Scale horizontally** as needed

---

🎉 **Congratulations!** You now have MakeSlidev running in production with Docker!

For support, check the main README.md or open an issue.
