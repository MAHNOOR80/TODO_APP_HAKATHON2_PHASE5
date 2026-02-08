# Deployment Configuration Guide

This guide explains how to connect your frontend (Vercel) and backend (Railway) deployments.

## Current Deployment URLs

- **Frontend (Vercel):** https://todo-app-hakathon-2-phase-2.vercel.app
- **Backend (Railway):** https://todoapphakathon2backend-production.up.railway.app

---

## 1. Vercel Environment Variables (Frontend)

### Step-by-Step Instructions:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_API_URL` | `https://todoapphakathon2backend-production.up.railway.app/api/v1` | Production, Preview, Development |

### Steps in Vercel:

```bash
# 1. Click "Add New" button
# 2. Enter variable name: VITE_API_URL
# 3. Enter value: https://todoapphakathon2backend-production.up.railway.app/api/v1
# 4. Select environments: Production, Preview, Development (check all)
# 5. Click "Save"
```

### After Adding:

**You MUST redeploy** for the changes to take effect:
- Go to **Deployments** tab
- Click on the latest deployment
- Click **⋮ (three dots)** → **Redeploy**
- Or push a new commit to trigger auto-deployment

---

## 2. Railway Environment Variables (Backend)

### Step-by-Step Instructions:

1. Go to your Railway project dashboard
2. Select your backend service
3. Navigate to **Variables** tab
4. Add/update the following variable:

| Variable Name | Value |
|--------------|-------|
| `CORS_ORIGIN` | `https://todo-app-hakathon-2-phase-2.vercel.app` |

### Steps in Railway:

```bash
# 1. Click "+ New Variable" button
# 2. Variable name: CORS_ORIGIN
# 3. Value: https://todo-app-hakathon-2-phase-2.vercel.app
# 4. Click "Add"
```

### Existing Variables to Verify:

Make sure these are also set on Railway:

| Variable Name | Example Value | Description |
|--------------|---------------|-------------|
| `DATABASE_URL` | `postgresql://...` | Your Neon PostgreSQL connection string |
| `PORT` | `3000` | Port number (Railway sets this automatically) |
| `NODE_ENV` | `production` | Environment mode |
| `BETTER_AUTH_SECRET` | `kxKQIE7gyJXJTYMJIM6Y0JsCQu7iyUm6` | Authentication secret |
| `BETTER_AUTH_URL` | `https://todoapphakathon2backend-production.up.railway.app` | Your Railway backend URL |

### After Adding:

Railway will **automatically redeploy** when you save environment variables.

---

## 3. Verification Steps

After setting environment variables on both platforms:

### Test Backend Health:

1. Open: https://todoapphakathon2backend-production.up.railway.app
2. Should return:
```json
{
  "success": true,
  "data": {
    "message": "Todo API Server - Phase 2",
    "version": "2.0.0",
    "status": "running"
  }
}
```

### Test Backend API:

1. Open: https://todoapphakathon2backend-production.up.railway.app/api/v1/health
2. Should return health status

### Test Frontend Connection:

1. Open: https://todo-app-hakathon-2-phase-2.vercel.app/signin
2. Try to sign in or sign up
3. Check browser **Developer Tools** → **Network** tab
4. API requests should go to: `https://todoapphakathon2backend-production.up.railway.app/api/v1/...`
5. Should **NOT** see CORS errors in console

### Expected Console Output (Backend):

When deployed correctly, your Railway logs should show:
```
✅ Server running on http://localhost:3000
📚 API base URL: http://localhost:3000/api/v1
🌍 CORS enabled for: https://todo-app-hakathon-2-phase-2.vercel.app
```

---

## 4. Troubleshooting

### Issue: CORS Errors in Browser Console

**Error:** `Access to fetch at 'https://todoapphakathon2backend-production.up.railway.app/...' from origin 'https://todo-app-hakathon-2-phase-2.vercel.app' has been blocked by CORS policy`

**Solution:**
1. Verify `CORS_ORIGIN` on Railway is set to: `https://todo-app-hakathon-2-phase-2.vercel.app`
2. Make sure there are no trailing slashes
3. Wait for Railway to redeploy
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Network Error / Failed to Connect

**Error:** `Failed to connect to server` or `Network Error`

**Solution:**
1. Verify `VITE_API_URL` on Vercel is set correctly
2. Check Railway service is running (not crashed)
3. Test backend URL directly in browser
4. Redeploy Vercel after adding environment variable

### Issue: Authentication Doesn't Work

**Error:** Session/cookies not persisting

**Solution:**
1. Verify `credentials: 'include'` is set in frontend API client (already done in `src/services/api.ts`)
2. Check `BETTER_AUTH_URL` on Railway matches your backend URL
3. Ensure backend CORS has `credentials: true` (already configured)

### Issue: Database Connection Failed

**Error:** Database operations fail

**Solution:**
1. Check `DATABASE_URL` on Railway is set correctly
2. Verify Neon PostgreSQL is accessible
3. Check Railway logs for database connection errors

---

## 5. Quick Reference

### Frontend .env (Local Development):
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Frontend Environment Variables (Vercel Production):
```env
VITE_API_URL=https://todoapphakathon2backend-production.up.railway.app/api/v1
```

### Backend .env (Local Development):
```env
CORS_ORIGIN=http://localhost:5173
```

### Backend Environment Variables (Railway Production):
```env
CORS_ORIGIN=https://todo-app-hakathon-2-phase-2.vercel.app
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=kxKQIE7gyJXJTYMJIM6Y0JsCQu7iyUm6
BETTER_AUTH_URL=https://todoapphakathon2backend-production.up.railway.app
NODE_ENV=production
```

---

## 6. Visual Guide

### Vercel Dashboard:
```
Project → Settings → Environment Variables
┌─────────────────────────────────────────────────┐
│ Add New Variable                                 │
├─────────────────────────────────────────────────┤
│ Key:   VITE_API_URL                             │
│ Value: https://todoapphakathon2backend-...      │
│ Environments: ☑ Production ☑ Preview ☑ Dev     │
│                                      [Save]      │
└─────────────────────────────────────────────────┘
```

### Railway Dashboard:
```
Service → Variables Tab
┌─────────────────────────────────────────────────┐
│ + New Variable                                   │
├─────────────────────────────────────────────────┤
│ CORS_ORIGIN                                      │
│ https://todo-app-hakathon-2-phase-2.vercel.app  │
│                                      [Add]       │
└─────────────────────────────────────────────────┘
```

---

## Summary Checklist

- [ ] Set `VITE_API_URL` on Vercel to Railway backend URL
- [ ] Set `CORS_ORIGIN` on Railway to Vercel frontend URL
- [ ] Verify `DATABASE_URL` on Railway
- [ ] Verify `BETTER_AUTH_SECRET` on Railway
- [ ] Verify `BETTER_AUTH_URL` on Railway
- [ ] Redeploy Vercel (if needed)
- [ ] Wait for Railway auto-redeploy
- [ ] Test backend health endpoint
- [ ] Test frontend sign in/sign up
- [ ] Verify no CORS errors in browser console

---

**All set!** Your frontend and backend should now be properly connected. 🚀
