import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import type { UsageSummary } from "@/types";

export function UsageMeter({ usage }: { usage: UsageSummary }) {
  const isUnlimited = usage.limit === -1;
  const isOverage = usage.overage > 0;
  const pct = isUnlimited ? 0 : Math.min(usage.percentage, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{usage.metric}</span>
        <span className="text-muted-foreground">
          {formatNumber(usage.used)} / {isUnlimited ? "∞" : formatNumber(usage.limit)}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isOverage ? "bg-destructive" : pct > 80 ? "bg-yellow-500" : "bg-primary",
            )}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      )}
      {isOverage && (
        <p className="text-xs text-destructive">
          {formatNumber(usage.overage)} over limit — overage charges may apply
        </p>
      )}
      {isUnlimited && (
        <p className="text-xs text-muted-foreground">Unlimited on your current plan</p>
      )}
    </div>
  );
}
