# 🚀 VERCEL DEPLOYMENT GUIDE
## Real Estate API - 5 Minute Setup

### ✅ WHAT YOU'LL GET:
- ✅ **Reliable Node.js hosting** (no more 503 errors!)
- ✅ **Automatic deployments** from GitHub
- ✅ **Free SSL certificates**
- ✅ **Global CDN** for fast API responses
- ✅ **Environment variables** properly managed
- ✅ **Zero server management**

---

## 🔧 STEP-BY-STEP DEPLOYMENT:

### **STEP 1: Create Vercel Account**
1. Go to **https://vercel.com**
2. **Sign up with GitHub** (recommended)
3. **Verify your email**

### **STEP 2: Deploy Your Backend**

#### Option A: Deploy from GitHub (Recommended)
1. **Push your backend code to GitHub**:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/real-estate-backend.git
   git push -u origin main
   ```

2. **In Vercel Dashboard**:
   - Click **"New Project"**
   - **Import from GitHub**
   - Select your **backend repository**
   - **Framework Preset**: Other
   - **Root Directory**: Leave empty (or `backend` if it's in a subfolder)
   - Click **"Deploy"**

#### Option B: Deploy with Vercel CLI
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from backend folder**:
   ```bash
   cd backend
   vercel
   ```

### **STEP 3: Configure Environment Variables**

In your **Vercel Dashboard** → **Project Settings** → **Environment Variables**, add:

```
DB_HOST=aws-0-ap-south-1.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.httunzkqciaxlmasyveb
DB_PASSWORD=ThrinadhH!1999
DB_NAME=postgres
JWT_SECRET=QBR6kDkKBS2qMpHIpmhIVrKfd5/9ZwMghufssPc4vDcOGsL8ae1Tvcj7DjvihRjhKrHTSmdzAuojRLRJtTuCXA==
NODE_ENV=production
SUPABASE_URL=https://httunzkqciaxlmasyveb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dHVuemtxY2lheGxtYXN5dmViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTI2NDc3NywiZXhwIjoyMDY2ODQwNzc3fQ.bvIrnBDm8tA4el7MjXYi6Iic7nTjTcYbYxz8K0qF_c0
FRONTEND_URL=https://mobileapplication.creativeethics.co.in
PRODUCTION_DOMAINS=https://mobileapplication.creativeethics.co.in,https://app.anjanainfra.com
EMAIL_SERVICE=gmail
EMAIL_USER=ceteam.web@gmail.comv
EMAIL_PASSWORD=ceteam.web@gmail.com
EMAIL_FROM=noreply@creativeethics.co.in
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **STEP 4: Test Your Deployment**

After deployment, you'll get a URL like: `https://your-project-name.vercel.app`

**Test these endpoints**:
1. **Health Check**: `https://your-project-name.vercel.app/api/health`
2. **Mobile Health**: `https://your-project-name.vercel.app/api/mobile-health`
3. **Properties**: `https://your-project-name.vercel.app/api/properties`

**Expected Response** (Status 200):
```json
{
  "status": "ok",
  "message": "API is running",
  "database": "connected",
  "users": 8,
  "timestamp": "2025-07-03T13:45:00.000Z"
}
```

### **STEP 5: Update Mobile App**

Update your **frontend/.env** file:
```env
# Replace with your actual Vercel URL
EXPO_PUBLIC_API_BASE_URL=https://your-project-name.vercel.app/api
EXPO_PUBLIC_SERVER_BASE_URL=https://your-project-name.vercel.app
EXPO_PUBLIC_IMAGE_BASE_URL=https://your-project-name.vercel.app
EXPO_PUBLIC_FRONTEND_URL=https://your-project-name.vercel.app
```

### **STEP 6: Rebuild Mobile App**

```bash
cd frontend
npm run build
# or
expo build
```

---

## 🎯 QUICK DEPLOYMENT (2 MINUTES):

If you want to deploy RIGHT NOW:

1. **Go to https://vercel.com**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Import your backend repository**
5. **Add environment variables** (copy from above)
6. **Deploy!**

Your API will be live in 2 minutes! 🚀

---

## 🔧 TROUBLESHOOTING:

### **Build Fails**
- Check that `package.json` has correct dependencies
- Ensure `server.js` is in the root of your project
- Verify `vercel.json` configuration

### **Environment Variables Not Working**
- Make sure they're added in Vercel Dashboard
- Redeploy after adding variables
- Check variable names match exactly

### **Database Connection Issues**
- Verify Supabase credentials
- Check if Supabase project is active
- Test connection locally first

### **CORS Issues**
- Update `PRODUCTION_DOMAINS` in environment variables
- Add your Vercel URL to allowed origins

---

## 🎉 BENEFITS OF VERCEL:

- **No more 503 errors** - Reliable hosting
- **Automatic scaling** - Handles traffic spikes
- **Global CDN** - Fast worldwide access
- **Zero downtime** - Seamless deployments
- **Free SSL** - Secure HTTPS by default
- **Easy rollbacks** - Revert to previous versions
- **Real-time logs** - Debug issues easily

**Your mobile app will finally connect reliably! 🎯**