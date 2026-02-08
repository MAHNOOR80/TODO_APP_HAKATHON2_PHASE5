# Railway Deployment Fix Guide

This guide fixes two critical issues with your Railway backend deployment:

1. **CORS_ORIGIN not working** - Still showing `localhost:5173`
2. **Prisma connection error** - `Error { kind: Closed, cause: None }`

---

## Issue 1: CORS_ORIGIN Not Being Read

### Current Problem:
Your Railway logs show:
```
🌍 CORS enabled for: http://localhost:5173
```

This means Railway is **NOT reading** the `CORS_ORIGIN` environment variable.

### Root Causes:
- Variable not set correctly on Railway
- Typo in variable name or value
- Railway build cache
- Set on wrong service

---

## Solution: Set CORS_ORIGIN on Railway (Step-by-Step)

### Step 1: Go to Railway Dashboard

1. Open: https://railway.app/dashboard
2. Click on your **backend project**
3. You'll see your services - click on the **backend service** (the one running your Node.js app)

### Step 2: Add Environment Variable

1. Click on the **Variables** tab
2. Look for existing `CORS_ORIGIN` variable
3. If it exists, **DELETE IT** (click trash icon)
4. Click **+ New Variable** button

### Step 3: Add Variable EXACTLY Like This

**Copy these values EXACTLY (no extra spaces):**

| Field | Value |
|-------|-------|
| **Variable** | `CORS_ORIGIN` |
| **Value** | `https://todo-app-hakathon-2-phase-2.vercel.app` |

**CRITICAL:**
- No spaces before or after
- No trailing slash at the end
- Use the exact URL

### Step 4: Save and Wait

1. Click **Add**
2. Railway will **automatically redeploy** your service
3. Wait 1-2 minutes for deployment to complete
4. Check the logs

### Step 5: Verify in Logs

After redeployment, check your Railway logs. You should see:

```
✅ Server running on http://localhost:5002
🌍 CORS enabled for: https://todo-app-hakathon-2-phase-2.vercel.app
```

**NOT:**
```
🌍 CORS enabled for: http://localhost:5173  ❌ WRONG
```

---

## Issue 2: Prisma Connection Error (Neon PostgreSQL)

### Current Problem:
```
prisma:error Error in PostgreSQL connection: Error { kind: Closed, cause: None }
```

This is a **connection pooling issue** with Neon Serverless PostgreSQL.

### Root Cause:
Neon closes idle connections aggressively, and the DATABASE_URL doesn't have proper pooling parameters.

---

## Solution: Update DATABASE_URL on Railway

### Step 1: Get Your Current DATABASE_URL

From Railway Variables tab, find `DATABASE_URL`. It probably looks like:
```
postgresql://neondb_owner:...@ep-sparkling-butterfly-a4pobcv3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Step 2: Add Connection Pooling Parameters

**Update your `DATABASE_URL` on Railway to include these parameters:**

**Original (BAD):**
```
postgresql://neondb_owner:npg_vUJM5AXtjTF6@ep-sparkling-butterfly-a4pobcv3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Updated (GOOD):**
```
postgresql://neondb_owner:npg_vUJM5AXtjTF6@ep-sparkling-butterfly-a4pobcv3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=10
```

**What Changed:**
- Added `&pgbouncer=true` - Enables connection pooling
- Added `&connect_timeout=10` - Prevents timeout issues
- **Removed** `&channel_binding=require` - Can cause issues with pooler

### Step 3: Update on Railway

1. Go to Railway **Variables** tab
2. Find `DATABASE_URL`
3. Click **Edit** (pencil icon)
4. Update the value with the new parameters
5. Click **Save**
6. Railway will auto-redeploy

### Step 4: Verify Database Connection

After redeployment, check Railway logs:

**Good:**
```
✅ Database connection: OK
✅ Server running on http://localhost:5002
```

**Bad:**
```
⚠️  Database connection: FAILED
prisma:error Error in PostgreSQL connection: Error { kind: Closed, cause: None }
```

---

## Complete Railway Environment Variables Checklist

Make sure ALL these variables are set on Railway:

| Variable Name | Example Value | Notes |
|--------------|---------------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require&pgbouncer=true&connect_timeout=10` | **Must include pooling params** |
| `CORS_ORIGIN` | `https://todo-app-hakathon-2-phase-2.vercel.app` | **No trailing slash** |
| `BETTER_AUTH_SECRET` | `kxKQIE7gyJXJTYMJIM6Y0JsCQu7iyUm6` | Your auth secret |
| `BETTER_AUTH_URL` | `https://todoapphakathon2backend-production.up.railway.app` | Your Railway URL |
| `NODE_ENV` | `production` | Set to production |
| `PORT` | (Auto-set by Railway) | Railway sets this automatically |

