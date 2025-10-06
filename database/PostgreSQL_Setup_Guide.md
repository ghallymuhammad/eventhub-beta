# PostgreSQL Database Setup Guide for EventHub

This guide will walk you through setting up the PostgreSQL database for the EventHub event management platform.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [PostgreSQL Installation](#postgresql-installation)
3. [Database Creation](#database-creation)
4. [Environment Configuration](#environment-configuration)
5. [Schema Setup with Prisma](#schema-setup-with-prisma)
6. [Database Visualization](#database-visualization)
7. [Sample Data](#sample-data)
8. [Backup and Restore](#backup-and-restore)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

- Node.js 18+ installed
- Administrator/sudo access to your system
- Basic knowledge of command line operations

## 🗄️ PostgreSQL Installation

### macOS (using Homebrew)

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create a database user (optional, you can use your system user)
createuser --interactive --pwprompt eventhub_user
```

### Ubuntu/Debian Linux

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database user
sudo -u postgres psql
```

### Windows

1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the superuser password you set during installation
4. Add PostgreSQL bin directory to your PATH environment variable

### Docker (Cross-platform)

```bash
# Run PostgreSQL in Docker
docker run --name eventhub-postgres \
  -e POSTGRES_DB=eventhub \
  -e POSTGRES_USER=eventhub_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:14

# Or use docker-compose (create docker-compose.yml)
version: '3.8'
services:
  postgres:
    image: postgres:14
    container_name: eventhub-postgres
    environment:
      POSTGRES_DB: eventhub
      POSTGRES_USER: eventhub_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - eventhub_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  eventhub_data:

# Run with docker-compose
docker-compose up -d
```

## 🏗️ Database Creation

### Method 1: Using PostgreSQL Command Line

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database
CREATE DATABASE eventhub;

# Create user with password
CREATE USER eventhub_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE eventhub TO eventhub_user;
GRANT USAGE ON SCHEMA public TO eventhub_user;
GRANT CREATE ON SCHEMA public TO eventhub_user;

# Connect to the new database
\c eventhub;

# Grant privileges on all tables (run after Prisma migration)
GRANT ALL ON ALL TABLES IN SCHEMA public TO eventhub_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO eventhub_user;

# Exit psql
\q
```

### Method 2: Using createdb Command

```bash
# Create database directly
createdb eventhub -O eventhub_user

# Or if using system user
createdb eventhub
```

## ⚙️ Environment Configuration

Create or update your `.env` file in the project root:

```bash
# Database Configuration
DATABASE_URL="postgresql://eventhub_user:your_secure_password@localhost:5432/eventhub"

# Alternative format for different setups:
# Local without password: DATABASE_URL="postgresql://localhost:5432/eventhub"
# With specific host: DATABASE_URL="postgresql://eventhub_user:password@192.168.1.100:5432/eventhub"
# With SSL: DATABASE_URL="postgresql://eventhub_user:password@localhost:5432/eventhub?sslmode=require"

# JWT Configuration (for authentication)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# NextAuth Configuration (if using NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# File Upload Configuration
UPLOAD_MAX_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp,application/pdf"

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application Configuration
NODE_ENV="development"
PORT=3000
BACKEND_PORT=5000

# Points System Configuration
POINTS_PER_DOLLAR=10
REFERRAL_POINTS_BONUS=500
WELCOME_POINTS_BONUS=100
```

## 🏗️ Schema Setup with Prisma

### 1. Initialize Prisma (if not already done)

```bash
# Install Prisma CLI
npm install -D prisma
npm install @prisma/client

# Initialize Prisma
npx prisma init
```

### 2. Update Prisma Schema

The `prisma/schema.prisma` file should already be configured. If not, here's the basic setup:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Your models will be defined here
// (The complete schema is already in your project)
```

### 3. Generate Prisma Client and Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create and run initial migration
npx prisma migrate dev --name init

# If you want to reset the database and start fresh
npx prisma migrate reset --force

# Push schema changes without creating migration files (development only)
npx prisma db push
```

### 4. Verify Database Connection

```bash
# Open Prisma Studio to view your database
npx prisma studio

# This will open http://localhost:5555 in your browser
```

## 📊 Database Visualization

### Using dbdiagram.io

1. Copy the contents of `database/eventhub.dbml`
2. Go to [dbdiagram.io](https://dbdiagram.io/)
3. Paste the DBML code in the editor
4. View the interactive database diagram

### Using PostgreSQL Admin Tools

#### pgAdmin (GUI Tool)

```bash
# Install pgAdmin
# macOS: brew install --cask pgadmin4
# Ubuntu: sudo apt install pgadmin4
# Windows: Download from pgadmin.org

# Or use web version
docker run -p 80:80 \
  -e "PGADMIN_DEFAULT_EMAIL=admin@eventhub.com" \
  -e "PGADMIN_DEFAULT_PASSWORD=admin" \
  -d dpage/pgadmin4
```

#### Using psql Command Line

```bash
# Connect to your database
psql -U eventhub_user -d eventhub -h localhost

# List all tables
\dt

# Describe a table structure
\d users

# View table with data
SELECT * FROM users LIMIT 5;

# Check database size
SELECT pg_size_pretty(pg_database_size('eventhub')) as db_size;

# Exit
\q
```

## 📝 Sample Data

### Using Prisma Seed

The project includes a seed file at `prisma/seed.ts`. Run it with:

```bash
# Run the seed script
npx prisma db seed

# Or manually
npm run db:seed
```

### Manual Sample Data Creation

```sql
-- Connect to your database and run these queries
psql -U eventhub_user -d eventhub

-- Insert sample users
INSERT INTO users (id, email, name, password, role, referral_code) VALUES
('user1_id', 'john@example.com', 'John Doe', '$2a$10$hashedpassword', 'USER', 'JOHN123'),
('user2_id', 'jane@example.com', 'Jane Smith', '$2a$10$hashedpassword', 'ORGANIZER', 'JANE456'),
('user3_id', 'admin@example.com', 'Admin User', '$2a$10$hashedpassword', 'ADMIN', 'ADMIN789');

-- Insert sample events
INSERT INTO events (id, title, description, date, location, capacity, price, organizer_id, is_published) VALUES
('event1_id', 'Tech Conference 2024', 'Annual technology conference', '2024-12-15 09:00:00', 'Convention Center', 500, 99.99, 'user2_id', true),
('event2_id', 'Music Festival', 'Summer music festival', '2024-08-20 15:00:00', 'Central Park', 1000, 75.00, 'user2_id', true);

-- Insert sample ticket types
INSERT INTO event_ticket_types (id, event_id, name, type, price, quantity_available) VALUES
('ticket1_id', 'event1_id', 'General Admission', 'REGULAR', 99.99, 400),
('ticket2_id', 'event1_id', 'VIP Access', 'VIP', 199.99, 50),
('ticket3_id', 'event2_id', 'Standard', 'REGULAR', 75.00, 800),
('ticket4_id', 'event2_id', 'Premium', 'PREMIUM', 150.00, 200);
```

## 💾 Backup and Restore

### Creating Backups

```bash
# Create a full database backup
pg_dump -U eventhub_user -h localhost -d eventhub > eventhub_backup.sql

# Create a compressed backup
pg_dump -U eventhub_user -h localhost -d eventhub | gzip > eventhub_backup.sql.gz

# Backup specific tables
pg_dump -U eventhub_user -h localhost -d eventhub -t users -t events > partial_backup.sql

# Create a custom format backup (recommended for large databases)
pg_dump -U eventhub_user -h localhost -d eventhub -Fc > eventhub_backup.dump
```

### Restoring Backups

```bash
# Restore from SQL file
psql -U eventhub_user -h localhost -d eventhub < eventhub_backup.sql

# Restore from compressed SQL
gunzip -c eventhub_backup.sql.gz | psql -U eventhub_user -h localhost -d eventhub

# Restore from custom format
pg_restore -U eventhub_user -h localhost -d eventhub eventhub_backup.dump

# Create new database and restore
createdb eventhub_restored
pg_restore -U eventhub_user -h localhost -d eventhub_restored eventhub_backup.dump
```

### Automated Backup Script

Create a backup script `scripts/backup_db.sh`:

```bash
#!/bin/bash

# Configuration
DB_NAME="eventhub"
DB_USER="eventhub_user"
DB_HOST="localhost"
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/eventhub_backup_$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U $DB_USER -h $DB_HOST -d $DB_NAME | gzip > $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "eventhub_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

Make it executable and add to cron:

```bash
chmod +x scripts/backup_db.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add this line:
0 2 * * * /path/to/your/project/scripts/backup_db.sh
```

## ⚡ Performance Optimization

### Essential Indexes

```sql
-- Connect to your database
psql -U eventhub_user -d eventhub

-- Create performance indexes
CREATE INDEX CONCURRENTLY idx_events_date ON events(date);
CREATE INDEX CONCURRENTLY idx_events_organizer ON events(organizer_id);
CREATE INDEX CONCURRENTLY idx_events_published ON events(is_published);
CREATE INDEX CONCURRENTLY idx_events_category ON events(category);

CREATE INDEX CONCURRENTLY idx_transactions_user ON transactions(user_id);
CREATE INDEX CONCURRENTLY idx_transactions_event ON transactions(event_id);
CREATE INDEX CONCURRENTLY idx_transactions_status ON transactions(status);
CREATE INDEX CONCURRENTLY idx_transactions_created ON transactions(created_at);

CREATE INDEX CONCURRENTLY idx_points_user ON points(user_id);
CREATE INDEX CONCURRENTLY idx_points_expires ON points(expires_at);
CREATE INDEX CONCURRENTLY idx_points_used ON points(is_used);

CREATE INDEX CONCURRENTLY idx_reviews_event ON reviews(event_id);
CREATE INDEX CONCURRENTLY idx_reviews_approved ON reviews(is_approved);

-- Full-text search index
CREATE INDEX CONCURRENTLY idx_events_search 
ON events USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));
```

### PostgreSQL Configuration

Edit `/etc/postgresql/14/main/postgresql.conf` (path may vary):

```conf
# Memory settings
shared_buffers = 256MB          # 25% of RAM for dedicated server
effective_cache_size = 1GB      # 75% of RAM
work_mem = 4MB                  # Per operation memory
maintenance_work_mem = 64MB     # For maintenance operations

# Connection settings
max_connections = 100           # Adjust based on your needs

# Write-ahead logging
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query planner
random_page_cost = 1.1          # For SSD storage
effective_io_concurrency = 200  # For SSD storage

# Logging (for development)
log_statement = 'all'
log_duration = on
log_min_duration_statement = 100ms
```

Restart PostgreSQL after configuration changes:

```bash
# macOS
brew services restart postgresql@14

# Ubuntu/Debian
sudo systemctl restart postgresql

# Docker
docker restart eventhub-postgres
```

## 🔍 Troubleshooting

### Common Connection Issues

#### 1. Connection Refused

```bash
# Check if PostgreSQL is running
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Docker
docker ps | grep postgres
```

#### 2. Authentication Failed

```bash
# Reset user password
psql -U postgres
ALTER USER eventhub_user WITH PASSWORD 'new_password';

# Update your .env file with the new password
```

#### 3. Database Does Not Exist

```bash
# List all databases
psql -U postgres -l

# Create the database if missing
createdb eventhub -O eventhub_user
```

#### 4. Permission Denied

```sql
-- Connect as superuser and grant permissions
psql -U postgres -d eventhub

GRANT ALL PRIVILEGES ON DATABASE eventhub TO eventhub_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO eventhub_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO eventhub_user;
GRANT USAGE ON SCHEMA public TO eventhub_user;
```

### Prisma-Specific Issues

#### 1. Prisma Client Out of Sync

```bash
# Regenerate Prisma client
npx prisma generate

# If schema changes aren't reflected
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

#### 2. Migration Issues

```bash
# Check migration status
npx prisma migrate status

# Reset migrations (CAUTION: This will delete all data)
npx prisma migrate reset

# Create new migration for schema changes
npx prisma migrate dev --name your_migration_name
```

#### 3. Connection Pool Issues

Add to your `.env`:

```bash
DATABASE_URL="postgresql://eventhub_user:password@localhost:5432/eventhub?connection_limit=10&pool_timeout=20"
```

### Performance Issues

#### 1. Slow Queries

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 100;
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### 2. High CPU/Memory Usage

```sql
-- Check running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Kill long-running query
SELECT pg_terminate_backend(pid);
```

### Useful Commands

```bash
# Check PostgreSQL version
psql --version

# Check database size
psql -U eventhub_user -d eventhub -c "SELECT pg_size_pretty(pg_database_size('eventhub'));"

# Check table sizes
psql -U eventhub_user -d eventhub -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Vacuum and analyze (for performance)
psql -U eventhub_user -d eventhub -c "VACUUM ANALYZE;"
```

## 🔐 Security Best Practices

### 1. User Permissions

```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE eventhub TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Create backup user
CREATE USER backup_user WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE eventhub TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
```

### 2. Connection Security

```bash
# Use SSL connections in production
DATABASE_URL="postgresql://eventhub_user:password@localhost:5432/eventhub?sslmode=require"

# Restrict connections in pg_hba.conf
# Edit /etc/postgresql/14/main/pg_hba.conf
# Add specific IP restrictions
host    eventhub    eventhub_user    192.168.1.0/24    md5
```

### 3. Regular Security Tasks

```bash
# Update PostgreSQL regularly
sudo apt update && sudo apt upgrade postgresql

# Monitor failed login attempts
sudo tail -f /var/log/postgresql/postgresql-14-main.log | grep "authentication failed"

# Set up automated security updates (Ubuntu)
sudo apt install unattended-upgrades
```

This completes the comprehensive PostgreSQL setup guide for EventHub. The database is now ready to support your event management platform with proper structure, performance optimization, and security measures in place.
