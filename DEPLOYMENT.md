# Deployment Guide - Sweet Shop Management System

Complete guide to deploy the Sweet Shop application to production.

## Table of Contents

1. [Frontend Deployment](#frontend-deployment)
2. [Backend Deployment](#backend-deployment)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

Vercel is optimized for Next.js and Vite applications with automatic deployment from Git.

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy from Frontend Directory
```bash
cd sweets-app
vercel
```

#### Step 4: Configure Environment Variables in Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   ```
   VITE_API_BASE_URL=https://your-backend-url.herokuapp.com
   ```

#### Step 5: Automatic Deployments
- Any push to `main` branch automatically deploys
- Preview URLs for pull requests

**Deployed URL:** `https://your-project-name.vercel.app`

---

### Option 2: Netlify

Alternative static hosting with continuous deployment.

#### Step 1: Connect Repository
1. Go to https://netlify.com
2. Click "New site from Git"
3. Select GitHub repository

#### Step 2: Build Settings
- Build command: `npm run build`
- Publish directory: `dist`

#### Step 3: Environment Variables
- Go to Site settings → Build & deploy → Environment
- Add `VITE_API_BASE_URL`

#### Step 4: Deploy
- Click "Deploy site"
- Netlify automatically builds and deploys

**Deployed URL:** `https://your-project-name.netlify.app`

---

### Option 3: GitHub Pages

Free hosting directly from GitHub repository.

#### Step 1: Update vite.config.ts
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/sweet-shop/', // If using project repository
  // OR
  base: '/', // If using user/organization site
});
```

#### Step 2: Add Deploy Script
In `package.json`:
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

#### Step 3: Install gh-pages
```bash
npm install --save-dev gh-pages
```

#### Step 4: Deploy
```bash
npm run deploy
```

**Deployed URL:** `https://username.github.io/sweet-shop`

---

## Backend Deployment

### Option 1: Heroku (Easy & Recommended)

Heroku provides easy Node.js deployment with MongoDB support.

#### Step 1: Install Heroku CLI
```bash
npm install -g heroku
```

#### Step 2: Login to Heroku
```bash
heroku login
```

#### Step 3: Create Heroku App
```bash
cd backend
heroku create your-app-name
```

#### Step 4: Set Environment Variables
```bash
heroku config:set JWT_SECRET="your_super_secret_key_change_this"
heroku config:set MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/sweet-shop"
heroku config:set EMAIL_USER="your-email@gmail.com"
heroku config:set EMAIL_PASSWORD="your_app_specific_password"
heroku config:set FRONTEND_URL="https://your-frontend-url.vercel.app"
heroku config:set NODE_ENV="production"
```

#### Step 5: Update package.json
Ensure `package.json` has:
```json
{
  "engines": {
    "node": "16.x",
    "npm": "8.x"
  },
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  }
}
```

#### Step 6: Create Procfile
In `backend/Procfile`:
```
web: node app.js
```

#### Step 7: Deploy
```bash
git push heroku main
```

#### Step 8: View Logs
```bash
heroku logs --tail
```

**Deployed URL:** `https://your-app-name.herokuapp.com`

---

### Option 2: Railway

Modern alternative to Heroku with better pricing.

#### Step 1: Sign Up
- Go to https://railway.app
- Sign up with GitHub

#### Step 2: Create New Project
- Select "GitHub repo"
- Connect your repository

#### Step 3: Set Variables
- Go to project settings
- Variables section
- Add all environment variables

#### Step 4: Deploy
- Railway automatically deploys on push
- View deployment status in dashboard

---

### Option 3: AWS EC2

For production-scale applications.

#### Step 1: Launch EC2 Instance
- Ubuntu 20.04 LTS
- t2.micro (eligible for free tier)

#### Step 2: Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

#### Step 3: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 4: Install MongoDB
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### Step 5: Clone Repository
```bash
git clone your-repo-url
cd backend
npm install
```

#### Step 6: Create .env File
```bash
nano .env
# Add all environment variables
```

#### Step 7: Install PM2
```bash
sudo npm install -g pm2
```

#### Step 8: Start Application
```bash
pm2 start app.js --name "sweet-shop-api"
pm2 startup
pm2 save
```

#### Step 9: Configure Nginx
```bash
sudo apt-get install nginx
```