---

## Verification Steps

### 1. Check Railway Logs

After both fixes, your logs should show:

```
Starting Container
npm warn config production Use `--omit=dev` instead.
> todo-app-backend@2.0.0 start
> node dist/index.js

✅ Database connection: OK
✅ Server running on http://localhost:5002
📚 API base URL: http://localhost:5002/api/v1
🌍 CORS enabled for: https://todo-app-hakathon-2-phase-2.vercel.app
📊 Health check: http://localhost:5002/api/v1/health
```

**No Prisma errors!**

### 2. Test Backend Health

Open: https://todoapphakathon2backend-production.up.railway.app

Should return:
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

### 3. Test from Frontend

1. Open: https://todo-app-hakathon-2-phase-2.vercel.app/signin
2. Try to sign up with test credentials
3. Open Browser DevTools → Console
4. **Should NOT see CORS errors**
5. Network tab should show API calls to Railway backend

---

## Troubleshooting

### Still Seeing localhost:5173 in CORS?

**Try these in order:**

1. **Hard Refresh Railway:**
   - Variables tab → Delete `CORS_ORIGIN`
   - Add it again exactly as shown
   - Wait 2 minutes

2. **Check Service:**
   - Make sure you're setting variables on the correct service
   - Railway projects can have multiple services
   - Set variables on the **backend Node.js service**

3. **Manual Redeploy:**
   - Deployments tab → Click latest deployment
   - Click ⋮ (three dots) → Redeploy

4. **Restart Service:**
   - Settings tab → Restart Service

### Still Getting Prisma Errors?

**Try these:**

1. **Verify DATABASE_URL:**
   - Must use `-pooler` endpoint from Neon
   - Must include `pgbouncer=true`
   - Must include `connect_timeout=10`
   - Remove `channel_binding=require` if present

2. **Check Neon Dashboard:**
   - Login to Neon: https://console.neon.tech
   - Verify database is running
   - Check connection limits

3. **Test Connection:**
   - Use Neon's "Connection String" tester
   - Ensure it works outside Railway first

### CORS Error in Browser?

**Error:** `Access to fetch has been blocked by CORS policy`

**Solution:**
1. Verify `CORS_ORIGIN` on Railway matches your Vercel URL **exactly**
2. No trailing slash: `https://todo-app-hakathon-2-phase-2.vercel.app` ✅
3. With trailing slash: `https://todo-app-hakathon-2-phase-2.vercel.app/` ❌
4. Clear browser cache (Ctrl+Shift+R)

---

## Quick Reference

### Railway Variables (Production)

```bash
# Database with connection pooling
DATABASE_URL=postgresql://neondb_owner:npg_vUJM5AXtjTF6@ep-sparkling-butterfly-a4pobcv3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=10

# CORS for Vercel frontend
CORS_ORIGIN=https://todo-app-hakathon-2-phase-2.vercel.app

# Auth configuration
BETTER_AUTH_SECRET=kxKQIE7gyJXJTYMJIM6Y0JsCQu7iyUm6
BETTER_AUTH_URL=https://todoapphakathon2backend-production.up.railway.app

# Environment
NODE_ENV=production
```

---

## Expected Logs After Fix

```
Starting Container
npm warn config production Use `--omit=dev` instead.

> todo-app-backend@2.0.0 start
> node dist/index.js

✅ Database connection: OK
✅ Server running on http://localhost:5002
📚 API base URL: http://localhost:5002/api/v1
🌍 CORS enabled for: https://todo-app-hakathon-2-phase-2.vercel.app
📊 Health check: http://localhost:5002/api/v1/health
```

**No errors! 🎉**

---

## Summary Checklist

- [ ] Set `CORS_ORIGIN` to Vercel URL (no trailing slash)
- [ ] Update `DATABASE_URL` with `&pgbouncer=true&connect_timeout=10`
- [ ] Remove `&channel_binding=require` from DATABASE_URL
- [ ] Verify `BETTER_AUTH_URL` points to Railway backend
- [ ] Wait for Railway auto-redeploy (1-2 minutes)
- [ ] Check logs show Vercel URL in CORS
- [ ] Verify no Prisma connection errors
- [ ] Test backend health endpoint
- [ ] Test frontend sign in/sign up
- [ ] Verify no CORS errors in browser console

---

**All set!** Your Railway backend should now properly connect with your Vercel frontend. 🚀
