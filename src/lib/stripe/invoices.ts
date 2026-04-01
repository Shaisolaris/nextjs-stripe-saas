import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import type { InvoiceStatus } from "@prisma/client";

const INVOICE_STATUS_MAP: Record<string, InvoiceStatus> = {
  draft: "DRAFT",
  open: "OPEN",
  paid: "PAID",
  void: "VOID",
  uncollectible: "UNCOLLECTIBLE",
};

export async function syncInvoice(stripeInvoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = stripeInvoice.subscription as string | null;
  if (!subscriptionId) return;

  // Find local subscription by Stripe subscription ID
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) return;

  const status = INVOICE_STATUS_MAP[stripeInvoice.status ?? "draft"] || "DRAFT";

  await prisma.invoice.upsert({
    where: { stripeInvoiceId: stripeInvoice.id },
    update: {
      amountDue: stripeInvoice.amount_due,
      amountPaid: stripeInvoice.amount_paid,
      currency: stripeInvoice.currency,
      status,
      invoiceUrl: stripeInvoice.hosted_invoice_url ?? null,
      invoicePdf: stripeInvoice.invoice_pdf ?? null,
    },
    create: {
      subscriptionId: subscription.id,
      stripeInvoiceId: stripeInvoice.id,
      amountDue: stripeInvoice.amount_due,
      amountPaid: stripeInvoice.amount_paid,
      currency: stripeInvoice.currency,
      status,
      invoiceUrl: stripeInvoice.hosted_invoice_url ?? null,
      invoicePdf: stripeInvoice.invoice_pdf ?? null,
      periodStart: new Date(stripeInvoice.period_start * 1000),
      periodEnd: new Date(stripeInvoice.period_end * 1000),
    },
  });
}

export async function getInvoices(userId: string): Promise<{
  id: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: InvoiceStatus;
  invoiceUrl: string | null;
  invoicePdf: string | null;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
}[]> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!subscription) return [];

  return prisma.invoice.findMany({
    where: { subscriptionId: subscription.id },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      id: true,
      amountDue: true,
      amountPaid: true,
      currency: true,
      status: true,
      invoiceUrl: true,
      invoicePdf: true,
      periodStart: true,
      periodEnd: true,
      createdAt: true,
    },
  });
}
