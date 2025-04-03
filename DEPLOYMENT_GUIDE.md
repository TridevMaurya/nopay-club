# NoPay Club Deployment Guide

This is a comprehensive guide for deploying the NoPay Club website to production environments.

> **Important**: For detailed Hostinger VPS-specific deployment instructions, please refer to the specialized guides:
> - [README.md](README.md) - Main documentation with Hostinger VPS deployment instructions
> - [HOSTINGER_VPS_GUIDE.md](HOSTINGER_VPS_GUIDE.md) - In-depth Hostinger VPS configuration and management
> 
> The guides below cover general deployment concepts that apply to any hosting environment.

## Recommended Hostinger VPS Plan

For optimal performance of NoPay Club, we recommend:

- **VPS Plan**: Hostinger VPS 2 or higher
- **Operating System**: Ubuntu 22.04 LTS (most stable and widely supported)
- **Control Panel**: Hostinger's hPanel (easier management) or direct SSH access

### Why Ubuntu 22.04 LTS?
- Long-term support until 2027
- Excellent compatibility with Node.js and modern web technologies
- Robust security updates
- Wide community support for troubleshooting

### VPS Resources Recommendation
- Minimum 2GB RAM (4GB preferred for better performance)
- 2+ CPU cores
- 50GB+ SSD storage
- Unmetered bandwidth if possible

## Prerequisites

1. A Hostinger VPS account with SSH access
2. Node.js (v16+) and npm installed on your VPS
3. Domain name pointed to your VPS IP address
4. Basic knowledge of terminal commands

## Step 1: Connect to Your VPS

```bash
ssh username@your-vps-ip
```

Replace `username` and `your-vps-ip` with your Hostinger VPS credentials.

## Step 2: Install Required Software

Update your system and install necessary dependencies:

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js and npm if not already installed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx as a reverse proxy
sudo apt install -y nginx
```

## Step 3: Clone the Repository

```bash
# Navigate to the directory where you want to store your application
cd /var/www

# Clone your repository (use your actual repo URL)
git clone https://your-repository-url.git nopay-club
cd nopay-club
```

## Step 4: Install Dependencies and Build the Application

```bash
# Install project dependencies
npm install

# Create a production build file
npm run build
```

### Preparing package.json for Production

Your package.json already has the necessary scripts for production deployment:

```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

These scripts will:
1. `npm run build` - Create a production-ready bundle of both frontend and backend
2. `npm start` - Run the production version of the application

### Setting Up Environment Variables and MongoDB Database

When deploying to Hostinger VPS, you need to set up proper environment variables and configure your MongoDB connection for a true MERN stack.

#### Setting Up MongoDB on Hostinger

##### Option 1: Installing MongoDB Directly on Your Hostinger VPS

1. SSH into your Hostinger VPS
2. Install MongoDB:
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

3. Verify MongoDB is running:
   ```bash
   sudo systemctl status mongod
   ```

4. Create a database and user:
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

5. Enable MongoDB authentication:
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

##### Option 2: Using MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (you can use the free tier)
3. Set up a database user with read/write privileges
4. Whitelist your Hostinger VPS IP address in the Network Access settings
5. Get your connection string from the "Connect" button on your cluster

#### Configuring Environment Variables

Create a `.env` file in the project root:

```bash
nano .env
```

Add the following environment variables:

```
NODE_ENV=production
PORT=5000

# MongoDB connection (replace with your actual MongoDB credentials)
# For local MongoDB on VPS:
MONGODB_URI=mongodb://nopay_user:secureAppPassword@localhost:27017/nopay_club
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nopay_club?retryWrites=true&w=majority
```

Save and close the file (CTRL+X, then Y, then Enter).

## Step 5: Configure PM2 to Run Your Application

Create a PM2 ecosystem file:

```bash
nano ecosystem.config.js
```

Add the following content:

```javascript
module.exports = {
  apps: [{
    name: "nopay-club",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 5000,
      // Database environment variables will be loaded from .env file
      // You don't need to specify them here if using dotenv
    }
  }]
};
```

