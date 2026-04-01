import { getServerSession } from "next-auth";
import { authOptions, getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUsageSummary } from "@/lib/stripe/usage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageMeter } from "@/components/billing/usage-meter";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return null;

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const plan = subscription?.plan ?? "FREE";
  const usage = await getUsageSummary(userId, plan);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name || "there"}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{plan}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Status: {subscription?.status?.toLowerCase().replace("_", " ") || "free tier"}
            </p>
            <Link href="/billing" className="mt-4 inline-block text-sm text-primary hover:underline">
              Manage subscription →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Usage This Period</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {usage.map((u) => <UsageMeter key={u.metric} usage={u} />)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
