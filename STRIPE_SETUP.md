# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment integration for your Snippet Manager application.

## 🏗️ What's Been Implemented

### ✅ Features Added:
1. **Free Plan**: 3 projects max, 10 snippets per project
2. **Pro Plan**: $10/month with unlimited projects and snippets
3. **Usage validation** on project and snippet creation
4. **Stripe checkout** integration for upgrading to Pro
5. **Subscription management** interface in Settings
6. **Webhook handling** for subscription status updates
7. **Database schema** for tracking user subscriptions

### 📋 Database Changes:
- Added `user_subscriptions` table to track subscription status
- Updated SQL migration script in `/scripts/create-tables.sql`

## 🚀 Setup Instructions

### 1. Create Stripe Account & Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account or sign in
3. Navigate to **Developers > API keys**
4. Copy your **Publishable key** (starts with `pk_`)
5. Copy your **Secret key** (starts with `sk_`)

### 2. Create Product & Price in Stripe

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**
3. Configure the Pro plan:
   - **Name**: Snippet Manager Pro
   - **Description**: Unlimited projects and snippets with advanced features
   - **Pricing**: Recurring, $10.00 USD per month
   - **Payment options**: Card
4. Copy the **Price ID** (starts with `price_`)

### 3. Set Up Webhook Endpoint

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **+ Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhooks`
4. **Listen to**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

### 4. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRO_PRICE_ID=price_your_pro_price_id_here
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_your_pro_price_id_here
```

### 5. Update Database Schema

Run the updated SQL script in your Supabase dashboard:

1. Go to **SQL Editor** in Supabase
2. Paste the content from `/scripts/create-tables.sql`
3. Click **Run**

### 6. Test the Integration

1. **Start your development server**: `npm run dev`
2. **Sign up/Login** to create a user account
3. **Go to Settings > Subscription** tab
4. **Verify free plan limits**:
   - Try creating 4+ projects (should be blocked)
   - Try creating 11+ snippets in a project (should be blocked)
5. **Test upgrade flow**:
   - Click "Upgrade Now" button
   - Complete test checkout (use test card: `4242 4242 4242 4242`)
   - Verify Pro plan activation

## 🎯 Usage Limits

### Free Plan:
- ✅ 3 projects maximum
- ✅ 10 snippets per project
- ✅ Basic search functionality
- ✅ Tag organization

### Pro Plan ($10/month):
- ✅ Unlimited projects
- ✅ Unlimited snippets
- ✅ Advanced search & filtering
- ✅ Export/Import capabilities
- ✅ Analytics dashboard
- ✅ Priority support

## 🛠️ Technical Implementation

### Key Files Created/Modified:

1. **`/lib/stripe.ts`** - Stripe configuration and plan definitions
2. **`/lib/subscription.ts`** - Subscription service with usage tracking
3. **`/app/api/stripe/`** - API routes for checkout and webhooks
4. **`/components/subscription-manager.tsx`** - Subscription UI component
5. **`/lib/projects.ts`** - Added usage validation for project creation
6. **`/lib/snippets.ts`** - Added usage validation for snippet creation
7. **Database schema** - Added user_subscriptions table

### Usage Validation Flow:

1. User tries to create project/snippet
2. System checks current usage vs. plan limits
3. If within limits → Allow creation
4. If exceeds limits → Show upgrade prompt
5. User can upgrade via Stripe checkout
6. Webhook updates subscription status
7. New limits apply immediately

## 🔒 Security Notes

- All Stripe operations use server-side API keys
- Webhook signatures are verified for security
- User IDs are validated before subscription operations
- Rate limiting and error handling implemented

## 📞 Support

If you encounter issues:

1. Check Stripe Dashboard for failed payments/webhooks
2. Review server logs for error messages
3. Verify all environment variables are set
4. Ensure webhook URL is publicly accessible
5. Test with Stripe's test cards first

## 🎉 Go Live Checklist

When ready for production:

1. Replace test API keys with live keys
2. Update webhook endpoint to production URL
3. Test with real payment methods
4. Set up monitoring for failed payments
5. Configure email notifications for subscription events