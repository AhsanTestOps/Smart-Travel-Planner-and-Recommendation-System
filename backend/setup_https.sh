#!/bin/bash
# HTTPS Setup Script for Django Backend on EC2

set -e

echo "🔐 Setting up HTTPS for Django Backend..."

# Update system
echo "📦 Updating system packages..."
sudo apt update

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot
echo "📦 Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

# Stop Nginx temporarily
sudo systemctl stop nginx

# Get SSL certificate
echo "🔒 Getting SSL certificate from Let's Encrypt..."
echo "⚠️  Make sure DNS is pointing api.smarttravelplanner.app to this server!"
read -p "Press Enter when DNS is ready..."

sudo certbot certonly --standalone -d api.smarttravelplanner.app --non-interactive --agree-tos --email hrmanager9159@gmail.com

# Copy nginx config
echo "⚙️  Configuring Nginx..."
sudo cp /home/ubuntu/travel/backend/nginx.conf /etc/nginx/sites-available/django
sudo ln -sf /etc/nginx/sites-available/django /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Start nginx
echo "🚀 Starting Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup auto-renewal for SSL
echo "♻️  Setting up SSL auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "✅ HTTPS setup complete!"
echo "🌐 Your backend is now available at: https://api.smarttravelplanner.app"
echo ""
echo "📝 Next steps:"
echo "1. Update Django settings.py with HTTPS settings"
echo "2. Update frontend to use https://api.smarttravelplanner.app"
echo "3. Restart Django: sudo systemctl restart django (or your process)"
