import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription, getUserPlan, getUserUsage } from '@/lib/subscription';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [subscription, plan, usage] = await Promise.all([
      getUserSubscription(userId),
      getUserPlan(userId),
      getUserUsage(userId)
    ]);

    const planDetails = SUBSCRIPTION_PLANS[plan];

    return NextResponse.json({
      subscription,
      plan,
      planDetails,
      usage,
    });
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription info' },
      { status: 500 }
    );
  }
}
