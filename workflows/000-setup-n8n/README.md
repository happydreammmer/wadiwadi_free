# Simple n8n Self-hosted Deployment

Deploy n8n with PostgreSQL in one command. Created by Wadi Wadi Team.

## 🚀 Quick Start

```bash
# Download these files, then:
docker-compose up -d
```

That's it! n8n will be available at: **http://localhost:5678**

## 📁 What's Included

- `docker-compose.yml` - Main deployment file
- `.env` - Configuration file
- `README.md` - This file

## 🔧 First Run

When you first access n8n, you'll go through setup:
1. Open http://localhost:5678
2. Create your admin account
3. Start building workflows!

## ✏️ Configuration

Edit `.env` to customize settings:

```env
# Host settings
N8N_HOST=localhost
N8N_PROTOCOL=http

# Basic auth (if enabled)
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin_123$

# Database
POSTGRES_DB=n8n
POSTGRES_USER=n8n
POSTGRES_PASSWORD=n8n_password_123$
```

## 📋 Requirements

- Docker & Docker Compose installed
- Port 5678 available
- 2GB+ RAM recommended

## 🛠️ Commands

```bash
# Start n8n
docker-compose up -d

# Stop n8n
docker-compose down

# View logs
docker-compose logs -f

# Update to latest
docker-compose pull && docker-compose up -d

# Reset everything (DELETES DATA!)
docker-compose down -v
```

## 💾 Data Storage

Your workflows and data are stored in Docker volumes:
- `n8n_data` - n8n workflows and settings
- `postgres_data` - Database

Data persists between container restarts.

## 🆘 Troubleshooting

**n8n not accessible?**
```bash
docker-compose ps
docker-compose logs n8n
```

**Need to restart?**
```bash
docker-compose restart
```

## 🔗 Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community](https://community.n8n.io/)

---

**Template by Wadi Wadi Team** | Simple & Ready to Use