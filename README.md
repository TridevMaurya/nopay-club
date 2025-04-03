# NoPay Club - MERN Stack Application

A tech-driven blog platform providing users with free Canva Pro access through backlinks. Built with MongoDB, Express, React, and Node.js.

## 📱 Features

- Futuristic dark theme with neon elements and prominent glow effects
- Three-step conversion process: Watch Ad → Follow Instagram → Open Canva Pro
- 10 differently colored buttons with neon glow effects for Canva Pro access
- Blog content management system
- Monetization through ad spaces
- Internship application system
- 3D Elements powered by Three.js
- Smooth animations with Framer Motion

## 🚀 Deployment Guide for Hostinger VPS

### 1. VPS Selection & Setup

1. **VPS Configuration Recommendation:**
   - **OS:** Ubuntu 22.04 LTS
   - **Control Panel:** hPanel
   - **Resources:** Minimum 2GB RAM, 2 CPU cores, 50GB SSD
   - **Features to Enable:** Auto Backups, DDoS Protection, Dedicated IP

2. **SSH Access Your VPS:**
   ```bash
   ssh username@your_server_ip
   ```

3. **Update System:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

### 2. Install Required Software

1. **Install Node.js 20.x:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. **Install Nginx & PM2:**
   ```bash
   sudo apt install -y nginx
   sudo npm install -g pm2
   ```

3. **Install Git:**
   ```bash
   sudo apt install -y git
   ```

### 3. Setup MongoDB (Option 1: Local MongoDB)

1. **Install MongoDB:**
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

2. **Create Database and User:**
   ```bash
   # Connect to MongoDB shell
   mongosh
   
   # Create admin user
   use admin
   db.createUser({
     user: "adminUser",
     pwd: "securePassword",
     roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
   })
   
   # Create application database and user
   use nopay_club
   db.createUser({
     user: "nopay_user",
     pwd: "secureAppPassword",
     roles: [ { role: "readWrite", db: "nopay_club" } ]
   })
   
   # Exit MongoDB shell
   exit
   ```

3. **Enable MongoDB Authentication:**
   ```bash
   sudo nano /etc/mongod.conf
   ```
   
   Add or modify the security section:
   ```yaml
   security:
     authorization: enabled
   ```
   
   Restart MongoDB:
   ```bash
   sudo systemctl restart mongod
   ```

### 4. Deploy Application

1. **Create Application Directory:**
   ```bash
   sudo mkdir -p /var/www/nopay-club
   sudo chown -R $USER:$USER /var/www/nopay-club
   ```

2. **Clone Repository:**
   ```bash
   cd /var/www/nopay-club
   git clone https://your-repository-url.git .
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Create Environment File:**
   ```bash
   nano .env
   ```

   Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://nopay_user:secureAppPassword@localhost:27017/nopay_club
   ```

5. **Build the Application:**
   ```bash
   npm run build
   ```

### 5. Set Up PM2 for Process Management

1. **Create PM2 Ecosystem File:**
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
       }
     }]
   };
   ```

2. **Start Application with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

### 6. Configure Nginx as Reverse Proxy

1. **Create Nginx Configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/nopay-club
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. **Enable Site Configuration:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/nopay-club /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 7. Set Up SSL with Let's Encrypt

1. **Install Certbot:**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain SSL Certificate:**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Set Up Auto-renewal:**
   ```bash
   sudo systemctl status certbot.timer
   ```

### 8. Firewall Configuration

1. **Configure UFW:**
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow OpenSSH
   sudo ufw enable
   ```

## 📝 Daily Maintenance (Canva Link Updates)

To update the Canva invite link:

1. **Edit the canvaLinks.ts file:**
   ```bash
   nano /var/www/nopay-club/client/src/lib/canvaLinks.ts
   ```

2. **Update the CANVA_INVITE_LINK constant:**
   ```typescript
   export const CANVA_INVITE_LINK = "https://www.canva.com/brand/join?token=YOUR_NEW_TOKEN&referrer=team-invite";
   ```

3. **Rebuild and restart:**
   ```bash
   cd /var/www/nopay-club
   npm run build
   pm2 restart nopay-club
   ```

## 💾 Backup Strategy

### Database Backups

