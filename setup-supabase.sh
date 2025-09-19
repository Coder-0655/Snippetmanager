#!/bin/bash

# Script to execute Supabase schema
# Replace the variables below with your actual Supabase credentials

echo "🚀 Supabase Schema Execution Script"
echo "=================================="
echo ""

# Method 1: Using Supabase CLI (recommended)
echo "Method 1: Using Supabase CLI"
echo "----------------------------"
echo "1. Get your project reference from Supabase dashboard"
echo "2. Run: supabase link --project-ref YOUR_PROJECT_REF"
echo "3. Run: supabase db push"
echo ""

# Method 2: Using psql directly
echo "Method 2: Using psql directly"
echo "-----------------------------"
echo "1. Get your database URL from Supabase Settings > Database"
echo "2. Run: psql 'postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres' -f supabase-schema.sql"
echo ""

# Method 3: Copy and paste in Supabase SQL Editor
echo "Method 3: Using Supabase SQL Editor (easiest)"
echo "----------------------------------------------"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy the contents of supabase-schema.sql"
echo "4. Paste and run in the SQL Editor"
echo ""

# Check if .env.local exists to show project info
if [ -f ".env.local" ]; then
    echo "📋 Found .env.local - your Supabase URL:"
    grep "NEXT_PUBLIC_SUPABASE_URL" .env.local || echo "No Supabase URL found in .env.local"
else
    echo "⚠️  No .env.local found. You'll need your Supabase credentials."
fi

echo ""
echo "📄 Schema file location: ./supabase-schema.sql"
echo "📊 Schema contains:"
echo "   - User profiles table"
echo "   - Snippets table with RLS policies" 
echo "   - Tags table and auto-updating functions"
echo "   - Triggers for user registration and timestamp updates"
echo "   - Performance indexes"