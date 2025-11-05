/**
 * Test script to verify subscription limits are working correctly
 * Run this script to test the subscription system functionality
 */

import { createSupabaseClient } from '../lib/supabase';
import { canCreateProject, canCreateSnippet, getUserUsage, getUserPlan } from '../lib/subscription';

// Test user ID - replace with a real user ID from your database
const TEST_USER_ID = 'test-user-id';

async function testSubscriptionLimits() {
  console.log('🧪 Testing Subscription Limits System...\n');

  try {
    // Test 1: Check user's current plan
    console.log('1️⃣ Checking user plan...');
    const plan = await getUserPlan(TEST_USER_ID);
    console.log(`   Current plan: ${plan}\n`);

    // Test 2: Check user's current usage
    console.log('2️⃣ Checking user usage...');
    const usage = await getUserUsage(TEST_USER_ID);
    console.log(`   Projects: ${usage.projects}`);
    console.log(`   Snippets per project:`, usage.snippetsPerProject);
    console.log(`   Total snippets: ${usage.totalSnippets}\n`);

    // Test 3: Check if user can create a project
    console.log('3️⃣ Checking project creation limits...');
    const canProject = await canCreateProject(TEST_USER_ID);
    console.log(`   Can create project: ${canProject.allowed}`);
    if (!canProject.allowed) {
      console.log(`   Reason: ${canProject.reason}`);
    }
    console.log();

    // Test 4: Check if user can create a snippet
    console.log('4️⃣ Checking snippet creation limits...');
    const canSnippet = await canCreateSnippet(TEST_USER_ID);
    console.log(`   Can create snippet: ${canSnippet.allowed}`);
    if (!canSnippet.allowed) {
      console.log(`   Reason: ${canSnippet.reason}`);
    }
    console.log();

    // Test 5: Test project-specific snippet limits
    if (Object.keys(usage.snippetsPerProject).length > 0) {
      const projectId = Object.keys(usage.snippetsPerProject)[0];
      console.log('5️⃣ Checking project-specific snippet limits...');
      const canSnippetInProject = await canCreateSnippet(TEST_USER_ID, projectId);
      console.log(`   Can create snippet in project ${projectId}: ${canSnippetInProject.allowed}`);
      if (!canSnippetInProject.allowed) {
        console.log(`   Reason: ${canSnippetInProject.reason}`);
      }
      console.log();
    }

    console.log('✅ Subscription limits test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing subscription limits:', error);
  }
}

// Helper function to create test data
async function createTestData() {
  console.log('🔧 Creating test data...\n');
  
  const supabase = createSupabaseClient();
  
  if (!supabase) {
    console.error('Supabase not configured');
    return;
  }
  
  try {
    // Create test user subscription
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: TEST_USER_ID,
        plan_type: 'FREE',
        status: 'active',
      });

    if (subError) {
      console.error('Error creating test subscription:', subError);
      return;
    }

    // Create some test projects
    for (let i = 1; i <= 2; i++) {
      const { error: projectError } = await supabase
        .from('projects')
        .upsert({
          user_id: TEST_USER_ID,
          name: `Test Project ${i}`,
          description: `Test project ${i} for subscription testing`,
          color: '#3B82F6',
        });

      if (projectError) {
        console.error(`Error creating test project ${i}:`, projectError);
      }
    }

    console.log('✅ Test data created successfully!\n');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

// Usage instructions
function printUsageInstructions() {
  console.log('📋 How to use this test script:\n');
  console.log('1. Replace TEST_USER_ID with a real user ID from your database');
  console.log('2. Make sure your .env.local file has the correct database credentials');
  console.log('3. Run: npx tsx scripts/test-subscription-limits.ts');
  console.log('4. Check the output to verify subscription limits are working\n');
  console.log('💡 To create test data, uncomment the createTestData() call below\n');
}

// Main execution
if (require.main === module) {
  printUsageInstructions();
  
  // Uncomment the line below to create test data first
  // createTestData();
  
  // Run the actual test
  testSubscriptionLimits();
}

export { testSubscriptionLimits, createTestData };