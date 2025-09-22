import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance - only initialize on server
export const stripe = typeof window === 'undefined' 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
    })
  : null;

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

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
    price: 10, // $10/month
    priceId: process.env.STRIPE_PRO_PRICE_ID!, // Will be set when creating price in Stripe
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

// Generate Stripe checkout session URL
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
    customer_email: undefined, // Will be filled by Clerk user data
  });
  
  return session.url;
}

// Handle subscription status changes
export async function handleSubscriptionChange(
  subscriptionId: string,
  customerId: string,
  status: string,
  priceId?: string
) {
  // This will be implemented when we create the database schema
  console.log('Subscription change:', { subscriptionId, customerId, status, priceId });
  
  // TODO: Update user subscription in database
  // - Find user by Stripe customer ID
  // - Update subscription status
  // - Update plan type based on price ID
  // - Set subscription start/end dates
}