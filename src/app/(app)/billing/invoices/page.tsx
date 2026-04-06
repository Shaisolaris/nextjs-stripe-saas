import { isDemoMode, DEMO_INVOICES } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InvoicesPage() {
  const invoices = DEMO_INVOICES;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invoices</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{inv.date}</p>
                  <p className="text-sm text-gray-500">Monthly subscription</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">${inv.amount}</span>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
