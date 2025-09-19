# Database Setup Guide

## Missing Projects Table Issue

The application requires a `projects` table that may not exist in your Supabase database. Follow these steps to set it up:

## Step 1: Run SQL Script in Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project
3. Go to **SQL Editor** in the left sidebar
4. Copy and paste the entire contents of `/scripts/create-tables.sql`
5. Click **Run** to execute the script

## Step 2: Verify Tables Created

After running the script, you can verify the tables exist by running this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('projects', 'tags', 'snippets');
```

You should see all three tables listed.

## Step 3: Test Project Creation

1. Navigate to `/dashboard/projects` in your application
2. Click **New Project**
3. Fill in the form and save
4. The project should be created and displayed in the list

## Alternative: Database Test Page

Visit `/dashboard/database-test` to run automated tests and get detailed diagnostics about your database setup.

## What the Script Creates

### Projects Table
- `id`: UUID primary key
- `user_id`: Text field linking to user
- `name`: Project name
- `description`: Optional project description
- `color`: Project color for UI
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Tags Table
- `id`: UUID primary key  
- `name`: Unique tag name
- `created_at`: Timestamp

### Default Tags
The script also inserts common programming tags like 'javascript', 'react', 'python', etc.

### Indexes
- Performance indexes on commonly queried fields
- Foreign key constraints for data integrity

## Common Issues

### Authentication Error
If you get "failed SASL auth" error when using `npx supabase db push`, run the SQL manually in the dashboard instead.

### Table Already Exists
The script uses `IF NOT EXISTS` clauses, so it's safe to run multiple times.

### Missing Permissions
Ensure your Supabase project has the necessary permissions to create tables and indexes.

## Verification

After setup, your projects page should:
1. Load without errors
2. Allow creating new projects
3. Display created projects in a grid
4. Allow editing and deleting projects
5. Show project statistics

## Need Help?

If you encounter issues, check the browser console for detailed error messages. The application will display helpful error messages if tables are missing.