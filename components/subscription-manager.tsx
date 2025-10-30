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
  Zap,
  Info
} from 'lucide-react';
import { getUserPlan } from '@/lib/subscription';

const PLAN_LIMITS = {
  FREE: {
    name: 'Free',
    maxProjects: 3,
    maxSnippetsPerProject: 50,
    features: [
      'Up to 3 projects',
      'Up to 50 snippets per project',
      'Public snippets only',
      'Basic code editor',
      'Community access',
      'Tags and organization',
    ],
  },
  PRO: {
    name: 'Pro',
    maxProjects: 'Unlimited',
    maxSnippetsPerProject: 'Unlimited',
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
};

interface UsageStats {
  projectCount: number;
  snippetCounts: Record<string, number>;
  totalSnippets: number;
}

export function SubscriptionManager() {
  const { user } = useUser();
  const [plan, setPlan] = useState<'FREE' | 'PRO'>('FREE');
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPlanInfo();
    }
  }, [user]);

  const loadPlanInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user plan
      const userPlan = await getUserPlan(user!.id);
      setPlan(userPlan);

      // Get usage stats from local storage
      const projectsStr = localStorage.getItem('projects');
      const snippetsStr = localStorage.getItem('snippets');
      
      const projects = projectsStr ? JSON.parse(projectsStr) : [];
      const snippets = snippetsStr ? JSON.parse(snippetsStr) : [];
      
      const userProjects = projects.filter((p: any) => p.userId === user!.id);
      const userSnippets = snippets.filter((s: any) => s.userId === user!.id);
      
      const snippetCounts: Record<string, number> = {};
      userSnippets.forEach((snippet: any) => {
        const projectId = snippet.projectId || 'no-project';
        snippetCounts[projectId] = (snippetCounts[projectId] || 0) + 1;
      });

      setUsage({
        projectCount: userProjects.length,
        snippetCounts,
        totalSnippets: userSnippets.length,
      });
    } catch (err) {
      console.error('Error loading plan info:', err);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-900">Error Loading Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">{error}</p>
          <Button onClick={loadPlanInfo} variant="outline" className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentPlanLimits = PLAN_LIMITS[plan];
  const isPro = plan === 'PRO';

  const projectUsagePercent = isPro 
    ? 0 
    : ((usage?.projectCount || 0) / PLAN_LIMITS.FREE.maxProjects) * 100;

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card className={isPro ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPro && <Crown className="h-6 w-6 text-yellow-600" />}
              <div>
                <CardTitle className="text-2xl">
                  {currentPlanLimits.name} Plan
                </CardTitle>
                <CardDescription>
                  {isPro ? 'Premium features unlocked' : 'Your current subscription'}
                </CardDescription>
              </div>
            </div>
            <Badge variant={isPro ? "default" : "secondary"} className="text-lg px-4 py-1">
              {plan}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Stats */}
          {!isPro && usage && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Projects</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usage.projectCount} / {PLAN_LIMITS.FREE.maxProjects}
                  </span>
                </div>
                <Progress value={projectUsagePercent} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Snippets</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usage.totalSnippets} / {usage.projectCount * PLAN_LIMITS.FREE.maxSnippetsPerProject}
                  </span>
                </div>
                <Progress 
                  value={usage.projectCount > 0 
                    ? (usage.totalSnippets / (usage.projectCount * PLAN_LIMITS.FREE.maxSnippetsPerProject)) * 100 
                    : 0
                  } 
                  className="h-2" 
                />
              </div>
            </div>
          )}

          {/* Features List */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {isPro ? 'Your Features' : 'Included Features'}
            </h4>
            <ul className="space-y-2">
              {currentPlanLimits.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Card (only for Free users) */}
      {!isPro && (
        <Card className="border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <CardTitle>Upgrade to Pro</CardTitle>
            </div>
            <CardDescription>
              Unlock unlimited projects, snippets, and premium features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {PLAN_LIMITS.PRO.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-900">
                <strong>Note:</strong> This is an open-source project. The PRO plan is managed manually. 
                Please contact the administrator to upgrade your account.
              </p>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600" 
              size="lg"
              onClick={() => {
                alert('Please contact the administrator to upgrade to PRO plan.\n\nIn a production environment, you would integrate a payment processor like Stripe here.');
              }}
            >
              <Crown className="h-4 w-4 mr-2" />
              Contact for Pro Upgrade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pro User Info */}
      {isPro && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900">You&apos;re all set!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Enjoy unlimited access to all premium features. Thank you for your support!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
