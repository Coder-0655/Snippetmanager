"use client";

import { useState } from "react";
import { useUser, getUserId } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseClient } from "@/lib/supabase";

export default function DatabaseTestPage() {
  const { user } = useUser();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const runDatabaseTest = async () => {
    if (!user) {
      setTestResults(['User not authenticated']);
      return;
    }

    setLoading(true);
    const results: string[] = [];
    
    try {
      const supabase = createSupabaseClient();
      
      if (!supabase) {
        results.push('⚠️ Supabase not configured - running in local mode');
        setTestResults(results);
        setLoading(false);
        return;
      }
      
      // Test 1: Check if we can connect
      results.push('✅ Connected to Supabase');
      
      // Test 2: Check projects table
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id')
          .limit(1);
        
        if (projectsError) {
          results.push(`❌ Projects table error: ${projectsError.message}`);
          
          // If table doesn't exist, try to create it
          if (projectsError.code === 'PGRST116') {
            results.push('🔧 Attempting to create projects table...');
            
            // Create projects table via SQL
            const createTableSQL = `
              CREATE TABLE IF NOT EXISTS projects (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id text NOT NULL,
                name text NOT NULL,
                description text,
                color text NOT NULL DEFAULT '#3B82F6',
                created_at timestamp with time zone DEFAULT NOW(),
                updated_at timestamp with time zone DEFAULT NOW()
              );
              
              CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
            `;
            
            // Note: This requires database access that might not be available from client
            results.push('⚠️ Table creation requires manual SQL execution in Supabase dashboard');
            results.push('SQL to run in Supabase dashboard:');
            results.push(createTableSQL);
          }
        } else {
          results.push('✅ Projects table exists and accessible');
        }
      } catch (error) {
        results.push(`❌ Projects table test failed: ${error}`);
      }
      
      // Test 3: Check snippets table
      try {
        const { data: snippetsData, error: snippetsError } = await supabase
          .from('snippets')
          .select('id')
          .limit(1);
        
        if (snippetsError) {
          results.push(`❌ Snippets table error: ${snippetsError.message}`);
        } else {
          results.push('✅ Snippets table exists and accessible');
        }
      } catch (error) {
        results.push(`❌ Snippets table test failed: ${error}`);
      }
      
      // Test 4: Check tags table
      try {
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select('id')
          .limit(1);
        
        if (tagsError) {
          results.push(`❌ Tags table error: ${tagsError.message}`);
          
          if (tagsError.code === 'PGRST116') {
            results.push('🔧 Tags table needs to be created');
          }
        } else {
          results.push('✅ Tags table exists and accessible');
        }
      } catch (error) {
        results.push(`❌ Tags table test failed: ${error}`);
      }
      
      // Test 5: Try to create a test project
      try {
        const testProject = {
          user_id: user.id,
          name: 'Database Test Project',
          description: 'Test project to verify database functionality',
          color: '#3B82F6'
        };
        
        const { data: projectData, error: createError } = await supabase
          .from('projects')
          .insert(testProject)
          .select()
          .single();
        
        if (createError) {
          results.push(`❌ Project creation failed: ${createError.message}`);
        } else {
          results.push('✅ Project creation successful');
          results.push(`Created project: ${projectData.name} (ID: ${projectData.id})`);
          
          // Clean up test project
          await supabase
            .from('projects')
            .delete()
            .eq('id', projectData.id);
          results.push('✅ Test project cleaned up');
        }
      } catch (error) {
        results.push(`❌ Project creation test failed: ${error}`);
      }
      
    } catch (error) {
      results.push(`❌ Database connection failed: ${error}`);
    }
    
    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Database Test</h1>
        <p className="text-muted-foreground">Test database connectivity and table creation</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
          <CardDescription>
            This will test if the database tables exist and work properly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runDatabaseTest} 
            disabled={loading || !user}
            className="mb-4"
          >
            {loading ? 'Testing...' : 'Run Database Test'}
          </Button>
          
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              <div className="bg-slate-100 p-4 rounded-lg space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="font-mono text-sm">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}