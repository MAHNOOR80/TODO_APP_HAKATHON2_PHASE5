# Local PostgreSQL Setup Guide

This guide will help you set up a local PostgreSQL database for the Todo App backend.

## Option 1: Install PostgreSQL Locally

### Windows Installation

1. **Download PostgreSQL**:
   - Go to https://www.postgresql.org/download/windows/
   - Download the installer for your system
   - Run the installer as Administrator

2. **Install PostgreSQL**:
   - Follow the installation wizard
   - Set a password for the `postgres` user (remember this)
   - Keep default settings for port (5432) and data directory
   - Complete the installation

3. **Create Database**:
   - Open Command Prompt or PowerShell as Administrator
   - Connect to PostgreSQL:
     ```bash
     psql -U postgres -h localhost -p 5432
     ```
   - Enter the password you set during installation
   - Create the database:
     ```sql
     CREATE DATABASE todo_app_dev;
     \c todo_app_dev;
     \q
     ```

4. **Update Environment Variables**:
   - In `backend/.env`, make sure `DATABASE_URL` is set to:
     ```
     DATABASE_URL="postgresql://localhost:5432/todo_app_dev"
     ```

### macOS Installation

1. **Install using Homebrew**:
   ```bash
   brew install postgresql
   ```

2. **Start PostgreSQL service**:
   ```bash
   brew services start postgresql
   ```

3. **Create Database**:
   ```bash
   createdb todo_app_dev
   ```

### Linux Installation (Ubuntu/Debian)

1. **Install PostgreSQL**:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. **Start PostgreSQL service**:
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **Create Database**:
   ```bash
   sudo -u postgres createdb todo_app_dev
   ```

## Option 2: Use Docker (Recommended if Docker is available)

1. **Install Docker Desktop**:
   - Download from https://www.docker.com/products/docker-desktop/

2. **Start PostgreSQL Container**:
   ```bash
   docker run --name todo-postgres -e POSTGRES_DB=todo_app_dev -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
   ```

3. **Update Environment Variables**:
   - In `backend/.env`, make sure `DATABASE_URL` is set to:
     ```
     DATABASE_URL="postgresql://localhost:5432/todo_app_dev"
     ```

## Run Database Migrations

After setting up PostgreSQL and updating the environment variables:

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Run Prisma migrations**:
   ```bash
   npx prisma migrate dev
   ```

4. **Start the backend server**:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Common Issues:

1. **"psql: FATAL: database 'todo_app_dev' does not exist"**:
   - Make sure you created the database using `createdb todo_app_dev`

2. **"FATAL: password authentication failed"**:
   - Check that the PostgreSQL service is running
   - Verify the password for the postgres user

3. **"could not connect to server"**:
   - Check that PostgreSQL service is running
   - Verify the port is correct (default is 5432)

4. **Prisma migration errors**:
   - Make sure the database connection is working
   - Check that the database URL is correctly formatted

## Verify Database Connection

You can test the connection by running:
```bash
npx prisma db pull
```

This should connect to your database and generate the Prisma schema from the existing database structure.