Start your application with PM2:

```bash
pm2 start ecosystem.config.js
```

Make PM2 run on system startup:

```bash
pm2 startup
pm2 save
```

## Step 6: Configure Nginx as a Reverse Proxy

Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/nopay-club
```

Add the following configuration:

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

Replace `yourdomain.com` with your actual domain name.

Enable the site configuration:

```bash
sudo ln -s /etc/nginx/sites-available/nopay-club /etc/nginx/sites-enabled/
```

Test the Nginx configuration:

```bash
sudo nginx -t
```

If the test is successful, restart Nginx:

```bash
sudo systemctl restart nginx
```

## Step 7: Set Up SSL with Let's Encrypt

Install Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtain and install the SSL certificate:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to complete the setup.

## Step 8: Set Up Firewall

Configure the firewall to allow only necessary traffic:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Step 9: Set Up Automatic Deployment (Optional)

For automatic deployment whenever you push changes to your repository, you can use tools like GitHub Actions or GitLab CI/CD.

Here's a basic GitHub Actions workflow file (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        port: ${{ secrets.VPS_PORT }}
        script: |
          cd /var/www/nopay-club
          git pull
          npm install
          npm run build
          pm2 restart nopay-club
```

## Maintenance and Troubleshooting

### Viewing logs

```bash
# View application logs
pm2 logs nopay-club

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Restarting services

```bash
# Restart your Node.js application
pm2 restart nopay-club

