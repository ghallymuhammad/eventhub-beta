#!/bin/bash

echo "🚀 EventHub Database Setup Script"
echo "=================================="
echo ""

echo "📋 Prerequisites:"
echo "1. ✅ Supabase project created"
echo "2. ✅ Database credentials ready"
echo "3. ✅ .env.local file updated"
echo ""

echo "🔧 Step 1: Generate Prisma Client"
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

echo "🔧 Step 2: Check database connection"
echo "Testing connection to Supabase..."
echo "⚠️  Make sure your .env.local is configured with:"
echo "   - DATABASE_URL"
echo "   - DIRECT_URL" 
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""

echo "🔧 Step 3: Push schema to database"
echo "This will create all tables in your Supabase database..."
read -p "Press Enter to continue or Ctrl+C to cancel..."

npx prisma db push
echo "✅ Database schema pushed"
echo ""

echo "🔧 Step 4: Seed initial data (optional)"
echo "This will add sample events and users..."
read -p "Do you want to seed sample data? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:seed
    echo "✅ Sample data seeded"
else
    echo "⏭️  Skipping seed data"
fi
echo ""

echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Start your development server: npm run dev"
echo "2. Visit http://localhost:3000"
echo "3. Check Supabase dashboard for your tables"
echo ""
echo "🔗 Useful commands:"
echo "- View database in browser: npx prisma studio"
echo "- Reset database: npx prisma db push --force-reset"
echo "- Generate client after schema changes: npx prisma generate"
