import { createSupabaseClient } from './supabase';

export type SubscriptionPlan = 'FREE' | 'PRO';

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    maxProjects: 3,
    maxSnippetsPerProject: 50,
    features: [
      'Up to 3 projects',
      'Up to 50 snippets per project',
      'Public snippets only',
      'Basic code editor',
      'Tags and organization',
    ],
  },
  PRO: {
    name: 'Pro',
    maxProjects: Infinity,
    maxSnippetsPerProject: Infinity,
    features: [
      'Unlimited projects',
      'Unlimited snippets',
      'Private snippets',
      'Advanced Monaco editor',
      'AI-powered suggestions',
      'Priority support',
      'Export/Import data',
      'Collaboration features',
    ],
  },
} as const;

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionPlan;
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  projects: number;
  snippetsPerProject: Record<string, number>;
  totalSnippets: number;
}

class SubscriptionService {
  private supabase: ReturnType<typeof createSupabaseClient> | null = null;

  private getSupabase() {
    if (!this.supabase) {
      this.supabase = createSupabaseClient();
    }
    return this.supabase;
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user subscription:', error);
      return null;
    }

    return data;
  }

  async upsertUserSubscription(
    userId: string,
    planType: SubscriptionPlan = 'FREE'
  ): Promise<UserSubscription | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;
    
    const existingSubscription = await this.getUserSubscription(userId);

    if (existingSubscription) {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          plan_type: planType,
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
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_type: planType,
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

  async getUserPlan(userId: string): Promise<SubscriptionPlan> {
    const subscription = await this.getUserSubscription(userId);
    return subscription?.plan_type || 'FREE';
  }

  async canCreatePrivateSnippets(userId: string): Promise<boolean> {
    const plan = await this.getUserPlan(userId);
    return plan === 'PRO';
  }

  async getUserUsage(userId: string): Promise<UsageStats> {
    const supabase = this.getSupabase();
    if (!supabase) {
      return {
        projects: 0,
        snippetsPerProject: {},
        totalSnippets: 0,
      };
    }
    
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId);

    const projectCount = projects?.length || 0;

    const { data: snippets } = await supabase
      .from('snippets')
      .select('id, project_id')
      .eq('user_id', userId);

    const totalSnippets = snippets?.length || 0;
    const snippetsPerProject: Record<string, number> = {};

    snippets?.forEach(snippet => {
      const projectId = snippet.project_id || 'no-project';
      snippetsPerProject[projectId] = (snippetsPerProject[projectId] || 0) + 1;
    });

    return {
      projects: projectCount,
      snippetsPerProject,
      totalSnippets,
    };
  }

  async canCreateSnippet(userId: string, projectId?: string): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await this.getUserPlan(userId);
    const limits = SUBSCRIPTION_PLANS[plan];
    const usage = await this.getUserUsage(userId);

    if (usage.projects >= limits.maxProjects) {
      return {
        allowed: false,
        reason: `You've reached the maximum of ${limits.maxProjects} projects for the ${plan} plan.`,
      };
    }

    if (projectId && usage.snippetsPerProject[projectId] >= limits.maxSnippetsPerProject) {
      return {
        allowed: false,
        reason: `This project has reached the maximum of ${limits.maxSnippetsPerProject} snippets.`,
      };
    }

    return { allowed: true };
  }

  async canCreateProject(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await this.getUserPlan(userId);
    const limits = SUBSCRIPTION_PLANS[plan];
    const usage = await this.getUserUsage(userId);

    if (usage.projects >= limits.maxProjects) {
      return {
        allowed: false,
        reason: `You've reached the maximum of ${limits.maxProjects} projects for the ${plan} plan.`,
      };
    }

    return { allowed: true };
  }

  async upgradeToPro(userId: string): Promise<boolean> {
    const subscription = await this.upsertUserSubscription(userId, 'PRO');
    return subscription !== null;
  }

  async downgradeToFree(userId: string): Promise<boolean> {
    const subscription = await this.upsertUserSubscription(userId, 'FREE');
    return subscription !== null;
  }
}

const subscriptionService = new SubscriptionService();

export const getUserSubscription = (userId: string) => subscriptionService.getUserSubscription(userId);
export const getUserPlan = (userId: string) => subscriptionService.getUserPlan(userId);
export const canCreateSnippet = (userId: string, projectId?: string) => subscriptionService.canCreateSnippet(userId, projectId);
export const canCreateProject = (userId: string) => subscriptionService.canCreateProject(userId);
export const canCreatePrivateSnippets = (userId: string) => subscriptionService.canCreatePrivateSnippets(userId);
export const getUserUsage = (userId: string) => subscriptionService.getUserUsage(userId);
export const upgradeToPro = (userId: string) => subscriptionService.upgradeToPro(userId);
export const downgradeToFree = (userId: string) => subscriptionService.downgradeToFree(userId);
export const initializeUserSubscription = (userId: string) => subscriptionService.upsertUserSubscription(userId, 'FREE');

export default subscriptionService;
