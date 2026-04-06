import { isDemoMode, DEMO_STATS } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function UsagePage() {
  const limits = { api_calls: { used: 8420, limit: 10000 }, storage: { used: 12.4, limit: 50 }, team_members: { used: 5, limit: 10 } };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Usage</h1>
      {isDemoMode() && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">Demo data shown.</div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>API Calls</CardTitle><CardDescription>This billing period</CardDescription></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{limits.api_calls.used.toLocaleString()} / {limits.api_calls.limit.toLocaleString()}</p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200"><div className="h-2 rounded-full bg-blue-600" style={{width: `${(limits.api_calls.used/limits.api_calls.limit)*100}%`}}/></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Storage</CardTitle><CardDescription>GB used</CardDescription></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{limits.storage.used} / {limits.storage.limit} GB</p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200"><div className="h-2 rounded-full bg-blue-600" style={{width: `${(limits.storage.used/limits.storage.limit)*100}%`}}/></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Team Members</CardTitle><CardDescription>Active seats</CardDescription></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{limits.team_members.used} / {limits.team_members.limit}</p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200"><div className="h-2 rounded-full bg-blue-600" style={{width: `${(limits.team_members.used/limits.team_members.limit)*100}%`}}/></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
