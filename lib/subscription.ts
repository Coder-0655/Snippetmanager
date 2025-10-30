import { createSupabaseClient } from './supabase';

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Plan',
    description: 'Perfect for getting started',
    price: 0,
    maxProjects: 3,
    maxSnippetsPerProject: 10,
    features: [
      'Up to 3 projects',
      '10 snippets per project',
      'Basic search functionality',
      'Tag organization',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro Plan',
    description: 'For power users and teams',
    price: 10, // $10/month (not actively used, for display only)
    maxProjects: -1, // -1 means unlimited
    maxSnippetsPerProject: -1, // -1 means unlimited
    features: [
      'Unlimited projects',
      'Unlimited snippets',
      'Advanced search & filtering',
      'Export/Import capabilities',
      'Analytics dashboard',
      'Priority support',
    ],
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

// Helper function to get user's plan limits
export function getPlanLimits(plan: SubscriptionPlan = 'FREE') {
  return SUBSCRIPTION_PLANS[plan];
}

// Helper function to check if usage is within limits
export function isWithinLimits(
  currentUsage: { projects: number; snippetsPerProject: Record<string, number> },
  plan: SubscriptionPlan = 'FREE'
) {
  const limits = getPlanLimits(plan);
  
  // Check project limit
  if (limits.maxProjects !== -1 && currentUsage.projects >= limits.maxProjects) {
    return {
      valid: false,
      reason: `Project limit reached. You can create up to ${limits.maxProjects} projects on the ${limits.name}.`,
      type: 'projects' as const,
    };
  }
  
  // Check snippets per project limit
  if (limits.maxSnippetsPerProject !== -1) {
    for (const [projectId, snippetCount] of Object.entries(currentUsage.snippetsPerProject)) {
      if (snippetCount >= limits.maxSnippetsPerProject) {
        return {
          valid: false,
          reason: `Snippet limit reached for this project. You can create up to ${limits.maxSnippetsPerProject} snippets per project on the ${limits.name}.`,
          type: 'snippets' as const,
          projectId,
        };
      }
    }
  }
  
  return { valid: true };
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionPlan;
  status: 'active' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  projects: number;
  snippetsPerProject: Record<string, number>;
  totalSnippets: number;
}

class SubscriptionService {
  private supabase = createSupabaseClient();

  // Get user's subscription info
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching user subscription:', error);
      return null;
    }

    return data;
  }

  // Create or update user subscription
  async upsertUserSubscription(
    userId: string,
    subscriptionData: Partial<UserSubscription>
  ): Promise<UserSubscription | null> {
    const existingSubscription = await this.getUserSubscription(userId);

    if (existingSubscription) {
      // Update existing subscription
      const { data, error } = await this.supabase
        .from('user_subscriptions')
        .update({
          ...subscriptionData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user subscription:', error);
        return null;
      }

      return data;
    } else {
      // Create new subscription
      const { data, error } = await this.supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_type: 'FREE',
          status: 'active',
          ...subscriptionData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user subscription:', error);
        return null;
      }

      return data;
    }
  }

  // Get user's current plan type
  async getUserPlan(userId: string): Promise<SubscriptionPlan> {
    const subscription = await this.getUserSubscription(userId);
    return subscription?.plan_type || 'FREE';
  }

  // Check if user can create private snippets (PRO feature)
  async canCreatePrivateSnippets(userId: string): Promise<boolean> {
    const plan = await this.getUserPlan(userId);
    return plan === 'PRO';
  }

  // Get user's usage statistics
  async getUserUsage(userId: string): Promise<UsageStats> {
    try {
      // Get project count
      const { data: projects, error: projectsError } = await this.supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return { projects: 0, snippetsPerProject: {}, totalSnippets: 0 };
      }

      const projectCount = projects?.length || 0;
      const projectIds = projects?.map(p => p.id) || [];

      // Get snippets count per project
      const snippetsPerProject: Record<string, number> = {};
      let totalSnippets = 0;

      if (projectIds.length > 0) {
        const { data: snippets, error: snippetsError } = await this.supabase
          .from('snippets')
          .select('project_id')
          .eq('user_id', userId);

        if (snippetsError) {
          console.error('Error fetching snippets:', snippetsError);
        } else if (snippets) {
          // Count snippets per project
          snippets.forEach(snippet => {
            const projectId = snippet.project_id || 'no-project';
            snippetsPerProject[projectId] = (snippetsPerProject[projectId] || 0) + 1;
            totalSnippets++;
          });
        }
      }

      return {
        projects: projectCount,
        snippetsPerProject,
        totalSnippets,
      };
    } catch (error) {
      console.error('Error getting user usage:', error);
      return { projects: 0, snippetsPerProject: {}, totalSnippets: 0 };
    }
  }

  // Check if user can create a new project
  async canCreateProject(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await this.getUserPlan(userId);
    const usage = await this.getUserUsage(userId);
    const limits = SUBSCRIPTION_PLANS[plan];

    if (limits.maxProjects === -1) {
      return { allowed: true }; // Unlimited
    }

    if (usage.projects >= limits.maxProjects) {
      return {
        allowed: false,
        reason: `You've reached the maximum of ${limits.maxProjects} projects on the ${limits.name}. Upgrade to Pro for unlimited projects.`,
      };
    }

    return { allowed: true };
  }

  // Check if user can create a new snippet in a project
  async canCreateSnippet(userId: string, projectId?: string): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await this.getUserPlan(userId);
    const usage = await this.getUserUsage(userId);
    const limits = SUBSCRIPTION_PLANS[plan];

    if (limits.maxSnippetsPerProject === -1) {
      return { allowed: true }; // Unlimited
    }

    const targetProjectId = projectId || 'no-project';
    const currentSnippetsInProject = usage.snippetsPerProject[targetProjectId] || 0;

    if (currentSnippetsInProject >= limits.maxSnippetsPerProject) {
      return {
        allowed: false,
        reason: `You've reached the maximum of ${limits.maxSnippetsPerProject} snippets per project on the ${limits.name}. Upgrade to Pro for unlimited snippets.`,
      };
    }

    return { allowed: true };
  }

  // Initialize subscription for new user
  async initializeUserSubscription(userId: string): Promise<UserSubscription | null> {
    return await this.upsertUserSubscription(userId, {
      plan_type: 'FREE',
      status: 'active',
    });
  }
}

// Create singleton instance
const subscriptionService = new SubscriptionService();

// Export functions for easy use
export const getUserSubscription = (userId: string) => subscriptionService.getUserSubscription(userId);
export const getUserPlan = (userId: string) => subscriptionService.getUserPlan(userId);
export const canCreatePrivateSnippets = (userId: string) => subscriptionService.canCreatePrivateSnippets(userId);
export const getUserUsage = (userId: string) => subscriptionService.getUserUsage(userId);
export const canCreateProject = (userId: string) => subscriptionService.canCreateProject(userId);
export const canCreateSnippet = (userId: string, projectId?: string) => subscriptionService.canCreateSnippet(userId, projectId);
export const initializeUserSubscription = (userId: string) => subscriptionService.initializeUserSubscription(userId);

export default subscriptionService;