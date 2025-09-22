"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Check, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  Folder,
  Code2,
  Zap
} from 'lucide-react';
import { SUBSCRIPTION_PLANS, getStripe } from '@/lib/stripe';

interface SubscriptionInfo {
  subscription: any;
  plan: 'FREE' | 'PRO';
  planDetails: typeof SUBSCRIPTION_PLANS.FREE | typeof SUBSCRIPTION_PLANS.PRO;
  usage: {
    projects: number;
    snippetsPerProject: Record<string, number>;
    totalSnippets: number;
  };
}

export function SubscriptionManager() {
  const { user } = useUser();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load subscription info
  useEffect(() => {
    if (user) {
      loadSubscriptionInfo();
    }
  }, [user]);

  const loadSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/subscription');
      
      if (!response.ok) {
        throw new Error('Failed to load subscription info');
      }
      
      const data = await response.json();
      setSubscriptionInfo(data);
    } catch (error) {
      console.error('Error loading subscription info:', error);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      setError(null);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      setError('Failed to start upgrade process. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading subscription info...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <Button onClick={loadSubscriptionInfo} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionInfo) {
    return null;
  }

  const { plan, planDetails, usage } = subscriptionInfo;
  const isPro = plan === 'PRO';

  // Calculate usage percentages
  const projectUsagePercent = planDetails.maxProjects === -1 
    ? 0 
    : (usage.projects / planDetails.maxProjects) * 100;

  const maxSnippetsInAnyProject = Math.max(
    ...Object.values(usage.snippetsPerProject), 
    0
  );
  const snippetUsagePercent = planDetails.maxSnippetsPerProject === -1 
    ? 0 
    : (maxSnippetsInAnyProject / planDetails.maxSnippetsPerProject) * 100;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isPro && <Crown className="h-5 w-5 text-yellow-500" />}
                Current Plan: {planDetails.name}
              </CardTitle>
              <CardDescription>
                {planDetails.description}
              </CardDescription>
            </div>
            <Badge variant={isPro ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {isPro ? '$10/month' : 'Free'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Project Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span className="text-sm font-medium">Projects</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.projects} / {planDetails.maxProjects === -1 ? '∞' : planDetails.maxProjects}
                </span>
              </div>
              {planDetails.maxProjects !== -1 && (
                <Progress value={projectUsagePercent} className="h-2" />
              )}
            </div>

            {/* Snippet Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Snippets (max per project)</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {maxSnippetsInAnyProject} / {planDetails.maxSnippetsPerProject === -1 ? '∞' : planDetails.maxSnippetsPerProject}
                </span>
              </div>
              {planDetails.maxSnippetsPerProject !== -1 && (
                <Progress value={snippetUsagePercent} className="h-2" />
              )}
            </div>
          </div>

          {/* Usage warnings */}
          {!isPro && (
            <div className="mt-4 space-y-2">
              {projectUsagePercent > 80 && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>You're approaching your project limit</span>
                </div>
              )}
              {snippetUsagePercent > 80 && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>You're approaching your snippet limit in one of your projects</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade to Pro */}
      {!isPro && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Upgrade to Pro
            </CardTitle>
            <CardDescription>
              Unlock unlimited projects and snippets with advanced features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Free Plan */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Free Plan</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {SUBSCRIPTION_PLANS.FREE.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-3 w-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-primary rounded-lg p-4 relative">
                <div className="absolute -top-2 left-4">
                  <Badge className="bg-primary">Popular</Badge>
                </div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Pro Plan - $10/month
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  {SUBSCRIPTION_PLANS.PRO.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleUpgrade} 
                  disabled={upgrading}
                  className="w-full"
                >
                  {upgrading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Upgrade Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pro Benefits */}
      {isPro && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Pro Benefits Active
            </CardTitle>
            <CardDescription>
              You're enjoying all Pro features with unlimited usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {SUBSCRIPTION_PLANS.PRO.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}