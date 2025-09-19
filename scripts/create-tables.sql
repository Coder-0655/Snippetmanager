-- ============================================
-- MANUAL SQL SCRIPT FOR SUPABASE DASHBOARD
-- ============================================
-- Run this SQL in your Supabase Dashboard under SQL Editor
-- This will create the missing projects and tags tables

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    name text NOT NULL,
    description text,
    color text NOT NULL DEFAULT '#3B82F6',
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 2. Create indexes for projects table
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_user_id_created_at ON projects(user_id, created_at);

-- 3. Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT NOW()
);

-- 4. Create index for tags table
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- 5. Insert default tags
INSERT INTO tags (name) VALUES 
    ('javascript'),
    ('typescript'),
    ('react'),
    ('node'),
    ('python'),
    ('css'),
    ('html'),
    ('sql'),
    ('api'),
    ('utility'),
    ('component'),
    ('hook'),
    ('function'),
    ('algorithm'),
    ('database'),
    ('frontend'),
    ('backend'),
    ('fullstack'),
    ('mobile'),
    ('web'),
    ('library'),
    ('framework'),
    ('tool'),
    ('snippet'),
    ('example')
ON CONFLICT (name) DO NOTHING;

-- 6. Add project_id column to snippets table if it doesn't exist
DO $$
BEGIN
    -- Check if project_id column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'snippets' 
        AND column_name = 'project_id'
    ) THEN
        -- Add the project_id column
        ALTER TABLE snippets 
        ADD COLUMN project_id uuid;
    END IF;
END
$$;

-- 7. Add foreign key constraint to snippets table for project_id (if not exists)
DO $$
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_snippets_project_id' 
        AND table_name = 'snippets'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE snippets 
        ADD CONSTRAINT fk_snippets_project_id 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE SET NULL;
    END IF;
END
$$;

-- 8. Add index for snippets project_id
CREATE INDEX IF NOT EXISTS idx_snippets_project_id ON snippets(project_id);

-- 9. Verify table creation (optional - run separately to check)
-- SELECT 'projects' as table_name, count(*) as row_count FROM projects
-- UNION ALL
-- SELECT 'tags' as table_name, count(*) as row_count FROM tags
-- UNION ALL 
-- SELECT 'snippets' as table_name, count(*) as row_count FROM snippets;