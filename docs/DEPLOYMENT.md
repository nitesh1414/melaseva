# Mela Seva - Deployment Guide

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **CPU**: 2+ cores
- **Storage**: 50GB+ SSD
- **Network**: Stable internet connection

### Software Requirements
- Node.js 18+ (LTS recommended)
- MongoDB 6.0+
- Nginx (reverse proxy)
- PM2 (process manager)
- Git

## 1. Server Setup

### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

## 2. Clone Repository

```bash
cd /var/www
sudo git clone <repository-url> melaseva
cd melaseva
sudo chown -R $USER:$USER .
```

## 3. Backend Setup

```bash
cd /var/www/melaseva/backend

# Install dependencies
npm install --production

# Create environment file
cp .env.example .env
nano .env
```

### Configure .env
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/melaseva
JWT_SECRET=<generate-strong-random-string>
JWT_REFRESH_SECRET=<generate-another-strong-random-string>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
SMS_API_URL=<your-sms-provider-url>
SMS_API_KEY=<your-sms-api-key>
MAP_PROVIDER=osm
MAP_API_KEY=<your-mapbox-key-if-using-mapbox>
APP_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### Generate Secrets
```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Create Upload Directories
```bash
mkdir -p uploads/{complaints,assets,profiles,qr-codes,imports}
chmod -R 755 uploads
```

### Seed Database (First Time)
```bash
npm run seed
```

### Start Backend with PM2
```bash
pm2 start src/server.js --name melaseva-api
pm2 save
pm2 startup
```

## 4. Web Frontend Setup

```bash
cd /var/www/melaseva/web

# Install dependencies
npm install

# Create environment file
cp .env.example .env
nano .env
```

### Configure .env
```env
VITE_API_URL=https://api.your-domain.com/api
VITE_MAP_PROVIDER=osm
VITE_MAP_API_KEY=<your-mapbox-key-if-using-mapbox>
VITE_APP_NAME=Mela Seva
```

### Build Production Bundle
```bash
npm run build
```

## 5. Nginx Configuration

### Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/melaseva
```

### Nginx Configuration
```nginx
# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # File upload size
        client_max_body_size 20M;
    }
}

# Web Frontend
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/melaseva/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (alternative to separate subdomain)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Upload files
    location /uploads {
        alias /var/www/melaseva/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/melaseva /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal is configured automatically
```

## 7. MongoDB Backup

### Create Backup Script
```bash
sudo nano /usr/local/bin/melaseva-backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/melaseva"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Create backup
mongodump --db melaseva --out $BACKUP_DIR/backup_$DATE

# Compress
cd $BACKUP_DIR
tar -czf backup_$DATE.tar.gz backup_$DATE
rm -rf backup_$DATE

# Delete old backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

```bash
sudo chmod +x /usr/local/bin/melaseva-backup.sh
```

### Schedule Backup (Cron)
```bash
sudo crontab -e
```

Add:
```
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/melaseva-backup.sh >> /var/log/melaseva-backup.log 2>&1
```

## 8. Monitoring

### PM2 Monitoring
```bash
pm2 monit
```

### Log Management
```bash
# View backend logs
pm2 logs melaseva-api

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 9. Firewall Configuration

```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

## 10. Performance Optimization

### MongoDB Optimization
```bash
sudo nano /etc/mongod.conf
```

Add/modify:
```yaml
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2  # Adjust based on available RAM

operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100
```

### Nginx Caching
Add to server block:
```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

## 11. Scaling

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Run multiple backend instances with PM2 cluster mode
- Use MongoDB replica set
- Use Redis for session storage (optional)

### PM2 Cluster Mode
```bash
pm2 start src/server.js -i max --name melaseva-api
```

## 12. Troubleshooting

### Backend Issues
```bash
# Check if port is in use
sudo lsof -i :5000

# Check PM2 status
pm2 status
pm2 logs melaseva-api --lines 100
```

### MongoDB Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

## 13. Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW)
- [ ] Set up regular backups
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
- [ ] Configure rate limiting
- [ ] Set up monitoring/alerts
- [ ] Restrict file upload types and sizes
- [ ] Enable CORS for specific domains only

## 14. Update Deployment

### Backend Update
```bash
cd /var/www/melaseva/backend
git pull origin main
npm install --production
pm2 restart melaseva-api
```

### Frontend Update
```bash
cd /var/www/melaseva/web
git pull origin main
npm install
npm run build
# Nginx will automatically serve the new build
```

---

For support, contact your system administrator or refer to the main README.md.
