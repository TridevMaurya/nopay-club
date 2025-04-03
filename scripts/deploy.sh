#!/bin/bash

# NoPay Club deployment script
# This script automates the deployment process for the NoPay Club application

# Exit on any error
set -e

print_step() {
  echo "======================================================"
  echo "  $1"
  echo "======================================================"
}

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required tools
check_requirements() {
  print_step "Checking requirements"
  
  local missing_requirements=false
  
  if ! command_exists node; then
    echo "❌ Node.js is not installed"
    missing_requirements=true
  else
    echo "✅ Node.js $(node -v) is installed"
  fi
  
  if ! command_exists npm; then
    echo "❌ npm is not installed"
    missing_requirements=true
  else
    echo "✅ npm $(npm -v) is installed"
  fi
  
  if ! command_exists git; then
    echo "❌ git is not installed"
    missing_requirements=true
  else
    echo "✅ git $(git --version) is installed"
  fi
  
  if ! command_exists pm2; then
    echo "⚠️ PM2 is not installed (will be installed later)"
  else
    echo "✅ PM2 $(pm2 --version) is installed"
  fi
  
  if ! command_exists nginx; then
    echo "⚠️ Nginx is not installed (will be installed later)"
  else
    echo "✅ Nginx is installed"
  fi
  
  if $missing_requirements; then
    echo "❌ Some requirements are missing. Please install them and try again."
    exit 1
  fi
}

# Update system packages
update_system() {
  print_step "Updating system packages"
  
  echo "🔄 Updating package lists..."
  sudo apt update
  
  echo "🔄 Upgrading packages..."
  sudo apt upgrade -y
}

# Install required tools
install_tools() {
  print_step "Installing required tools"
  
  # Install PM2 if not already installed
  if ! command_exists pm2; then
    echo "🔄 Installing PM2..."
    sudo npm install -g pm2
  fi
  
  # Install Nginx if not already installed
  if ! command_exists nginx; then
    echo "🔄 Installing Nginx..."
    sudo apt install -y nginx
  fi
}

# Set up application directory
setup_app_directory() {
  print_step "Setting up application directory"
  
  APP_DIR="/var/www/nopay-club"
  
  # Create directory if it doesn't exist
  if [ ! -d "$APP_DIR" ]; then
    echo "🔄 Creating application directory..."
    sudo mkdir -p "$APP_DIR"
  fi
  
  # Set correct permissions
  echo "🔄 Setting directory permissions..."
  sudo chown -R $USER:$USER "$APP_DIR"
}

# Clone or update repository
setup_repository() {
  print_step "Setting up repository"
  
  APP_DIR="/var/www/nopay-club"
  cd "$APP_DIR"
  
  # Check if git repository already exists
  if [ -d ".git" ]; then
    echo "🔄 Repository already exists, pulling latest changes..."
    git pull
  else
    echo "🔄 Cloning repository..."
    # Replace with your actual repository URL
    git clone https://github.com/yourusername/nopay-club.git .
  fi
}

# Install dependencies and build application
build_application() {
  print_step "Building application"
  
  APP_DIR="/var/www/nopay-club"
  cd "$APP_DIR"
  
  echo "🔄 Installing dependencies..."
  npm install
  
  echo "🔄 Building application..."
  npm run build
}

# Set up environment variables
setup_environment() {
  print_step "Setting up environment variables"
  
  APP_DIR="/var/www/nopay-club"
  ENV_FILE="$APP_DIR/.env"
  
  # Check if .env file already exists
  if [ -f "$ENV_FILE" ]; then
    echo "✅ Environment file already exists"
    return
  fi
  
  echo "🔄 Creating environment file..."
  cat > "$ENV_FILE" << EOF
NODE_ENV=production
PORT=5000

# MongoDB connection (replace with your actual MongoDB credentials)
# For local MongoDB on VPS:
MONGODB_URI=mongodb://nopay_user:secureAppPassword@localhost:27017/nopay_club
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nopay_club?retryWrites=true&w=majority
EOF
  
  echo "✅ Environment file created at $ENV_FILE"
  echo "⚠️ Please update the MongoDB connection string with your actual credentials"
}