1. **Create Backup Script:**
   ```bash
   nano /var/www/nopay-club/mongodb-backup.sh
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

2. **Make Executable and Schedule:**
   ```bash
   chmod +x /var/www/nopay-club/mongodb-backup.sh
   crontab -e
   ```

   Add cron job:
   ```
   0 3 * * * /var/www/nopay-club/mongodb-backup.sh
   ```

### Application Backups

1. **Create App Backup Script:**
   ```bash
   nano /var/www/nopay-club/app-backup.sh
   ```

   Add script content:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/var/backups/nopay-club"
   mkdir -p $BACKUP_DIR
   cd /var/www/nopay-club
   tar -czvf $BACKUP_DIR/nopay-club-$(date +%Y%m%d).tar.gz .
   ```

2. **Make Executable and Schedule:**
   ```bash
   chmod +x /var/www/nopay-club/app-backup.sh
   crontab -e
   ```

   Add cron job:
   ```
   0 2 * * * /var/www/nopay-club/app-backup.sh
   ```

## 🔍 Monitoring & Troubleshooting

### Monitoring

1. **Check Application Status:**
   ```bash
   pm2 status
   pm2 logs nopay-club
   ```

2. **Monitor System Resources:**
   ```bash
   sudo apt install -y htop
   htop
   ```

3. **Check Nginx Logs:**
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

4. **MongoDB Logs:**
   ```bash
   sudo tail -f /var/log/mongodb/mongod.log
   ```

### Troubleshooting Common Issues

1. **Application Not Starting:**
   - Check logs: `pm2 logs nopay-club`
   - Verify environment variables: `cat .env`
   - Check MongoDB connection: `mongosh --uri="mongodb://nopay_user:secureAppPassword@localhost:27017/nopay_club"`

2. **Domain Not Working:**
   - Check Nginx config: `sudo nginx -t`
   - Check SSL certificates: `sudo certbot certificates`
   - Verify DNS settings in Hostinger panel

3. **Performance Issues:**
   - Check server load: `htop`
   - Optimize MongoDB: Add indexes for frequently queried fields
   - Consider upgrading VPS resources in Hostinger panel

## 💡 Optimization Tips

1. **Enable MongoDB Query Caching:**
   ```js
   // Add indexes for frequently accessed fields
   UserModel.createIndexes();
   InternshipApplicationModel.createIndexes();
   ```

2. **Optimize Nginx:**
   ```nginx
   # Add to http section in /etc/nginx/nginx.conf
   gzip on;
   gzip_comp_level 6;
   gzip_types text/plain text/css application/json application/javascript;
   
   # Add to server block
   location ~* \.(js|css|png|jpg|jpeg|gif|webp|svg|ico)$ {
       expires 30d;
       add_header Cache-Control "public, no-transform";
   }
   ```

3. **Implement Memory Limits for Node.js:**
   ```bash
   # Update your ecosystem.config.js
   module.exports = {
     apps: [{
       name: "nopay-club",
       script: "npm",
       args: "start",
       max_memory_restart: "300M",
       node_args: "--max-old-space-size=256"
     }]
   };
   ```

## 🔒 Security Best Practices

1. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm audit fix
   ```

2. **Set Up fail2ban:**
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

3. **Secure MongoDB:**
   - Bind to localhost only
   - Use strong passwords
   - Enable auth
   - Regular security audits

## 📊 Traffic Scaling Strategy

1. **Vertical Scaling:**
   - Upgrade VPS resources through Hostinger panel
   - Increase RAM and CPU for higher traffic

2. **Horizontal Scaling (For Advanced Traffic):**
   - Set up load balancer
   - Deploy to multiple servers
   - Use MongoDB Atlas for managed database

## ⚠️ Common Errors & Solutions

1. **Error: EACCES permission denied:**
   ```bash
   sudo chown -R $USER:$USER /var/www/nopay-club
   ```

2. **MongoDB Connection Issues:**
   ```bash
   sudo systemctl status mongod
   sudo cat /var/log/mongodb/mongod.log
   ```

3. **Nginx 502 Bad Gateway:**
   ```bash
   # Check if Node.js is running
   pm2 status
   # Check Nginx error logs
   sudo tail -f /var/log/nginx/error.log
   ```

---

## Contact & Support

For issues with the hosting setup, contact Hostinger support through your hPanel.

For application-specific support, create an issue in the repository or contact the development team.

---

*Note: Replace placeholders like "yourdomain.com", "securePassword", and repository URLs with your actual values.*