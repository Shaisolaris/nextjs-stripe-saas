import type { Subscription, Invoice, UsageRecord, Plan, SubscriptionStatus } from "@prisma/client";

export interface PricingPlan {
  id: Plan;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  stripePriceId: string;
  limits: PlanLimits;
  features: string[];
  popular?: boolean;
  trial?: number; // trial days
}

export interface PlanLimits {
  apiCalls: number;       // per month, -1 = unlimited
  storageGb: number;
  teamMembers: number;
  projects: number;
}

export interface SubscriptionWithInvoices extends Subscription {
  invoices: Invoice[];
}

export interface UsageSummary {
  metric: string;
  used: number;
  limit: number;
  percentage: number;
  overage: number;
}

export interface BillingOverview {
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  usage: UsageSummary[];
  upcomingAmount: number | null;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export interface CheckoutParams {
  priceId: string;
  trial?: boolean;
  annual?: boolean;
}
