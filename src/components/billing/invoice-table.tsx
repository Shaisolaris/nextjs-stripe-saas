import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface InvoiceRow {
  id: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string;
  invoiceUrl: string | null;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
}

const statusStyles: Record<string, string> = {
  PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  OPEN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  DRAFT: "bg-secondary text-secondary-foreground",
  VOID: "bg-muted text-muted-foreground",
  UNCOLLECTIBLE: "bg-destructive/10 text-destructive",
};

export function InvoiceTable({ invoices }: { invoices: InvoiceRow[] }) {
  if (invoices.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No invoices yet</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-3 pr-4 font-medium">Date</th>
            <th className="py-3 pr-4 font-medium">Period</th>
            <th className="py-3 pr-4 font-medium">Amount</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 font-medium">Invoice</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b last:border-0">
              <td className="py-3 pr-4">{formatDate(inv.createdAt)}</td>
              <td className="py-3 pr-4 text-muted-foreground">
                {formatDate(inv.periodStart)} — {formatDate(inv.periodEnd)}
              </td>
              <td className="py-3 pr-4 font-medium">
                {formatCurrency(inv.amountDue, inv.currency)}
              </td>
              <td className="py-3 pr-4">
                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", statusStyles[inv.status] || "bg-muted")}>
                  {inv.status.toLowerCase()}
                </span>
              </td>
              <td className="py-3">
                {inv.invoiceUrl ? (
                  <a
                    href={inv.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View →
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