# Restart Nginx
sudo systemctl restart nginx
```

### Updating the application

```bash
cd /var/www/nopay-club
git pull
npm install
npm run build
pm2 restart nopay-club
```

### Updating the Canva Invite Link

When you need to update the Canva invite link that visitors use to get Canva Pro access:

1. Edit the canvaLinks.ts file:
   ```bash
   nano client/src/lib/canvaLinks.ts
   ```

2. Update the `CANVA_INVITE_LINK` constant with your new invite link:
   ```typescript
   export const CANVA_INVITE_LINK = "https://www.canva.com/brand/join?token=YOUR_NEW_TOKEN&referrer=team-invite";
   ```

3. Save the file and rebuild the application:
   ```bash
   npm run build
   pm2 restart nopay-club
   ```

This design makes it easy to update all buttons with a single change, as all colored buttons now reference this single constant.

## Memory Optimization for VPS

Hostinger VPS may have limited memory. Here are some tips to optimize memory usage:

1. **Monitor memory usage**:
   ```bash
   free -m
   ```

2. **Add swap space** if needed:
   ```bash
   sudo fallocate -l 1G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

   Make swap persistent by adding to `/etc/fstab`:
   ```bash
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

3. **Configure PM2 with memory limits**:
   ```bash
   pm2 start ecosystem.config.js --max-memory-restart 300M
   ```

4. **Optimize Nginx** by adding to `/etc/nginx/nginx.conf` inside the `http` block:
   ```nginx
   worker_processes auto;
   worker_rlimit_nofile 65535;
   events {
       worker_connections 4096;
       multi_accept on;
   }
   http {
       # Other configurations...
       gzip on;
       gzip_comp_level 6;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

## Security Best Practices

1. **Keep software updated**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Configure fail2ban** to prevent brute force attacks:
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

3. **Disable root login** by editing SSH configuration:
   ```bash
   sudo nano /etc/ssh/sshd_config
   ```
   
   Find and change: `PermitRootLogin no`
   
   Then restart SSH:
   ```bash
   sudo systemctl restart sshd
   ```

4. **Back up regularly**:
   ```bash
   # Create a backup script
   nano backup.sh
   ```
   
   Add backup commands to the script:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/var/backups/nopay-club"
   mkdir -p $BACKUP_DIR
   cd /var/www/nopay-club
   tar -czvf $BACKUP_DIR/nopay-club-$(date +%Y%m%d).tar.gz .
   ```
   
   Make it executable and set up a cron job:
   ```bash
   chmod +x backup.sh
   crontab -e
   ```
   
   Add this line to run the backup daily at 2 AM:
   ```
   0 2 * * * /var/www/nopay-club/backup.sh
   ```

## Hostinger VPS Panel Recommendations

When setting up your Hostinger VPS, consider the following recommendations:

### Control Panel and OS Setup on Hostinger
1. **Login to Hostinger** account dashboard
2. Navigate to **VPS Hosting** section
3. Click on **Order New VPS**
4. Select **Ubuntu 22.04 LTS** as your operating system
5. Choose **hPanel** as your control panel option
6. Complete the order process

### Control Panel Choice
- **Recommendation**: Use **hPanel** for easier management
   - Provides GUI for database management
   - Simplifies domain configuration
   - Offers one-click SSL installation
   - Includes file manager for easy file editing
- **Alternative**: Direct SSH management (more control but requires more technical knowledge)

### Operating System
- **Primary Recommendation**: Ubuntu 22.04 LTS 
   - Most compatible with the NoPay Club application stack
   - Well-documented for troubleshooting
   - Long-term support until 2027
- **Alternatives**:
  - CentOS Stream 9 (stable but different package management)
  - Debian 11 (very stable but may have older packages)

### Resource Allocation Tips
- For optimal NoPay Club performance:
  - **CPU**: Allocate at least 2 CPU cores
  - **RAM**: Minimum 2GB, preferably 4GB
  - **Disk Space**: 50GB SSD minimum 
  - **Bandwidth**: Choose unmetered if possible or at least 2TB monthly

### Additional Hostinger Features to Enable
- **Auto Backups**: Enable weekly automated backups
- **DDoS Protection**: Enable if available
- **Dedicated IP**: Recommended for better SEO and reliability
- **Server Monitoring**: Enable performance monitoring

## MongoDB Backups

When using MongoDB, it's essential to regularly back up your database to prevent data loss.

### Backing Up MongoDB

For local MongoDB on your VPS:

```bash
# Create a backup directory
mkdir -p /var/backups/mongodb

# Create a backup script
nano mongodb-backup.sh
```

Add the following to the script:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
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

Make the script executable and set up a daily cron job:

```bash
chmod +x mongodb-backup.sh
crontab -e
```

Add this line to run the backup daily at 3 AM:
```
0 3 * * * /path/to/mongodb-backup.sh
```

### Restoring MongoDB Backup

If you need to restore from a backup:

```bash
# Uncompress backup
tar -xzf /var/backups/mongodb/backup_20250331_030000.tar.gz -C /tmp/

# Restore database
mongorestore --uri="mongodb://nopay_user:secureAppPassword@localhost:27017/nopay_club" --drop /tmp/backup_20250331_030000/nopay_club
```

## MERN Stack Specific Notes

Your NoPay Club website now uses the complete MERN stack (MongoDB, Express, React, Node.js), which offers several advantages:

1. **JavaScript Everywhere**: Using JavaScript for both frontend and backend simplifies development
2. **NoSQL Flexibility**: MongoDB's document-based structure allows for flexible data models
3. **Scalability**: The MERN stack is designed to handle increasing loads effectively
4. **Real-time Applications**: Easily implement real-time features with WebSockets or Socket.io

## Conclusion

Your NoPay Club website is now fully configured as a MERN stack application and securely deployed on Hostinger VPS with proper infrastructure to handle worldwide traffic. This guide has provided a comprehensive approach to setting up your application, and the recommended VPS specifications should provide excellent performance for your users.

If you encounter any issues during deployment, refer to the logs as described in the Maintenance and Troubleshooting section or contact Hostinger support for VPS-specific troubleshooting.

Remember to regularly:
1. Update your Canva invite link in the codebase
2. Back up your MongoDB database
3. Maintain backups of your application codebase
4. Keep your server updated with security patches
5. Monitor server performance and scale resources as your traffic grows