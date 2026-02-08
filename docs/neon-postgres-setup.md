# Neon PostgreSQL Setup Guide

This guide will help you set up a Neon PostgreSQL database for the Todo App backend.

## Step 1: Create a Neon Account

1. Go to https://neon.tech/
2. Click "Sign up" and create a new account
3. Verify your email address

## Step 2: Create a New Project

1. Log in to your Neon dashboard
2. Click "New Project"
3. Choose your preferred region (closest to your location)
4. Select PostgreSQL version 15+ (recommended)
5. Click "Create Project"

## Step 3: Get Your Connection Details

1. In your project dashboard, go to the "Connection Details" section
2. Copy the connection string for your preferred application (Node.js/Prisma)
3. The connection string will look like:
   ```
   postgresql://[username]:[password]@[region].aws.neon.tech/[database_name]?sslmode=require
   ```

## Step 4: Update Environment Variables

1. Open `backend/.env` in your project
2. Replace the existing `DATABASE_URL` with your Neon connection string:
   ```
   DATABASE_URL="postgresql://[username]:[password]@[region].aws.neon.tech/[database_name]?sslmode=require"
   ```

## Step 5: Run Database Migrations

After updating the environment variables:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma migrate dev
   ```

4. Test the connection:
   ```bash
   npx prisma db pull
   ```

## Step 6: Start the Backend Server

1. Start the backend server:
   ```bash
   npm run dev
   ```

## Troubleshooting Common Issues

### Connection Timeout
- Ensure your Neon project is active (not paused)
- Check your internet connection
- Verify the connection string format

### Authentication Failed
- Verify your username and password are correct
- Check for any special characters that might need URL encoding
- Make sure the user has the correct permissions

### SSL Connection Issues
- Ensure `sslmode=require` is in your connection string
- If you have issues, try `sslmode=prefer` as a test (not recommended for production)

### Database Not Found
- Verify the database name in your connection string matches your Neon project
- Ensure you're using the correct project in Neon

## Important Notes

- Neon offers a free tier that should be sufficient for development
- Your Neon project may automatically pause after inactivity (this is normal)
- If your project is paused, the first connection might take a few seconds to establish
- Always keep your connection string secure and never commit it to version control

## Example Connection String Format

Your connection string should follow this format:
```
postgresql://[username]:[password]@[region].aws.neon.tech/[database_name]?sslmode=require
```

For example:
```
DATABASE_URL="postgresql://alex_12345:password123@us-east-1.aws.neon.tech/neondb?sslmode=require"
```