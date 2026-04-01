import type Stripe from "stripe";
import { syncSubscription } from "./subscriptions.js";
import { syncInvoice } from "./invoices.js";
import { prisma } from "@/lib/prisma";

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    // ─── Checkout ──────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const { stripe } = await import("./plans.js");
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        await syncSubscription(subscription);
      }
      break;
    }

    // ─── Subscription Lifecycle ────────────
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId;
      if (userId) {
        await prisma.subscription.update({
          where: { userId },
          data: {
            status: "CANCELED",
            plan: "FREE",
            stripeSubscriptionId: null,
            stripePriceId: null,
            cancelAtPeriodEnd: false,
          },
        });
      }
      break;
    }

    // ─── Trial ─────────────────────────────
    case "customer.subscription.trial_will_end": {
      const subscription = event.data.object as Stripe.Subscription;
      // Trial ending in 3 days — trigger email notification
      const userId = subscription.metadata.userId;
      if (userId) {
        console.log(`[webhook] Trial ending soon for user ${userId}`);
        // In production: send email via Resend/SendGrid/etc.
      }
      break;
    }

    // ─── Invoices ──────────────────────────
    case "invoice.created":
    case "invoice.updated":
    case "invoice.paid":
    case "invoice.payment_failed":
    case "invoice.finalized": {
      const invoice = event.data.object as Stripe.Invoice;
      await syncInvoice(invoice);

      if (event.type === "invoice.payment_failed") {
        const subId = invoice.subscription as string | null;
        if (subId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subId },
            data: { status: "PAST_DUE" },
          });
          console.log(`[webhook] Payment failed for subscription ${subId}`);
          // In production: send dunning email
        }
      }
      break;
    }

    // ─── Customer ──────────────────────────
    case "customer.deleted": {
      const customer = event.data.object as Stripe.Customer;
      await prisma.subscription.deleteMany({
        where: { stripeCustomerId: customer.id },
      });
      break;
    }

    default:
      console.log(`[webhook] Unhandled event type: ${event.type}`);
  }
}
