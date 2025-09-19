// Database setup utility to create missing tables
import { createSupabaseClient } from './supabase';

export async function setupDatabase() {
  const supabase = createSupabaseClient();
  
  try {
    console.log('Setting up database tables...');
    
    // Create projects table
    const projectsTableSQL = `
      CREATE TABLE IF NOT EXISTS projects (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id text NOT NULL,
        name text NOT NULL,
        description text,
        color text NOT NULL DEFAULT '#3B82F6',
        created_at timestamp with time zone DEFAULT NOW(),
        updated_at timestamp with time zone DEFAULT NOW()
      );
    `;
    
    // Create indexes
    const projectsIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
      CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
    `;
    
    // Create tags table
    const tagsTableSQL = `
      CREATE TABLE IF NOT EXISTS tags (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        name text NOT NULL UNIQUE,
        created_at timestamp with time zone DEFAULT NOW()
      );
    `;
    
    // Insert default tags
    const defaultTags = [
      'javascript', 'typescript', 'react', 'node', 'python', 
      'css', 'html', 'sql', 'api', 'utility', 'component', 
      'hook', 'function', 'algorithm', 'database'
    ];
    
    // Execute table creation
    const { error: projectsError } = await supabase.rpc('exec_sql', { 
      sql: projectsTableSQL 
    });
    
    if (projectsError) {
      console.error('Error creating projects table:', projectsError);
    } else {
      console.log('Projects table created successfully');
    }
    
    // Execute indexes
    const { error: indexError } = await supabase.rpc('exec_sql', { 
      sql: projectsIndexSQL 
    });
    
    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('Indexes created successfully');
    }
    
    // Create tags table
    const { error: tagsError } = await supabase.rpc('exec_sql', { 
      sql: tagsTableSQL 
    });
    
    if (tagsError) {
      console.error('Error creating tags table:', tagsError);
    } else {
      console.log('Tags table created successfully');
    }
    
    // Insert default tags
    for (const tag of defaultTags) {
      const { error } = await supabase
        .from('tags')
        .upsert({ name: tag }, { onConflict: 'name' });
      
      if (error) {
        console.error(`Error inserting tag ${tag}:`, error);
      }
    }
    
    console.log('Database setup completed');
    return true;
    
  } catch (error) {
    console.error('Database setup failed:', error);
    return false;
  }
}

// Function to test project creation
export async function testProjectCreation(userId: string) {
  const supabase = createSupabaseClient();
  
  try {
    const testProject = {
      user_id: userId,
      name: 'Test Project',
      description: 'A test project to verify database functionality',
      color: '#3B82F6'
    };
    
    const { data, error } = await supabase
      .from('projects')
      .insert(testProject)
      .select()
      .single();
    
    if (error) {
      console.error('Test project creation failed:', error);
      return null;
    }
    
    console.log('Test project created successfully:', data);
    return data;
    
  } catch (error) {
    console.error('Test project creation error:', error);
    return null;
  }
}