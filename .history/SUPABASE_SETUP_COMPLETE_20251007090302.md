# 🚀 Complete Supabase + Prisma Integration Guide

## ✅ What We've Done So Far

1. ✅ **Installed dependencies**: `@supabase/supabase-js` and `prisma`
2. ✅ **Created environment template**: `.env.local`
3. ✅ **Updated Prisma schema**: Added `directUrl` for Supabase
4. ✅ **Created Supabase client**: `lib/supabase.ts`
5. ✅ **Updated Prisma client**: `src/lib/prisma.ts`
6. ✅ **Created database service**: `lib/database.ts`
7. ✅ **Created test API**: `app/api/events/test/route.ts`
8. ✅ **Generated Prisma client**

## 🔧 Next Steps (You Need to Do)

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Settings** → **API**
3. Copy these values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. Go to **Settings** → **Database**
5. Copy the **Connection string** (URI format):
   - `postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres`

### Step 2: Update Your .env.local

Replace the placeholders in your `.env.local` file:

```bash
# Database URLs (use the same connection string for both)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# NextAuth (generate a random 32+ character string)
NEXTAUTH_SECRET="your-super-secret-random-string-here-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"

# Application
APP_URL="http://localhost:3000"
```

### Step 3: Push Your Database Schema

```bash
# Push the schema to Supabase (creates all tables)
npx prisma db push

# Optional: Open Prisma Studio to view your database
npx prisma studio
```

### Step 4: Test Your Connection

```bash
# Start your development server
npm run dev

# Test the database connection
curl http://localhost:3000/api/events/test
```

### Step 5: Seed Sample Data (Optional)

```bash
# Add sample events and users
npm run db:seed
```

## 🧪 Testing Your Integration

### 1. Test Database Connection
```bash
curl http://localhost:3000/api/events/test
```

Expected response:
```json
{
  "success": true,
  "message": "Database connection successful!",
  "data": {
    "eventsCount": 0,
    "events": []
  }
}
```

### 2. Create a Test User (via Supabase Auth)
Visit your Supabase dashboard → Authentication → Users → Invite user

### 3. Create a Test Event
```bash
curl -X POST http://localhost:3000/api/events/test \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Event", "organizerId": "your-user-id"}'
```

## 📁 Key Files Created/Modified

```
eventhub-beta/
├── .env.local                    # Environment variables
├── lib/
│   ├── supabase.ts              # Supabase client
│   └── database.ts              # Database operations
├── src/lib/
│   └── prisma.ts                # Updated Prisma client
├── prisma/
│   └── schema.prisma            # Updated schema
├── app/api/events/
│   └── test/route.ts            # Test API endpoint
└── setup-database.sh            # Setup script
```

## 🛠️ Available Database Operations

The `DatabaseService` class provides:

- **Events**: Create, read, filter, search
- **Users**: Create, authenticate, manage points
- **Transactions**: Create, update status, track payments
- **Points**: Add, use, track expiration

## 🚨 Troubleshooting

### "Connection refused"
- Check your DATABASE_URL is correct
- Ensure Supabase project is running
- Verify your password in the connection string

### "Table doesn't exist"
- Run `npx prisma db push` to create tables
- Check Supabase dashboard → Database → Tables

### "Invalid API key"
- Verify your SUPABASE_ANON_KEY is correct
- Check the key isn't expired
- Ensure no extra spaces/characters

### Type errors
- Run `npx prisma generate` after schema changes
- Restart your development server
- Clear Next.js cache: `rm -rf .next`

## 🎉 What's Next?

1. **Connect your frontend**: Update your existing components to use the database
2. **Implement authentication**: Use Supabase Auth or NextAuth
3. **Add file storage**: Use Supabase Storage for event images
4. **Set up real-time**: Use Supabase subscriptions for live updates
5. **Deploy**: Deploy to Vercel with Supabase

Need help? Check the Supabase docs: https://supabase.com/docs
