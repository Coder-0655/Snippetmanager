-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    name text NOT NULL,
    description text,
    color text NOT NULL DEFAULT '#3B82F6',
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_projects_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_user_id_created_at ON projects(user_id, created_at);

-- Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT NOW()
);

-- Add index for tags
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Insert some default tags if they don't exist
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
    ('database')
ON CONFLICT (name) DO NOTHING;

-- Update snippets table to properly reference projects if needed
-- This should already exist but let's make sure the foreign key constraint is there
DO $$
BEGIN
    -- Add foreign key constraint for project_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_snippets_project_id' 
        AND table_name = 'snippets'
    ) THEN
        ALTER TABLE snippets 
        ADD CONSTRAINT fk_snippets_project_id 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE SET NULL;
    END IF;
END
$$;

-- Add index for snippets project_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_snippets_project_id ON snippets(project_id);