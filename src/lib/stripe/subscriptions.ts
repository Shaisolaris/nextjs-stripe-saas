import type Stripe from "stripe";
import { stripe } from "./plans.js";
import { prisma } from "@/lib/prisma";
import type { Plan, SubscriptionStatus } from "@prisma/client";

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  active: "ACTIVE",
  past_due: "PAST_DUE",
  canceled: "CANCELED",
  trialing: "TRIALING",
  unpaid: "UNPAID",
  incomplete: "INCOMPLETE",
};

// ─── Customer Management ────────────────────────────────

export async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const existing = await prisma.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  if (existing) return existing.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await prisma.subscription.create({
    data: {
      userId,
      stripeCustomerId: customer.id,
      plan: "FREE",
      status: "INACTIVE",
    },
  });

  return customer.id;
}

// ─── Checkout ───────────────────────────────────────────

export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  userId: string;
  trialDays?: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: params.customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { userId: params.userId },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    tax_id_collection: { enabled: true },
  };

  // Add metered usage items if Pro+ plan
  const meteredApiPrice = process.env.STRIPE_METERED_PRICE_API_CALLS;
  const meteredStoragePrice = process.env.STRIPE_METERED_PRICE_STORAGE;

  if (meteredApiPrice) {
    sessionParams.line_items!.push({ price: meteredApiPrice });
  }
  if (meteredStoragePrice) {
    sessionParams.line_items!.push({ price: meteredStoragePrice });
  }

  if (params.trialDays && params.trialDays > 0) {
    sessionParams.subscription_data = {
      trial_period_days: params.trialDays,
      metadata: { userId: params.userId },
    };
  } else {
    sessionParams.subscription_data = {
      metadata: { userId: params.userId },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return session.url!;
}

// ─── Billing Portal ─────────────────────────────────────

export async function createPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

// ─── Subscription Sync ──────────────────────────────────

export async function syncSubscription(stripeSubscription: Stripe.Subscription): Promise<void> {
  const userId = stripeSubscription.metadata.userId;
  if (!userId) return;

  const priceId = stripeSubscription.items.data[0]?.price.id ?? null;
  const plan = resolvePlan(priceId);
  const status = STATUS_MAP[stripeSubscription.status] || "INACTIVE";

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      plan,
      status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      trialStart: stripeSubscription.trial_start
        ? new Date(stripeSubscription.trial_start * 1000)
        : null,
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
    },
    create: {
      userId,
      stripeCustomerId: stripeSubscription.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      plan,
      status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      trialStart: stripeSubscription.trial_start
        ? new Date(stripeSubscription.trial_start * 1000)
        : null,
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
    },
  });
}

// ─── Cancel / Resume ────────────────────────────────────

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// ─── Plan Change (Proration) ────────────────────────────

export async function changePlan(
  subscriptionId: string,
  newPriceId: string,
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const itemId = subscription.items.data[0]?.id;

  if (!itemId) throw new Error("No subscription item found");

  return stripe.subscriptions.update(subscriptionId, {
    items: [{ id: itemId, price: newPriceId }],
    proration_behavior: "create_prorations",
    payment_behavior: "pending_if_incomplete",
  });
}

// ─── Upcoming Invoice (Preview) ─────────────────────────

export async function getUpcomingInvoice(customerId: string): Promise<Stripe.UpcomingInvoice | null> {
  try {
    return await stripe.invoices.retrieveUpcoming({ customer: customerId });
  } catch {
    return null;
  }
}

// ─── Helpers ────────────────────────────────────────────

function resolvePlan(priceId: string | null): Plan {
  if (!priceId) return "FREE";

  const mapping: Record<string, Plan> = {};
  if (process.env.STRIPE_PRICE_STARTER) mapping[process.env.STRIPE_PRICE_STARTER] = "STARTER";
  if (process.env.STRIPE_PRICE_PRO) mapping[process.env.STRIPE_PRICE_PRO] = "PRO";
  if (process.env.STRIPE_PRICE_ENTERPRISE) mapping[process.env.STRIPE_PRICE_ENTERPRISE] = "ENTERPRISE";

  return mapping[priceId] || "FREE";
}
