import { stripe } from "./plans.js";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "./plans.js";
import type { UsageMetric, Plan } from "@prisma/client";
import type { UsageSummary } from "@/types";

// ─── Report Usage to Stripe ─────────────────────────────

export async function reportUsage(params: {
  userId: string;
  subscriptionId: string;
  metric: UsageMetric;
  quantity: number;
  idempotencyKey: string;
}): Promise<void> {
  const { userId, subscriptionId, metric, quantity, idempotencyKey } = params;

  // Check for duplicate
  const existing = await prisma.usageRecord.findUnique({
    where: { idempotencyKey },
  });
  if (existing) return;

  // Get Stripe subscription to find metered item
  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { stripeSubscriptionId: true },
  });

  let stripeRecordId: string | null = null;

  if (sub?.stripeSubscriptionId) {
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    const meteredItem = stripeSub.items.data.find((item) => {
      const recurring = item.price.recurring;
      return recurring?.usage_type === "metered";
    });

    if (meteredItem) {
      const record = await stripe.subscriptionItems.createUsageRecord(
        meteredItem.id,
        {
          quantity,
          timestamp: Math.floor(Date.now() / 1000),
          action: "increment",
        },
        { idempotencyKey },
      );
      stripeRecordId = record.id;
    }
  }

  // Always record locally regardless of Stripe sync
  await prisma.usageRecord.create({
    data: {
      userId,
      subscriptionId,
      metric,
      quantity,
      idempotencyKey,
      stripeRecordId,
    },
  });
}

// ─── Get Usage Summary ──────────────────────────────────

export async function getUsageSummary(
  userId: string,
  plan: Plan,
): Promise<UsageSummary[]> {
  const limits = PLAN_LIMITS[plan];

  // Get current period start (beginning of month)
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Aggregate usage by metric for current period
  const records = await prisma.usageRecord.groupBy({
    by: ["metric"],
    where: {
      userId,
      reportedAt: { gte: periodStart },
    },
    _sum: { quantity: true },
  });

  const usageMap = new Map<string, number>();
  for (const record of records) {
    usageMap.set(record.metric, record._sum.quantity || 0);
  }

  const metrics: { key: UsageMetric; label: string; limitKey: keyof typeof limits }[] = [
    { key: "API_CALLS", label: "API Calls", limitKey: "apiCalls" },
    { key: "STORAGE_GB", label: "Storage (GB)", limitKey: "storageGb" },
    { key: "TEAM_MEMBERS", label: "Team Members", limitKey: "teamMembers" },
    { key: "PROJECTS", label: "Projects", limitKey: "projects" },
  ];

  return metrics.map(({ key, label, limitKey }) => {
    const used = usageMap.get(key) || 0;
    const limit = limits[limitKey];
    const isUnlimited = limit === -1;

    return {
      metric: label,
      used,
      limit: isUnlimited ? -1 : limit,
      percentage: isUnlimited ? 0 : limit > 0 ? Math.round((used / limit) * 100) : 0,
      overage: isUnlimited ? 0 : Math.max(0, used - limit),
    };
  });
}

// ─── Get Usage History ──────────────────────────────────

export async function getUsageHistory(
  userId: string,
  metric: UsageMetric,
  days = 30,
): Promise<{ date: string; quantity: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await prisma.usageRecord.findMany({
    where: {
      userId,
      metric,
      reportedAt: { gte: since },
    },
    orderBy: { reportedAt: "asc" },
    select: { reportedAt: true, quantity: true },
  });

  // Group by date
  const byDate = new Map<string, number>();
  for (const record of records) {
    const dateKey = record.reportedAt.toISOString().split("T")[0]!;
    byDate.set(dateKey, (byDate.get(dateKey) || 0) + record.quantity);
  }

  return [...byDate.entries()].map(([date, quantity]) => ({ date, quantity }));
}
