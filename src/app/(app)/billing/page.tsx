"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PricingCard } from "@/components/billing/pricing-card";
import { SubscriptionBanner } from "@/components/billing/subscription-banner";
import { PLANS } from "@/lib/stripe/plans";
import type { PricingPlan } from "@/types";
import type { Plan, SubscriptionStatus } from "@prisma/client";

export default function BillingPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);

  // In production these come from server props; simplified for demo
  const currentPlan: Plan = "FREE";
  const status: SubscriptionStatus = "INACTIVE";

  const handleSelect = async (plan: PricingPlan) => {
    if (plan.monthlyPrice === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.stripePriceId, trial: !!plan.trial }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally { setLoading(false); }
  };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
          Subscription activated successfully!
        </div>
      )}

      <SubscriptionBanner
        plan={currentPlan}
        status={status}
        currentPeriodEnd={null}
        cancelAtPeriodEnd={false}
        trialEnd={null}
        onManageBilling={handlePortal}
        isLoading={loading}
      />

      {/* Annual toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={annual ? "text-muted-foreground" : "font-medium"}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative h-6 w-11 rounded-full transition-colors ${annual ? "bg-primary" : "bg-secondary"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${annual ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
        <span className={annual ? "font-medium" : "text-muted-foreground"}>Annual</span>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">Save up to 30%</span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <PricingCard key={plan.id} plan={plan} currentPlan={currentPlan} annual={annual} onSelect={handleSelect} isLoading={loading} />
        ))}
      </div>
    </div>
  );
}
