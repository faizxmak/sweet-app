# Vercel & Heroku Deployment Guide

## Frontend Deployment (Vercel)

### Option 1: Deploy via Vercel CLI (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Navigate to Frontend Directory
```bash
cd sweets-app
```

#### Step 4: Deploy to Vercel
```bash
vercel
```

**During deployment, you'll be asked:**
- Project name: `sweet-shop` (or your preference)
- Set as default project for this directory: `Y`
- Link to existing project: `N` (first time) or `Y` (if updating)

#### Step 5: Set Environment Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   ```
   VITE_API_BASE_URL=https://your-backend-url.herokuapp.com
   ```

5. Redeploy to apply environment variables

**Frontend URL:** `https://your-project-name.vercel.app`

---

### Option 2: Deploy via GitHub (Automatic)

#### Step 1: Push Code to GitHub
```bash
git push origin main
```

#### Step 2: Connect GitHub to Vercel
1. Go to https://vercel.com
2. Click "Import Project"
3. Select "Continue with GitHub"
4. Find and select your repository

#### Step 3: Configure Project
- **Framework Preset:** Vite
- **Root Directory:** sweets-app
- **Build Command:** npm run build
- **Output Directory:** dist

#### Step 4: Add Environment Variables
- VITE_API_BASE_URL = `https://your-backend-url.herokuapp.com`

#### Step 5: Deploy
- Click "Deploy"
- Automatic deployments on every push to main

---

## Backend Deployment (Heroku)

### Step 1: Install Heroku CLI
```bash
npm install -g heroku
```

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Create Heroku App
```bash
cd backend
heroku create your-app-name
```

### Step 4: Set Environment Variables
```bash
heroku config:set JWT_SECRET="your_super_secret_key_change_this"
heroku config:set MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/sweet-shop"
heroku config:set EMAIL_USER="your-email@gmail.com"
heroku config:set EMAIL_PASSWORD="your_app_specific_password"
heroku config:set FRONTEND_URL="https://your-frontend-url.vercel.app"
heroku config:set NODE_ENV="production"
```

### Step 5: Deploy
```bash
git push heroku main
```

### Step 6: View Logs
```bash
heroku logs --tail
```

**Backend URL:** `https://your-app-name.herokuapp.com`

---

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up with email

### Step 2: Create Free Cluster
1. Click "Create" button
2. Select free tier (M0)
3. Choose region closest to you
4. Click "Create Cluster"

### Step 3: Create Database User
1. Click "Database Access"
2. Click "Add New Database User"
3. Create username and password
4. Save credentials

### Step 4: Whitelist IP
1. Go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Connect" button
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<username>` and `<password>` with your credentials
5. Replace `<database>` with `sweet-shop`

Example:
```
mongodb+srv://user:password@cluster.mongodb.net/sweet-shop?retryWrites=true&w=majority
```

---

## Email Setup (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow prompts to enable

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password
4. Copy this password

### Step 3: Add to Heroku
```bash
heroku config:set EMAIL_USER="your-email@gmail.com"
heroku config:set EMAIL_PASSWORD="your_app_password"
```

---

## Verify Deployment

### Test Frontend
```bash
# Open in browser
https://your-project-name.vercel.app
```

### Test Backend
```bash
curl https://your-app-name.herokuapp.com/api/sweets
```

### Expected Response:
```json
[]
```

---

## Update Environment Variables in Frontend

After getting your backend URL, update the frontend environment variable:

```bash
# In Vercel Dashboard
Settings → Environment Variables
VITE_API_BASE_URL = https://your-app-name.herokuapp.com
```

Then redeploy:
```bash
vercel --prod
```

---

## Troubleshooting

### Frontend Deployment Issues

**Error: Build failed**
```bash
# Check build locally first
cd sweets-app
npm run build
```

**Error: Module not found**
```bash
# Make sure all dependencies are in package.json
npm install
npm run build
```

### Backend Deployment Issues

**Error: Cannot find module**
```bash
# Check package.json has all dependencies
heroku logs --tail
npm install
```

**Error: MongoDB connection failed**
```bash
# Verify connection string
heroku config:get MONGO_URI
# Check MongoDB Atlas whitelist
```

**Error: Email not sending**
```bash
# Verify credentials
heroku config:get EMAIL_USER
heroku config:get EMAIL_PASSWORD
# Check app password is used, not regular password
```

---

## Monitoring

### View Backend Logs
```bash
heroku logs --tail
```

### View Frontend Errors
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

### Check Environment Variables
```bash
# Backend
heroku config

# Frontend
# Vercel Dashboard → Settings → Environment Variables
```

---

## Post-Deployment

1. **Test Registration Flow**
   - Register new user
   - Check email for admin code
   - Verify admin code in app

2. **Test CRUD Operations**
   - Login as admin
   - Create a sweet
   - Update sweet
   - Delete sweet

3. **Monitor Performance**
   - Check response times
   - Monitor error rates
   - Check server logs

---

## Next Steps

- Set up CI/CD for automatic testing
- Configure custom domain
- Set up error tracking (Sentry)
- Monitor performance (New Relic)
- Set up automated backups

---

**Deployment Status:** Ready for Production 🚀
