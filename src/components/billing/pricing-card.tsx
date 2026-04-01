"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import type { PricingPlan } from "@/types";
import type { Plan } from "@prisma/client";

interface Props {
  plan: PricingPlan;
  currentPlan: Plan;
  annual: boolean;
  onSelect: (plan: PricingPlan) => void;
  isLoading?: boolean;
}

export function PricingCard({ plan, currentPlan, annual, onSelect, isLoading }: Props) {
  const isCurrent = currentPlan === plan.id;
  const price = annual ? plan.annualPrice : plan.monthlyPrice;

  return (
    <Card className={cn("relative flex flex-col", plan.popular && "border-primary ring-1 ring-primary")}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
          Most Popular
        </div>
      )}
      {plan.trial && !isCurrent && (
        <div className="absolute -top-3 right-4 rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
          {plan.trial}-day free trial
        </div>
      )}
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price === 0 ? "Free" : formatCurrency(price)}</span>
          {price > 0 && <span className="text-muted-foreground">/{annual ? "year" : "month"}</span>}
          {annual && price > 0 && (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              Save {Math.round(((plan.monthlyPrice * 12 - plan.annualPrice) / (plan.monthlyPrice * 12)) * 100)}% vs monthly
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2.5">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={plan.popular ? "default" : "outline"}
          disabled={isCurrent || isLoading}
          isLoading={isLoading}
          onClick={() => onSelect(plan)}
        >
          {isCurrent ? "Current Plan" : plan.trial ? `Start ${plan.trial}-day trial` : price === 0 ? "Downgrade" : "Upgrade"}
        </Button>
      </CardFooter>
    </Card>
  );
}
