# 🔍 Deployment Verification Guide

## Current Status

✅ **GitHub**: Latest code is pushed
✅ **Local Build**: Successfully builds
✅ **All Routes**: Working correctly
- `/` → Landing page
- `/chat` → Chat interface
- `/api/chat` → AI proxy
- `/api/init` → User initialization

## ❓ Issue: Button Not Working

This usually means **Vercel hasn't deployed the latest code** or **deployment has errors**.

---

## 🚀 Step 1: Check if Deployed to Vercel

Visit: https://vercel.com/mason-sapiens

**If you see `sapiens-web` project:**
- ✅ It's deployed
- Go to Step 2

**If you DON'T see it:**
- ❌ Not deployed yet
- Go to Step 3

---

## 🔄 Step 2: Trigger Redeploy (If Already Deployed)

### Option A: Via Vercel Dashboard

1. Go to https://vercel.com/mason-sapiens/sapiens-web
2. Click **"Deployments"** tab
3. Find the latest deployment
4. Click **"⋯"** (three dots) → **"Redeploy"**

### Option B: Push Empty Commit

```bash
cd /Users/geunwon/Desktop/Sapiens/sapiens-web
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

Vercel will automatically redeploy.

---

## 📦 Step 3: Deploy for First Time

### Via Vercel Dashboard

1. Visit: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Search for: **sapiens-web**
4. Click **"Import"**
5. Configure:
   - Framework: **Next.js** (auto-detected)
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `.next`

6. **Environment Variables** - Click "Add":
   ```
   Key: NEXT_PUBLIC_API_URL
   Value: http://3.101.121.64:8000
   ```

7. Click **"Deploy"**

Wait 2-3 minutes for deployment.

---

## ✅ Step 4: Verify Deployment

Once deployed, you'll get a URL like:
```
https://sapiens-web.vercel.app
```

### Test 1: Landing Page
1. Visit your Vercel URL
2. Should see: "Sapiens" heading + "Start" button

### Test 2: Button Click
1. Click "Start" button
2. Should navigate to `/chat`
3. Should see: "Welcome to Sapiens!" message

### Test 3: Chat Functionality
1. Type: "Product Manager"
2. Click "Send"
3. Should get AI response within 5-10 seconds

---

## 🐛 Common Issues & Fixes

### Issue 1: Button Doesn't Navigate

**Symptom**: Clicking "Start" does nothing

**Check**:
1. Open browser console (F12)
2. Look for errors
3. Check Network tab for failed requests

**Fix**: Clear browser cache
```
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Issue 2: Chat Page Blank

**Symptom**: Button navigates but chat page is blank

**Check**: Browser console for errors

**Fix**: Redeploy with correct routes
```bash
git commit --allow-empty -m "Fix routes"
git push origin main
```

### Issue 3: "Connecting to AI system..." Forever

**Symptom**: Page loads but stays on "Connecting..."

**Cause**: Can't reach AI backend

**Fix**:
1. Verify AI backend is running:
   ```bash
   curl http://3.101.121.64:8000/health
   ```

2. Check Vercel environment variable:
   - Go to Vercel project settings
   - Environment Variables
   - Verify: `NEXT_PUBLIC_API_URL=http://3.101.121.64:8000`

3. Check CORS in AI backend:
   ```bash
   ssh -i ~/.ssh/sapiens-mvp-key.pem ubuntu@3.101.121.64
   cd ~/MVP
   grep -A 5 "CORSMiddleware" backend/api/main.py
   ```

   Should have:
   ```python
   allow_origins=["*"]
   ```

### Issue 4: Deployment Failed

**Symptom**: Vercel shows "Deployment Failed"

**Check**: Vercel deployment logs

**Common Causes**:
- Missing dependencies
- Build errors
- Environment variable issues

**Fix**:
1. Check logs in Vercel dashboard
2. Copy error message
3. Fix locally:
   ```bash
   npm run build
   ```
4. If builds locally, push again:
   ```bash
   git push origin main
   ```

---

## 🧪 Complete Test Sequence

Run this complete test after deployment:

### 1. Landing Page Test
```
✓ Visit: https://your-app.vercel.app
✓ See: "Sapiens" heading
✓ See: "Start" button (teal color)
✓ Button is clickable
```

### 2. Navigation Test
```
✓ Click "Start"
✓ URL changes to /chat
✓ Page loads without errors
```

### 3. Initialization Test
```
✓ Chat page shows "Welcome to Sapiens!"
✓ Console shows: "Initializing user: user_xxxxx"
✓ Console shows: "User initialized successfully"
✓ Input box is enabled
```

### 4. Message Test
```
✓ Type: "Product Manager"
✓ Click "Send"
✓ Message appears on right (user message)
✓ Loading animation appears
✓ AI response appears on left
✓ Can send another message
```

---

## 📊 Deployment Checklist

Before considering deployment complete:

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Latest deployment successful
- [ ] Environment variable set
- [ ] Landing page loads
- [ ] "Start" button works
- [ ] Chat page loads
- [ ] User initialization succeeds
- [ ] Can send messages
- [ ] AI responds correctly

---

## 🔧 Debug Commands

### Check Current Deployment

```bash
# If using Vercel CLI
vercel ls

# See current deployment
vercel inspect your-deployment-url
```

### Force New Deployment

```bash
cd /Users/geunwon/Desktop/Sapiens/sapiens-web

# Option 1: Empty commit
git commit --allow-empty -m "Force deploy"
git push

# Option 2: CLI deploy
vercel --prod
```

### Check Logs

```bash
# Real-time logs
vercel logs your-project-url --follow

# Or check in dashboard:
# https://vercel.com/mason-sapiens/sapiens-web/deployments
```

---

## 🎯 Quick Fix Summary

If button doesn't work:

1. **Check Vercel**: https://vercel.com/mason-sapiens/sapiens-web
2. **Redeploy**: Push empty commit or use Vercel dashboard
3. **Verify URL**: Visit your Vercel URL (not localhost)
4. **Clear Cache**: Hard refresh (Cmd+Shift+R)
5. **Check Console**: F12 → Console for errors

---

## 📞 Still Not Working?

Share these details:

1. **Vercel URL**: `https://your-app.vercel.app`
2. **Error Message**: From browser console (F12)
3. **Deployment Status**: Success/Failed in Vercel
4. **What Happens**: When you click "Start"
   - Nothing?
   - Navigates but blank?
   - Error message?
   - Other?

I'll help you debug immediately!

---

## ✅ Success Indicators

When everything is working:

1. ✅ Vercel shows "Deployment: Ready"
2. ✅ Landing page loads instantly
3. ✅ Click "Start" → navigates to /chat
4. ✅ Chat page loads with welcome message
5. ✅ Can type and send messages
6. ✅ AI responds within seconds
7. ✅ No errors in browser console

**You should have a fully functional app!** 🎉