# Configure PM2
configure_pm2() {
  print_step "Configuring PM2"
  
  APP_DIR="/var/www/nopay-club"
  ECOSYSTEM_FILE="$APP_DIR/ecosystem.config.js"
  
  echo "🔄 Creating PM2 ecosystem file..."
  cat > "$ECOSYSTEM_FILE" << EOF
module.exports = {
  apps: [{
    name: "nopay-club",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 5000,
    },
    max_memory_restart: "300M",
    node_args: "--max-old-space-size=256",
    log_date_format: "YYYY-MM-DD HH:mm Z",
    error_file: "$APP_DIR/logs/error.log",
    out_file: "$APP_DIR/logs/output.log"
  }]
};
EOF
  
  # Create logs directory
  mkdir -p "$APP_DIR/logs"
  
  echo "✅ PM2 ecosystem file created at $ECOSYSTEM_FILE"
  
  # Start application with PM2
  echo "🔄 Starting application with PM2..."
  cd "$APP_DIR"
  pm2 start ecosystem.config.js
  
  # Set PM2 to start on system boot
  echo "🔄 Setting PM2 to start on system boot..."
  pm2 startup
  pm2 save
}

# Configure Nginx
configure_nginx() {
  print_step "Configuring Nginx"
  
  NGINX_CONF="/etc/nginx/sites-available/nopay-club"
  
  echo "🔄 Creating Nginx configuration..."
  
  # Ask for domain name
  read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN_NAME
  
  if [ -z "$DOMAIN_NAME" ]; then
    echo "⚠️ No domain provided, using example domain: example.com"
    DOMAIN_NAME="example.com"
  fi
  
  sudo tee "$NGINX_CONF" > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    access_log /var/log/nginx/nopay-club-access.log;
    error_log /var/log/nginx/nopay-club-error.log;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|webp|svg|ico)\$ {
        proxy_pass http://localhost:5000;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF
  
  echo "✅ Nginx configuration created at $NGINX_CONF"
  
  # Enable site configuration
  echo "🔄 Enabling site configuration..."
  sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
  
  # Test Nginx configuration
  echo "🔄 Testing Nginx configuration..."
  sudo nginx -t
  
  # Restart Nginx
  echo "🔄 Restarting Nginx..."
  sudo systemctl restart nginx
}

# Set up SSL with Let's Encrypt
setup_ssl() {
  print_step "Setting up SSL with Let's Encrypt"
  
  # Check if certbot is installed
  if ! command_exists certbot; then
    echo "🔄 Installing Certbot..."
    sudo apt install -y certbot python3-certbot-nginx
  fi
  
  # Ask for domain name
  read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN_NAME
  
  if [ -z "$DOMAIN_NAME" ]; then
    echo "❌ No domain provided, skipping SSL setup"
    return
  fi
  
  echo "🔄 Obtaining SSL certificate..."
  sudo certbot --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME"
  
  echo "🔄 Checking Certbot auto-renewal..."
  sudo systemctl status certbot.timer
}

# Configure firewall
configure_firewall() {
  print_step "Configuring firewall"
  
  # Check if ufw is installed
  if ! command_exists ufw; then
    echo "🔄 Installing UFW..."
    sudo apt install -y ufw
  fi
  
  echo "🔄 Configuring firewall rules..."
  sudo ufw allow OpenSSH
  sudo ufw allow 'Nginx Full'
  
  echo "🔄 Enabling firewall..."
  sudo ufw --force enable
  
  echo "✅ Firewall configured"
}

# Main function
main() {
  print_step "Starting NoPay Club deployment"
  
  check_requirements
  update_system
  install_tools
  setup_app_directory
  setup_repository
  build_application
  setup_environment
  configure_pm2
  configure_nginx
  setup_ssl
  configure_firewall
  
  print_step "Deployment complete!"
  echo "🎉 NoPay Club has been successfully deployed!"
  echo "🌍 Visit your website at: https://your-domain.com"
  echo ""
  echo "📋 Next steps:"
  echo "1. Update the MongoDB connection string in .env file"
  echo "2. Set up regular backups using the provided backup scripts"
  echo "3. Test your website functionality"
  echo ""
  echo "For more information, refer to the documentation:"
  echo "- README.md"
  echo "- HOSTINGER_VPS_GUIDE.md"
  echo "- DEPLOYMENT_GUIDE.md"
}

# Run the main function
main "$@"