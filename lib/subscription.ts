import { createSupabaseClient } from './supabase';
import { SubscriptionPlan, SUBSCRIPTION_PLANS, stripe } from './stripe';

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_type: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
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

  // Handle Stripe webhook events
  async handleStripeWebhook(
    eventType: string,
    subscriptionId: string,
    customerId: string,
    data: any
  ): Promise<void> {
    try {
      switch (eventType) {
        case 'customer.subscription.link':
          await this.handleSubscriptionLink(subscriptionId, customerId, data);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(subscriptionId, customerId, data);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(subscriptionId);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(subscriptionId);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(subscriptionId);
          break;
        default:
          console.log(`Unhandled webhook event: ${eventType}`);
      }
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      throw error;
    }
  }

  private async handleSubscriptionLink(
    subscriptionId: string,
    customerId: string,
    data: any
  ): Promise<void> {
    const { userId } = data;
    if (!userId) {
      console.error('No userId provided for subscription link');
      return;
    }

    // Create or update the user subscription with customer ID
    await this.upsertUserSubscription(userId, {
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    });
  }

  private async handleSubscriptionUpdated(
    subscriptionId: string,
    customerId: string,
    data: any
  ): Promise<void> {
    // First try to find user by customer ID
    let { data: existingSubscription } = await this.supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    // If not found by customer ID, try to find by subscription ID
    if (!existingSubscription) {
      const { data: subscriptionBySubId } = await this.supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();
      
      existingSubscription = subscriptionBySubId;
    }

    // If still not found, we need to get the user ID from the checkout session metadata
    if (!existingSubscription) {
      try {
        // Get the subscription from Stripe to find the latest invoice
        if (stripe) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          if (subscription.latest_invoice) {
            const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
            // Try to find the user through the invoice or other means
            // This is a fallback - ideally the customer should already be linked
            console.log('Invoice details for orphaned subscription:', {
              subscriptionId,
              customerId,
              invoiceId: invoice.id
            });
          }
        }
      } catch (error) {
        console.error('Could not retrieve subscription details:', error);
      }
      
      console.error('No user found for customer ID or subscription ID:', { customerId, subscriptionId });
      return;
    }

    // Determine plan type from price ID
    const priceId = data.items?.data?.[0]?.price?.id;
    const planType = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'PRO' : 'FREE';

    await this.upsertUserSubscription(existingSubscription.user_id, {
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      plan_type: planType,
      status: data.status,
      current_period_start: new Date(data.current_period_start * 1000).toISOString(),
      current_period_end: new Date(data.current_period_end * 1000).toISOString(),
      cancel_at_period_end: data.cancel_at_period_end,
    });
  }

  private async handleSubscriptionCanceled(subscriptionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        plan_type: 'FREE',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Error updating canceled subscription:', error);
    }
  }

  private async handlePaymentSucceeded(subscriptionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Error updating subscription after payment success:', error);
    }
  }

  private async handlePaymentFailed(subscriptionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Error updating subscription after payment failure:', error);
    }
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
export const handleStripeWebhook = (eventType: string, subscriptionId: string, customerId: string, data: any) => 
  subscriptionService.handleStripeWebhook(eventType, subscriptionId, customerId, data);

export default subscriptionService;