Configure `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

#### Step 10: Setup SSL
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Database Setup

### Option 1: MongoDB Atlas (Cloud)

Recommended for beginners - free tier available.

#### Step 1: Create Account
- Go to https://www.mongodb.com/cloud/atlas
- Sign up with email

#### Step 2: Create Cluster
- Click "Create" button
- Select free tier (M0)
- Choose region closest to you
- Create cluster

#### Step 3: Create User
- Go to Database Access
- Click "Add New Database User"
- Set username and password
- Remember credentials

#### Step 4: Whitelist IP
- Go to Network Access
- Click "Add IP Address"
- Select "Allow Access from Anywhere" (for development)
- Or specify your IP

#### Step 5: Get Connection String
- Click "Connect" button
- Choose "Connect your application"
- Copy connection string
- Replace `<username>` and `<password>`

**Example:**
```
mongodb+srv://user:password@cluster.mongodb.net/sweet-shop?retryWrites=true&w=majority
```

#### Step 6: Update .env
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/sweet-shop
```

---

### Option 2: MongoDB Local Installation

For development or self-hosted production.

#### Installation

**Windows:**
```bash
# Download installer from https://www.mongodb.com/try/download/community
# Run installer and follow prompts
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Linux (Ubuntu):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### Start MongoDB
```bash
# Windows
mongod

# macOS/Linux
brew services start mongodb-community
# OR
sudo systemctl start mongod
```

#### Connection String
```
mongodb://localhost:27017/sweet-shop
```

---

## Environment Configuration

### Production .env File

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=production

# Database - MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sweet-shop?retryWrites=true&w=majority

# JWT Secret (generate strong random string)
JWT_SECRET=your_very_long_random_secret_key_at_least_32_characters

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Optional: API Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generate Strong JWT Secret

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator
# https://www.uuidgenerator.net/
```

---

## SSL/HTTPS Configuration

### Step 1: Get Domain
- Purchase from GoDaddy, Namecheap, etc.
- Point DNS to your server IP

### Step 2: Setup SSL Certificate

**Using Let's Encrypt (Free):**
```bash
# On server
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

### Step 3: Configure Nginx for HTTPS
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring & Troubleshooting

### Backend Logs

**Heroku:**
```bash
heroku logs --tail
heroku logs --tail -n 100  # Last 100 lines
```

**Local/VM:**
```bash
# Using PM2
pm2 logs sweet-shop-api
pm2 monit

# Using journalctl
sudo journalctl -u mongod -f
```

### Common Issues

#### 1. Database Connection Failed
```
Error: connect ECONNREFUSED
```
**Solution:**
- Verify MongoDB is running
- Check connection string in .env
- Whitelist IP in MongoDB Atlas

#### 2. Port Already in Use
```
Error: EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Kill process on port
lsof -i :5000
kill -9 <PID>

# Or change PORT in .env
```

#### 3. Email Not Sending
```
Error: Invalid login: 535-5.7.8 Username and password not accepted
```
**Solution:**
- Generate new App Password in Gmail
- Enable "Less secure apps" temporarily
- Check email credentials in .env

#### 4. CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Update FRONTEND_URL in backend .env
- Ensure CORS middleware enabled in app.js

### Performance Monitoring

**Using New Relic (Free tier):**
```bash
npm install newrelic
```

Add to top of `app.js`:
```javascript
require('newrelic');
```

---

## Backup & Recovery

### MongoDB Backup

**Export Data:**
```bash
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/sweet-shop" --out ./backup
```

**Import Data:**
```bash
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/sweet-shop" ./backup
```

### GitHub Backup
- Repository is automatically backed up to GitHub
- Clone anytime to recover

---

## Security Checklist

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Email password is app-specific, not main password
- [ ] MongoDB whitelist configured properly
- [ ] HTTPS/SSL enabled
- [ ] Environment variables not committed
- [ ] .gitignore includes .env
- [ ] Rate limiting configured
- [ ] CORS whitelist configured
- [ ] Input validation implemented
- [ ] Regular security updates

---

## Scaling Considerations

As your application grows:

1. **Database Optimization**
   - Add indexes to frequently queried fields
   - Implement caching (Redis)

2. **Load Balancing**
   - Deploy multiple backend instances
   - Use load balancer (Nginx, HAProxy)

3. **CDN for Frontend**
   - Cloudflare for content delivery
   - Reduces latency globally

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Performance monitoring (New Relic)

---

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test API endpoints manually
4. Review error messages carefully

---

**Deployment Status:** ✅ Ready for Production
**Last Updated:** 2024
