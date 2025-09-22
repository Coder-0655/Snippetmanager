import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { handleStripeWebhook } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId && customerId && subscriptionId && stripe) {
          // First, ensure we have a user subscription record with the customer ID
          await handleStripeWebhook(
            'customer.subscription.link',
            subscriptionId,
            customerId,
            { userId }
          );
          
          // Then update with the subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await handleStripeWebhook(
            'customer.subscription.created',
            subscriptionId,
            customerId,
            subscription
          );
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleStripeWebhook(
          event.type,
          subscription.id,
          subscription.customer as string,
          subscription
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleStripeWebhook(
          event.type,
          subscription.id,
          subscription.customer as string,
          subscription
        );
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          await handleStripeWebhook(
            event.type,
            invoice.subscription,
            invoice.customer as string,
            invoice
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          await handleStripeWebhook(
            event.type,
            invoice.subscription,
            invoice.customer as string,
            invoice
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}