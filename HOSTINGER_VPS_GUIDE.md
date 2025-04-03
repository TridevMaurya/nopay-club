# Hostinger VPS Deployment Guide for NoPay Club

This guide provides step-by-step instructions for deploying the NoPay Club application on a Hostinger VPS with Ubuntu and hPanel.

## 1. VPS Selection in Hostinger

### Recommended Plan Selection
1. Log in to your Hostinger account
2. Navigate to "VPS Hosting" section
3. Select a plan with these minimum specs:
   - 2GB RAM
   - 2 CPU cores
   - 50GB SSD storage
   - Ubuntu 22.04 LTS
4. Important add-ons to include:
   - Dedicated IP (for SSL setup)
   - Daily backups
   - DDoS protection

### Initial VPS Setup in hPanel
1. Access your hPanel dashboard
2. Set a strong root password
3. Configure hostname (e.g., nopay-club.yourdomain.com)
4. Set up SSH keys for secure access
5. Configure correct timezone

## 2. Domain Configuration

### DNS Setup
1. In hPanel, navigate to "Domains" → "DNS Zone"
2. Add A record pointing to your VPS IP address:
   - Type: A
   - Name: @ (or subdomain like "app")
   - IP Address: Your VPS IP
   - TTL: Automatic (or 3600)

### Domain Activation
1. Wait for DNS propagation (could take 24-48 hours)
2. Verify DNS propagation with:
   ```bash
   dig yourdomain.com
   ```

## 3. Accessing Your VPS

### SSH Access
1. Open terminal on your local machine
2. Connect using the credentials from hPanel:
   ```bash
   ssh root@your_server_ip
   ```
3. Accept the server fingerprint when prompted

### Create Non-Root User (Security Best Practice)
1. Create a new user:
   ```bash
   adduser deploy
   ```
2. Add to sudo group:
   ```bash
   usermod -aG sudo deploy
   ```
3. Switch to the new user:
   ```bash
   su - deploy
   ```

## 4. Server Preparation

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Required Packages
```bash
sudo apt install -y curl wget git build-essential
```

### Set Up Firewall
```bash
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Install PM2
```bash
sudo npm install -g pm2
```

## 5. MongoDB Setup

### Install MongoDB
```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start and enable MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Secure MongoDB
1. Create admin user:
   ```bash
   mongosh
   ```
   
   ```javascript
   use admin
   db.createUser({
     user: "adminUser",
     pwd: "securePassword",
     roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
   })
   
   // Create application database and user
   use nopay_club
   db.createUser({
     user: "nopay_user",
     pwd: "secureAppPassword",
     roles: [ { role: "readWrite", db: "nopay_club" } ]
   })
   
   exit
   ```

2. Enable MongoDB authentication:
   ```bash
   sudo nano /etc/mongod.conf
   ```
   
   Add or modify the security section:
   ```yaml
   security:
     authorization: enabled
   ```
   
   Modify network interfaces section:
   ```yaml
   net:
     port: 27017
     bindIp: 127.0.0.1
   ```
   
3. Restart MongoDB:
   ```bash
   sudo systemctl restart mongod
   ```

4. Test connection:
   ```bash
   mongosh --host localhost --port 27017 -u nopay_user -p secureAppPassword --authenticationDatabase nopay_club
   ```

## 6. Application Deployment

### Application Directory Setup
```bash
sudo mkdir -p /var/www/nopay-club
sudo chown -R $USER:$USER /var/www/nopay-club
```

### Clone Repository
```bash
cd /var/www/nopay-club
git clone https://your-repository-url.git .
```

### Install Dependencies
```bash
npm install --production
```

### Environment Configuration
1. Create .env file:
   ```bash
   nano .env
   ```

2. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://nopay_user:secureAppPassword@localhost:27017/nopay_club
   ```

### Build Application
```bash
npm run build
```

## 7. Process Management with PM2

### Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

Add configuration:
```javascript
module.exports = {
  apps: [{
    name: "nopay-club",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    },
    max_memory_restart: "300M",
    node_args: "--max-old-space-size=256",
    log_date_format: "YYYY-MM-DD HH:mm Z",
    error_file: "/var/www/nopay-club/logs/error.log",
    out_file: "/var/www/nopay-club/logs/output.log"
  }]
};
```

### Create Logs Directory
```bash
mkdir -p /var/www/nopay-club/logs
```

### Start Application with PM2
```bash
pm2 start ecosystem.config.js
```

### Set PM2 to Start on System Boot
```bash
pm2 startup
pm2 save
```

## 8. Nginx Configuration

### Create Nginx Server Block
```bash
sudo nano /etc/nginx/sites-available/nopay-club
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    access_log /var/log/nginx/nopay-club-access.log;
    error_log /var/log/nginx/nopay-club-error.log;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|webp|svg|ico)$ {
        proxy_pass http://localhost:5000;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

### Enable Site Configuration
```bash
sudo ln -s /etc/nginx/sites-available/nopay-club /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 9. SSL Setup with Let's Encrypt

### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to complete the certificate installation.

### Verify Auto-renewal
```bash
sudo systemctl status certbot.timer
```

## 10. Security Hardening

### Install Fail2ban
```bash
sudo apt install -y fail2ban
```

### Configure Fail2ban for SSH Protection
```bash
sudo nano /etc/fail2ban/jail.local
```

Add configuration:
```
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
findtime = 600
bantime = 3600
```

### Start and Enable Fail2ban
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Additional Security Measures
1. **Disable Password Authentication for SSH** (if using SSH keys):
   ```bash
   sudo nano /etc/ssh/sshd_config
   ```
   
   Set:
   ```
   PasswordAuthentication no
   ```
   
   Restart SSH:
   ```bash
   sudo systemctl restart sshd
   ```

2. **Install and configure Logwatch** for security monitoring:
   ```bash
   sudo apt install -y logwatch
   ```

## 11. Backup Configuration

### Create MongoDB Backup Script
```bash
sudo mkdir -p /var/backups/mongodb
nano /var/www/nopay-club/scripts/mongodb-backup.sh
```

Add script content:
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
mkdir -p $BACKUP_DIR

# Create backup
mongodump --uri="mongodb://nopay_user:secureAppPassword@localhost:27017/nopay_club" --out="$BACKUP_DIR/backup_$TIMESTAMP"

# Compress backup
cd $BACKUP_DIR
tar -czf "backup_$TIMESTAMP.tar.gz" "backup_$TIMESTAMP"

# Remove uncompressed backup
rm -rf "backup_$TIMESTAMP"

# Keep only last 7 backups
find $BACKUP_DIR -name "backup_*.tar.gz" -type f -mtime +7 -delete
```

### Make Script Executable
```bash
chmod +x /var/www/nopay-club/scripts/mongodb-backup.sh
```

### Schedule Regular Backups
```bash
crontab -e
```

Add cron job:
```
0 3 * * * /var/www/nopay-club/scripts/mongodb-backup.sh
```

### Upload Backups to Hostinger Object Storage (Optional)
For long-term backup storage, you can use Hostinger's Object Storage option.

## 12. Monitoring Setup

### Install Monitoring Tools
```bash
sudo apt install -y htop net-tools
```

### Set Up Simple Monitoring Script
```bash
nano /var/www/nopay-club/scripts/monitor.sh
```

Add script content:
```bash
#!/bin/bash
echo "===== SERVER STATS ====="
date
echo ""
echo "==== MEMORY USAGE ===="
free -h
echo ""
echo "==== DISK USAGE ===="
df -h /
echo ""
echo "==== CPU LOAD ===="
uptime
echo ""
echo "==== NODEJS APP STATUS ===="
pm2 status
echo ""
echo "==== NGINX STATUS ===="
systemctl status nginx | grep Active
echo ""
echo "==== MONGODB STATUS ===="
systemctl status mongod | grep Active
```

### Make Executable
```bash
chmod +x /var/www/nopay-club/scripts/monitor.sh
```

## 13. Updating the Application

### Create Update Script
```bash
nano /var/www/nopay-club/scripts/update-app.sh
```

Add script content:
```bash
#!/bin/bash
cd /var/www/nopay-club

# Pull latest changes
git pull

# Install dependencies
npm install --production

# Build the application
npm run build

# Restart the application
pm2 restart nopay-club

# Test the application
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health

echo "Application updated successfully!"
```

### Make Executable
```bash
chmod +x /var/www/nopay-club/scripts/update-app.sh
```

## 14. Updating Canva Link

### Create Canva Link Update Script
```bash
nano /var/www/nopay-club/scripts/update-canva-link.sh
```

Add script content:
```bash
#!/bin/bash

if [ -z "$1" ]; then
  echo "Please provide the new Canva invite link as an argument"
  echo "Usage: ./update-canva-link.sh \"https://www.canva.com/brand/join?token=NEW_TOKEN&referrer=team-invite\""
  exit 1
fi

# Escape special characters in the URL
ESCAPED_LINK=$(echo "$1" | sed 's/[\/&]/\\&/g')

# Update the link in the file
sed -i "s/export const CANVA_INVITE_LINK = \".*\"/export const CANVA_INVITE_LINK = \"$ESCAPED_LINK\"/" /var/www/nopay-club/client/src/lib/canvaLinks.ts

# Build and restart
cd /var/www/nopay-club
npm run build
pm2 restart nopay-club

echo "Canva invite link updated successfully to: $1"
```

### Make Executable
```bash
chmod +x /var/www/nopay-club/scripts/update-canva-link.sh
```

### Usage Example
```bash
./update-canva-link.sh "https://www.canva.com/brand/join?token=newToken123&referrer=team-invite"
```

## 15. Scaling with Hostinger

### Vertical Scaling (Recommended First Option)
1. Log in to Hostinger hPanel
2. Navigate to VPS section
3. Select your VPS instance
4. Click "Upgrade Plan"
5. Select a plan with more resources
6. Follow on-screen instructions

### Optimizing for Higher Traffic
1. **Implement Nginx Caching:**
   ```bash
   sudo nano /etc/nginx/conf.d/proxy_cache.conf
   ```
   
   Add configuration:
   ```nginx
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=1g inactive=60m;
   proxy_cache_key "$scheme$request_method$host$request_uri";
   ```

   Then update your server block:
   ```bash
   sudo nano /etc/nginx/sites-available/nopay-club
   ```
   
   Add to your `location /` block:
   ```nginx
   proxy_cache app_cache;
   proxy_cache_valid 200 60m;
   proxy_cache_valid 404 1m;
   add_header X-Cache-Status $upstream_cache_status;
   ```

2. **Optimize MongoDB:**
   ```bash
   sudo nano /etc/mongod.conf
   ```
   
   Add or modify the WiredTiger cache section:
   ```yaml
   storage:
     wiredTiger:
       engineConfig:
         cacheSizeGB: 0.5  # Adjust based on your RAM (25% of available RAM)
   ```

## 16. Troubleshooting Common Hostinger VPS Issues

### Application Not Starting
1. Check PM2 logs:
   ```bash
   pm2 logs nopay-club
   ```

2. Verify environment variables:
   ```bash
   cat /var/www/nopay-club/.env
   ```

3. Check MongoDB connection:
   ```bash
   mongosh --uri="mongodb://nopay_user:secureAppPassword@localhost:27017/nopay_club"
   ```

### Domain Not Working
1. Check Nginx config:
   ```bash
   sudo nginx -t
   ```

2. Check Nginx logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. Verify DNS settings in Hostinger hPanel

### Server Performance Issues
1. Check current resource usage:
   ```bash
   htop
   ```

2. Check disk space:
   ```bash
   df -h
   ```

3. Check open file descriptors:
   ```bash
   lsof | wc -l
   ```

### MongoDB Issues
1. Check MongoDB status:
   ```bash
   sudo systemctl status mongod
   ```

2. Check MongoDB logs:
   ```bash
   sudo tail -f /var/log/mongodb/mongod.log
   ```

3. Check MongoDB disk space:
   ```bash
   du -sh /var/lib/mongodb
   ```

### Network Issues
1. Check open ports:
   ```bash
   sudo netstat -tulpn
   ```

2. Check firewall status:
   ```bash
   sudo ufw status
   ```

## Contact Hostinger Support

If you encounter issues specific to the Hostinger VPS environment:

1. Log in to your Hostinger account
2. Navigate to the "Help" section
3. Use the 24/7 Live Chat support
4. Provide your VPS ID and detailed description of the issue

---

*Note: Replace placeholders like "yourdomain.com", "securePassword", and repository URLs with your actual values. This guide assumes you're deploying the main branch of your repository.*