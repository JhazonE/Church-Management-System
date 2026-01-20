# CLC Finance - Docker Deployment

This guide explains how to deploy the CLC Finance application using Docker.

## ⚠️ Important Note

CLC Finance is primarily designed as a **desktop application** using Electron. Docker deployment is suitable for:
- **Server environments** (headless operation)
- **CI/CD pipelines** (testing and building)
- **Development environments** (containerized development)

For desktop usage, use the Windows executable (`CLC Finance.exe`) instead.

## 🐳 Docker Setup

### Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

### Quick Start

1. **Clone/Build the application**
   ```bash
   # Ensure the application is built
   npm run build
   ```

2. **Build the Docker image**
   ```bash
   docker build -t clc-finance .
   ```

3. **Run the container**
   ```bash
   docker run -p 3000:3000 -v $(pwd)/data:/app/data clc-finance
   ```

### Using Docker Compose (Recommended)

1. **Start the application**
   ```bash
   docker-compose up -d
   ```

2. **Check logs**
   ```bash
   docker-compose logs -f clc-finance
   ```

3. **Stop the application**
   ```bash
   docker-compose down
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `ELECTRON_DISABLE_SECURITY_WARNINGS` | `true` | Disable Electron security warnings |

### Volumes

- `./data:/app/data` - Bind mount local data directory for database persistence

### Ports

- `3000` - Web interface port (if running in server mode)

## 🏗️ Docker Architecture

### Base Image
- **Node.js 20 Alpine** - Lightweight Node.js environment

### System Dependencies
- X11 libraries for GUI support
- SQLite dependencies
- Mesa drivers for graphics
- Xvfb for headless operation

### Application Structure
```
 /app
 ├── .next/          # Next.js build output
 ├── out/           # Static export files
 ├── data/          # Database directory
 │   └── database.sqlite # SQLite database
 ├── electron/      # Electron main process
 └── src/           # Application source
 ```

## 🚀 Deployment Options

### Option 1: Headless Web Application

The Docker container runs the application as a web server:

```bash
# Access via web browser at http://localhost:3000
docker run -p 3000:3000 clc-finance
```

### Option 2: With Persistent Data

```bash
# Data persists between container restarts
docker run -p 3000:3000 -v $(pwd)/data:/app/data clc-finance
```

### Option 3: Development Mode

```bash
# Mount source code for development
docker run -p 3000:3000 -v $(pwd):/app -v $(pwd)/data:/app/data clc-finance
```

## 🔍 Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   # Check logs
   docker logs <container-id>

   # Check if port 3000 is available
   netstat -tulpn | grep :3000
   ```

2. **Database issues**
   ```bash
   # Check database file
   docker exec -it <container-id> ls -la /app/data/database.sqlite

   # Note: Database is bind-mounted from local ./data directory
   # To reset, manually remove or backup the local database.sqlite file
   ```

3. **GUI not working**
   - The Docker setup uses Xvfb for headless operation
   - For GUI support, additional configuration is needed

### Logs and Debugging

```bash
# View application logs
docker-compose logs -f

# Access container shell
docker exec -it clc-finance-app sh

# Check database
docker exec -it clc-finance-app sqlite3 /app/data/database.sqlite ".tables"
```

## 📊 Monitoring

### Health Checks

The application exposes a health endpoint at `http://localhost:3000/api/health` (if implemented).

### Resource Usage

```bash
# Monitor container resources
docker stats clc-finance-app
```

## 🔒 Security Considerations

- The container runs with necessary privileges for GUI applications
- Database is bind-mounted from local directory for direct access
- Consider network isolation for production deployments

## 🔐 Default Login Credentials

For Docker deployments (SQLite), the default login credentials are:

- **Admin User**: username: `admin`, password: `password`
- **Staff User**: username: `staff`, password: `password`

*Note: These match the local development setup credentials.*

## 📝 Development Workflow

1. **Make changes** to the source code
2. **Rebuild the image**
   ```bash
   docker-compose build --no-cache
   ```
3. **Restart the container**
   ```bash
   docker-compose up -d
   ```

## 🆘 Support

For issues specific to Docker deployment:
1. Check the application logs
2. Verify Docker and Docker Compose versions
3. Ensure sufficient system resources
4. Check network connectivity

For application-specific issues, refer to the main README.md.
