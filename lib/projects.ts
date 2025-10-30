import { createSupabaseClient } from './supabase';
import { Database } from './supabase';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

const PROJECT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export function getRandomProjectColor(): string {
  return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
}

export async function createProject(
  userId: string,
  project: Omit<ProjectInsert, 'user_id'>
): Promise<Project | null> {
  const supabase = createSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...project,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      
      // If table doesn't exist, provide helpful error message
      if (error.code === 'PGRST116') {
        throw new Error('Projects table does not exist. Please run the setup SQL script in your Supabase dashboard.');
      }
      
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function getProjects(userId: string): Promise<Project[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data || [];
}

export async function getProject(id: string, userId: string): Promise<Project | null> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return data;
}

export async function updateProject(
  id: string,
  userId: string,
  updates: ProjectUpdate
): Promise<Project | null> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    return null;
  }

  return data;
}

export async function deleteProject(id: string, userId: string): Promise<boolean> {
  const supabase = createSupabaseClient();
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }

  return true;
}

export async function getProjectStats(userId: string): Promise<{
  totalProjects: number;
  snippetsPerProject: { [projectId: string]: number };
}> {
  const supabase = createSupabaseClient();
  
  // Get total projects
  const { count: totalProjects, error: projectError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (projectError) {
    console.error('Error fetching project count:', projectError);
    return { totalProjects: 0, snippetsPerProject: {} };
  }

  // Get snippets count per project
  const { data: snippets, error: snippetError } = await supabase
    .from('snippets')
    .select('project_id')
    .eq('user_id', userId)
    .not('project_id', 'is', null);

  if (snippetError) {
    console.error('Error fetching snippet counts:', snippetError);
    return { totalProjects: totalProjects || 0, snippetsPerProject: {} };
  }

  const snippetsPerProject: { [projectId: string]: number } = {};
  snippets?.forEach((snippet: { project_id: string | null }) => {
    if (snippet.project_id) {
      snippetsPerProject[snippet.project_id] = (snippetsPerProject[snippet.project_id] || 0) + 1;
    }
  });

  return {
    totalProjects: totalProjects || 0,
    snippetsPerProject,
  };
}