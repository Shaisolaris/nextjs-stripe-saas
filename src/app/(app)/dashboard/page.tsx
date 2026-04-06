import { isDemoMode, DEMO_STATS, DEMO_ACTIVITY, DEMO_INVOICES, DEMO_PLANS } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function DashboardPage() {
  const stats = DEMO_STATS;
  const activity = DEMO_ACTIVITY;

  return (
    <div className="space-y-8">
      {isDemoMode() && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <strong>Demo Mode</strong> — Connect Stripe + database for real billing data.
        </div>
      )}
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">MRR</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${stats.revenue.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Customers</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.users}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Active Plans</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.projects}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Growth</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">+{stats.growth}%</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activity.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <span className="text-sm"><strong>{a.user}</strong> {a.action} <strong>{a.target}</strong></span>
                <span className="text-xs text-gray-500">{a.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-4">
        <Link href="/billing" className="text-sm text-blue-600 hover:underline">Manage Billing →</Link>
        <Link href="/pricing" className="text-sm text-blue-600 hover:underline">View Plans →</Link>
      </div>
    </div>
  );
}
