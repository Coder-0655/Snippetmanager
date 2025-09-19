-- Create users table for Clerk integration
CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    email text NOT NULL,
    name text,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Update snippets table to work with Clerk text IDs
DO $$
BEGIN
    -- Check if snippets table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'snippets') THEN
        -- Temporarily disable RLS and drop policies
        ALTER TABLE snippets DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view own snippets" ON snippets;
        DROP POLICY IF EXISTS "Users can insert own snippets" ON snippets;
        DROP POLICY IF EXISTS "Users can update own snippets" ON snippets;
        DROP POLICY IF EXISTS "Users can delete own snippets" ON snippets;
        
        -- Drop ALL foreign key constraints on snippets table
        DO $nested$
        DECLARE 
            constraint_name text;
        BEGIN
            FOR constraint_name IN 
                SELECT conname FROM pg_constraint 
                WHERE conrelid = 'snippets'::regclass AND contype = 'f'
            LOOP
                EXECUTE 'ALTER TABLE snippets DROP CONSTRAINT IF EXISTS ' || constraint_name;
            END LOOP;
        END
        $nested$;
        
        -- Change user_id column from UUID to TEXT
        ALTER TABLE snippets ALTER COLUMN user_id TYPE text;
        
        -- Add the foreign key constraint
        ALTER TABLE snippets 
        ADD CONSTRAINT fk_snippets_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE;
        
        -- Re-enable RLS and recreate policies for Clerk JWT
        ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;
        
        -- Note: These policies won't work with Clerk directly since Clerk doesn't use Supabase auth
        -- Instead, we'll handle authorization in the application layer
        -- Disable RLS for now since we're using Clerk
        ALTER TABLE snippets DISABLE ROW LEVEL SECURITY;
    END IF;
END
$$;