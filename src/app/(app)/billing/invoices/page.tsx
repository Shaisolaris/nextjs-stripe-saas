import { getServerSession } from "next-auth";
import { authOptions, getUserId } from "@/lib/auth";
import { getInvoices } from "@/lib/stripe/invoices";
import { InvoiceTable } from "@/components/billing/invoice-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return null;

  const invoices = await getInvoices(userId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">View and download your billing history</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Invoice History</CardTitle></CardHeader>
        <CardContent><InvoiceTable invoices={invoices} /></CardContent>
      </Card>
    </div>
  );
}
