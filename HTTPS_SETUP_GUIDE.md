# HTTPS Setup Guide for Smart Travel Planner Backend

## ✅ Prerequisites Checklist

1. **DNS Configuration** (Do this first!)
   - Go to name.com → DNS Settings
   - Add A Record:
     - TYPE: `A`
     - HOST: `api.smarttravelplanner.app`  
     - ANSWER: `3.238.239.67`
     - TTL: `300`
   - Wait 5-10 minutes for DNS to propagate
   - Test: `ping api.smarttravelplanner.app` (should show 3.238.239.67)

## 🚀 Installation Steps (Run on EC2)

### Step 1: Pull the latest code
```bash
cd ~/travel
git pull
```

### Step 2: Make setup script executable
```bash
chmod +x backend/setup_https.sh
```

### Step 3: Run the HTTPS setup script
```bash
cd backend
sudo bash setup_https.sh
```

**Important:** When the script asks "Press Enter when DNS is ready", make sure you've added the DNS record and waited 5-10 minutes!

### Step 4: Enable HTTPS in Django settings
After SSL is working, uncomment these lines in `backend/travel_backend/settings.py`:

```python
# Change these from commented to uncommented:
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
```

### Step 5: Restart Django
```bash
cd ~/travel/backend
source venv/bin/activate
pkill -f "python manage.py runserver"
python manage.py runserver 127.0.0.1:8000
```

**Note:** Nginx will handle HTTPS and proxy to Django on port 8000

## 🧪 Testing

1. Test HTTP redirect:
   ```bash
   curl -I http://api.smarttravelplanner.app
   # Should return: 301 redirect to https://
   ```

2. Test HTTPS:
   ```bash
   curl -I https://api.smarttravelplanner.app
   # Should return: 200 OK
   ```

3. Test API endpoint:
   ```bash
   curl https://api.smarttravelplanner.app/api/
   # Should return API response
   ```

## 🔧 Update Frontend

After HTTPS is working, update your frontend to use the new HTTPS URL:

### In `frontend/src/utils/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.smarttravelplanner.app/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.smarttravelplanner.app';
```

### Push frontend changes:
```bash
git add frontend/src/utils/api.js
git commit -m "Update API to use HTTPS domain"
git push
```

## 🔄 SSL Certificate Auto-Renewal

The certbot timer is automatically enabled and will renew certificates before they expire.

Check renewal status:
```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run  # Test renewal
```

## ❗ Troubleshooting

### If Nginx fails to start:
```bash
# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### If SSL certificate fails:
```bash
# Make sure DNS is working
nslookup api.smarttravelplanner.app

# Check if port 80 is open
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443

# Try certbot again
sudo certbot certonly --standalone -d api.smarttravelplanner.app
```

### If Django can't connect:
```bash
# Check if Django is running
ps aux | grep runserver

# Check Django logs
tail -f ~/django.log

# Restart Django
cd ~/travel/backend
source venv/bin/activate
python manage.py runserver 127.0.0.1:8000
```

## 📝 What Was Changed

1. ✅ Added `backend/nginx.conf` - Nginx reverse proxy configuration
2. ✅ Added `backend/setup_https.sh` - Automated HTTPS setup script
3. ✅ Updated `backend/travel_backend/settings.py`:
   - Added `api.smarttravelplanner.app` to `ALLOWED_HOSTS`
   - Added HTTPS domains to `CORS_ALLOWED_ORIGINS`
   - Added HTTPS domains to `CSRF_TRUSTED_ORIGINS`
   - Added HTTPS security settings (commented out until SSL is working)

## 🎉 Final Result

After setup:
- ✅ HTTP → HTTPS automatic redirect
- ✅ Valid SSL certificate from Let's Encrypt
- ✅ Secure API at `https://api.smarttravelplanner.app`
- ✅ Auto-renewal every 90 days
- ✅ No mixed content warnings in browser
- ✅ Signup/Login will work perfectly on Amplify!

## 🆘 Need Help?

If you run into issues, check:
1. DNS is pointing to correct IP
2. Ports 80 and 443 are open in EC2 security group
3. Nginx is running: `sudo systemctl status nginx`
4. Django is running: `ps aux | grep runserver`
5. Logs: `sudo tail -f /var/log/nginx/error.log`
