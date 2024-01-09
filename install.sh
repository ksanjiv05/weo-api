#!/bin/bash

# Update system packages
sudo apt update
sudo apt upgrade -y

# Install Git
sudo apt install -y git

# Install Node.js and npm using NodeSource repository
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Configure Nginx as a reverse proxy for Node.js
# sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
# server {
#     listen 80;
#     server_name your_domain_or_ip;

#     location / {
#         proxy_pass http://localhost:your_nodejs_port;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_cache_bypass \$http_upgrade;
#     }
# }
# EOF

# Reload Nginx to apply changes
sudo systemctl reload nginx

# Display Node.js and npm versions
node -v
npm -v

# Display Nginx version
nginx -v

git clone https://github.com/ksanjiv05/wee-api.git

echo "Node.js, npm (v14), and Nginx have been installed and configured."
