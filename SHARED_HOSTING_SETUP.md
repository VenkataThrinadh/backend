# 🚀 Shared Hosting Setup Guide for Node.js + Supabase

## ❌ CURRENT ISSUE:
Your Node.js server is NOT running on shared hosting, causing:
- Status 503 (Service Unavailable)
- Status 404 (Not Found)
- "Unable to connect to server" in mobile app

## ✅ SOLUTION OPTIONS:

### OPTION 1: Enable Node.js on Shared Hosting

#### Step 1: Check if Node.js is Supported
1. **Login to cPanel**
2. **Look for "Node.js" or "Node.js Selector"**
3. **If found**: Your hosting supports Node.js ✅
4. **If not found**: Contact support or use Option 2

#### Step 2: Setup Node.js App (if supported)
1. **Go to Node.js section in cPanel**
2. **Create New Application**:
   - **Node.js Version**: 18.x or 20.x
   - **Application Mode**: Production
   - **Application Root**: `api` (or your preferred folder)
   - **Application URL**: `yourdomain.com/api`
   - **Application Startup File**: `server.js`

3. **Upload Your Files**:
   ```
   public_html/api/
   ├── server.js
   ├── package.json
   ├── .env
   ├── db.js
   ├── routes/
   ├── middleware/
   ├── services/
   └── public/
   ```

4. **Install Dependencies**:
   - In cPanel Node.js section, click "Run NPM Install"
   - Or use terminal: `npm install --production`

5. **Start Application**:
   - Click "Restart" in Node.js section
   - Your API should be available at: `https://yourdomain.com/api`

#### Step 3: Test Your Setup
Visit: `https://mobileapplication.creativeethics.co.in/api/health`
- **Expected**: Status 200 with JSON response
- **If 503/404**: Node.js app is not running properly

---

### OPTION 2: Use Alternative Hosting (Recommended)

If your shared hosting doesn't support Node.js properly:

#### A. **Vercel (Free & Easy)**
1. **Create Vercel account**
2. **Connect your GitHub repo**
3. **Deploy automatically**
4. **Update mobile app URL to Vercel URL**

#### B. **Railway (Simple)**
1. **Create Railway account**
2. **Deploy from GitHub**
3. **Automatic Node.js detection**
4. **Built-in environment variables**

#### C. **Render (Free Tier)**
1. **Create Render account**
2. **Connect repository**
3. **Auto-deploy on push**
4. **Free SSL included**

---

### OPTION 3: Contact Your Hosting Provider

**Ask them these specific questions:**

1. **"Do you support Node.js applications?"**
2. **"How do I deploy a Node.js app with Express?"**
3. **"Can you help me run 'npm start' for my application?"**
4. **"What's the correct way to set up API endpoints?"**
5. **"Can you check why I'm getting 503 errors?"**

**Tell them:**
- "I have a Node.js Express API that needs to run continuously"
- "My app connects to Supabase PostgreSQL database"
- "I need the API accessible at /api/ path"

---

## 🔧 IMMEDIATE TESTING:

### Test 1: Check Node.js Support
```bash
# If you have SSH access to your hosting:
node --version
npm --version
```

### Test 2: Manual Start (if SSH available)
```bash
cd /path/to/your/api/folder
npm install
npm start
```

### Test 3: Check Process
```bash
# See if your Node.js app is running:
ps aux | grep node
```

---

## 📱 MOBILE APP UPDATES:

Once your Node.js server is running, test these URLs:

1. **Health Check**: `https://mobileapplication.creativeethics.co.in/api/health`
2. **Mobile Health**: `https://mobileapplication.creativeethics.co.in/api/mobile-health`
3. **Properties**: `https://mobileapplication.creativeethics.co.in/api/properties`

**Expected Response** (Status 200):
```json
{
  "status": "healthy",
  "message": "Real Estate API is running",
  "database": {
    "status": "connected"
  },
  "supabase": {
    "status": "connected"
  }
}
```

---

## 🎯 RECOMMENDED SOLUTION:

**Since shared hosting Node.js can be tricky, I recommend:**

1. **Deploy to Vercel/Railway** (5 minutes setup)
2. **Update mobile app URL** to new deployment
3. **Keep shared hosting for static files only**

This will give you:
- ✅ Reliable Node.js hosting
- ✅ Automatic deployments
- ✅ Better performance
- ✅ Free SSL certificates
- ✅ No server management headaches

**Would you like me to help you deploy to Vercel or Railway instead?**