import Stripe from "stripe";
import type { PricingPlan, PlanLimits } from "@/types";
import type { Plan } from "@prisma/client";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: { apiCalls: 1_000, storageGb: 1, teamMembers: 1, projects: 3 },
  STARTER: { apiCalls: 50_000, storageGb: 10, teamMembers: 5, projects: 20 },
  PRO: { apiCalls: 500_000, storageGb: 100, teamMembers: 25, projects: -1 },
  ENTERPRISE: { apiCalls: -1, storageGb: -1, teamMembers: -1, projects: -1 },
};

export const PLANS: PricingPlan[] = [
  {
    id: "FREE",
    name: "Free",
    description: "For personal projects and exploration",
    monthlyPrice: 0,
    annualPrice: 0,
    stripePriceId: "",
    limits: PLAN_LIMITS.FREE,
    features: [
      "1,000 API calls/month",
      "1 GB storage",
      "1 team member",
      "3 projects",
      "Community support",
    ],
  },
  {
    id: "STARTER",
    name: "Starter",
    description: "For small teams getting started",
    monthlyPrice: 1900,
    annualPrice: 15900,
    stripePriceId: process.env.STRIPE_PRICE_STARTER || "",
    trial: 14,
    features: [
      "50,000 API calls/month",
      "10 GB storage",
      "5 team members",
      "20 projects",
      "Email support",
      "Usage analytics",
    ],
    limits: PLAN_LIMITS.STARTER,
  },
  {
    id: "PRO",
    name: "Pro",
    description: "For growing businesses",
    monthlyPrice: 4900,
    annualPrice: 41900,
    stripePriceId: process.env.STRIPE_PRICE_PRO || "",
    popular: true,
    trial: 14,
    features: [
      "500,000 API calls/month",
      "100 GB storage",
      "25 team members",
      "Unlimited projects",
      "Priority support",
      "Usage analytics",
      "API access",
      "Overage billing",
    ],
    limits: PLAN_LIMITS.PRO,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    description: "For large organizations",
    monthlyPrice: 19900,
    annualPrice: 169900,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || "",
    features: [
      "Unlimited API calls",
      "Unlimited storage",
      "Unlimited team members",
      "Unlimited projects",
      "Dedicated support",
      "SSO / SAML",
      "Audit logs",
      "Custom contracts",
      "SLA guarantee",
    ],
    limits: PLAN_LIMITS.ENTERPRISE,
  },
];

export function getPlanByPriceId(priceId: string): PricingPlan | undefined {
  return PLANS.find((p) => p.stripePriceId === priceId);
}

export function getPlanById(id: Plan): PricingPlan | undefined {
  return PLANS.find((p) => p.id === id);
}
