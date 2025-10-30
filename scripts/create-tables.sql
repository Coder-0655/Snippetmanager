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

-- 9. Add is_public column to snippets table for community sharing
DO $$
BEGIN
    -- Check if is_public column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'snippets' 
        AND column_name = 'is_public'
    ) THEN
        -- Add the is_public column
        ALTER TABLE snippets 
        ADD COLUMN is_public boolean DEFAULT false;
    END IF;
END
$$;

-- 10. Create community table for public snippets
CREATE TABLE IF NOT EXISTS community (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    snippet_id uuid NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    code text NOT NULL,
    language text NOT NULL DEFAULT 'javascript',
    tags text[] DEFAULT '{}',
    description text,
    project_id uuid,
    likes_count integer DEFAULT 0,
    views_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    
    -- Foreign key to original snippet
    CONSTRAINT fk_community_snippet_id 
        FOREIGN KEY (snippet_id) 
        REFERENCES snippets(id) 
        ON DELETE CASCADE,
        
    -- Foreign key to project (optional)
    CONSTRAINT fk_community_project_id 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE SET NULL,
        
    -- Ensure unique snippet per user in community
    CONSTRAINT unique_snippet_user 
        UNIQUE (snippet_id, user_id)
);

-- 11. Create indexes for community table
CREATE INDEX IF NOT EXISTS idx_community_user_id ON community(user_id);
CREATE INDEX IF NOT EXISTS idx_community_snippet_id ON community(snippet_id);
CREATE INDEX IF NOT EXISTS idx_community_created_at ON community(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_likes_count ON community(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_views_count ON community(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_language ON community(language);
CREATE INDEX IF NOT EXISTS idx_community_tags ON community USING GIN(tags);

-- 12. Create community_likes table for tracking user likes
CREATE TABLE IF NOT EXISTS community_likes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id uuid NOT NULL,
    user_id text NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    
    -- Foreign key to community
    CONSTRAINT fk_community_likes_community_id 
        FOREIGN KEY (community_id) 
        REFERENCES community(id) 
        ON DELETE CASCADE,
        
    -- Ensure user can only like once per snippet
    CONSTRAINT unique_user_like 
        UNIQUE (community_id, user_id)
);

-- 13. Create indexes for community_likes table
CREATE INDEX IF NOT EXISTS idx_community_likes_community_id ON community_likes(community_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON community_likes(user_id);

-- 14. Add index for snippets is_public column
CREATE INDEX IF NOT EXISTS idx_snippets_is_public ON snippets(is_public);

-- 15. Add media fields to snippets table for images and videos
DO $$
BEGIN
    -- Check if media_urls column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'snippets' 
        AND column_name = 'media_urls'
    ) THEN
        -- Add the media_urls column (array of URLs)
        ALTER TABLE snippets 
        ADD COLUMN media_urls text[] DEFAULT '{}';
    END IF;
    
    -- Check if media_types column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'snippets' 
        AND column_name = 'media_types'
    ) THEN
        -- Add the media_types column (array of types: 'image' or 'video')
        ALTER TABLE snippets 
        ADD COLUMN media_types text[] DEFAULT '{}';
    END IF;
END
$$;

-- 16. Add indexes for media fields
CREATE INDEX IF NOT EXISTS idx_snippets_media_urls ON snippets USING gin(media_urls);
CREATE INDEX IF NOT EXISTS idx_snippets_media_types ON snippets USING gin(media_types);

-- ============================================
-- END OF MANUAL SQL SCRIPT
-- ============================================

-- 17. Verify table creation (optional - run separately to check)
-- SELECT 'projects' as table_name, count(*) as row_count FROM projects
-- UNION ALL
-- SELECT 'tags' as table_name, count(*) as row_count FROM tags
-- UNION ALL 
-- SELECT 'snippets' as table_name, count(*) as row_count FROM snippets
-- UNION ALL 
-- SELECT 'community' as table_name, count(*) as row_count FROM community;