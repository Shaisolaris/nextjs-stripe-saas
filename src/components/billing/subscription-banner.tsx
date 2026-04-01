"use client";

import { cn, formatDate, daysUntil } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Plan, SubscriptionStatus } from "@prisma/client";

interface Props {
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  onManageBilling: () => void;
  isLoading?: boolean;
}

export function SubscriptionBanner(props: Props) {
  const { plan, status, currentPeriodEnd, cancelAtPeriodEnd, trialEnd, onManageBilling, isLoading } = props;
  const trialDays = daysUntil(trialEnd);

  return (
    <div className={cn(
      "flex flex-col gap-4 rounded-lg border p-6 sm:flex-row sm:items-center sm:justify-between",
      cancelAtPeriodEnd && "border-destructive/50 bg-destructive/5",
      status === "TRIALING" && "border-green-500/50 bg-green-50 dark:bg-green-950/20",
      status === "PAST_DUE" && "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20",
    )}>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{plan} Plan</h3>
          <span className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            status === "ACTIVE" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
            status === "TRIALING" && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
            status === "PAST_DUE" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
            status === "CANCELED" && "bg-muted text-muted-foreground",
          )}>
            {status.toLowerCase().replace("_", " ")}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {cancelAtPeriodEnd
            ? `Cancels on ${formatDate(currentPeriodEnd)}`
            : status === "TRIALING" && trialDays !== null
              ? `Trial ends in ${trialDays} day${trialDays !== 1 ? "s" : ""} (${formatDate(trialEnd)})`
              : currentPeriodEnd
                ? `Renews on ${formatDate(currentPeriodEnd)}`
                : "No active subscription"
          }
        </p>
      </div>
      <Button variant="outline" onClick={onManageBilling} isLoading={isLoading}>
        Manage Billing
      </Button>
    </div>
  );
}
