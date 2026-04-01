import { getServerSession } from "next-auth";
import { authOptions, getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUsageSummary } from "@/lib/stripe/usage";
import { getPlanById } from "@/lib/stripe/plans";
import { UsageMeter } from "@/components/billing/usage-meter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function UsagePage() {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return null;

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const plan = subscription?.plan ?? "FREE";
  const usage = await getUsageSummary(userId, plan);
  const planInfo = getPlanById(plan);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Usage</h1>
        <p className="text-muted-foreground">Monitor your resource consumption for the current billing period</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Period Usage</CardTitle>
          <CardDescription>
            You are on the {planInfo?.name || plan} plan.
            {plan !== "ENTERPRISE" && " Upgrade for higher limits."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {usage.map((u) => <UsageMeter key={u.metric} usage={u} />)}
        </CardContent>
      </Card>
    </div>
  );
}
