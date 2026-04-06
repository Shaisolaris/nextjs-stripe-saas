# nextjs-stripe-saas

![CI](https://github.com/Shaisolaris/nextjs-stripe-saas/actions/workflows/ci.yml/badge.svg)

Next.js 14 SaaS with deep Stripe integration covering the full subscription lifecycle: checkout, trials, proration, usage-based billing, metered pricing, invoice sync, dunning, cancellation, and webhook-driven state management. Built with TypeScript, Prisma, and NextAuth.

## Stack

- **Framework:** Next.js 14 (App Router, Server Components)
- **Language:** TypeScript 5 strict mode
- **Auth:** NextAuth.js v4 (Credentials, JWT strategy)
- **Database:** Prisma ORM with PostgreSQL
- **Billing:** Stripe (Subscriptions, Checkout, Customer Portal, Usage Records, Invoices, Webhooks)
- **Styling:** Tailwind CSS with CSS variables
- **Validation:** Zod

## What Makes This Different

This is not a generic SaaS starter with a Stripe checkout button. It implements the full billing engine:

- **Usage-based billing** with metered Stripe subscription items and local usage tracking
- **Trial periods** with configurable days per plan and trial-ending webhook notifications
- **Proration** on mid-cycle plan changes via `create_prorations` behavior
- **Invoice lifecycle** synced from Stripe (draft → open → paid/void/uncollectible)
- **Dunning handling** with automatic status changes on payment failure
- **Idempotent usage reporting** with deduplication keys
- **Subscription state machine** driven entirely by webhooks (never trusts client)
- **Four-tier pricing** (Free/Starter/Pro/Enterprise) with plan limits and overage tracking
- **Annual vs monthly toggle** with percentage savings calculation

## Architecture

```
src/
├── app/
│   ├── (auth)/                       # Unauthenticated routes
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                        # Authenticated routes
│   │   ├── layout.tsx                # Nav shell with session gate
│   │   ├── dashboard/page.tsx        # Plan overview + usage meters
│   │   ├── billing/
│   │   │   ├── page.tsx              # Pricing cards, annual toggle, subscription banner
│   │   │   ├── invoices/page.tsx     # Invoice history table with Stripe links
│   │   │   └── usage/page.tsx        # Per-metric usage meters with overage alerts
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── register/route.ts
│   │   ├── billing/
│   │   │   ├── checkout/route.ts     # Create Checkout session with metered items + trial
│   │   │   ├── portal/route.ts       # Create Customer Portal session
│   │   │   └── usage/route.ts        # Report usage with idempotency
│   │   └── webhooks/
│   │       └── stripe/route.ts       # Signature verification + event routing
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── billing/
│   │   ├── pricing-card.tsx          # Plan card with trial badge, annual pricing, savings
│   │   ├── usage-meter.tsx           # Progress bar with overage detection
│   │   ├── invoice-table.tsx         # Sortable invoice list with status badges
│   │   └── subscription-banner.tsx   # Status display with trial countdown, cancel notice
│   ├── layout/
│   │   └── session-provider.tsx
│   └── ui/
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   ├── auth.ts                       # NextAuth config + getUserId helper
│   ├── prisma.ts                     # Singleton client
│   ├── utils.ts                      # cn, formatCurrency, formatDate, daysUntil
│   └── stripe/
│       ├── index.ts                  # Barrel export
│       ├── plans.ts                  # Stripe client, 4-tier plan config, plan limits
│       ├── subscriptions.ts          # Customer, checkout, portal, sync, cancel, resume, prorate, upcoming invoice
│       ├── usage.ts                  # Report usage (idempotent), usage summary, usage history
│       ├── invoices.ts               # Invoice sync from Stripe, invoice queries
│       └── webhooks.ts               # Event router: 10 event types handled
└── types/index.ts                    # PricingPlan, PlanLimits, UsageSummary, BillingOverview
```

## Stripe Integration Details

### Webhook Events Handled

| Event | Action |
|---|---|
| `checkout.session.completed` | Retrieve subscription, sync plan + status + period dates |
| `customer.subscription.created` | Sync new subscription to database |
| `customer.subscription.updated` | Sync plan changes, trial status, proration |
| `customer.subscription.deleted` | Reset to FREE plan, clear Stripe IDs |
| `customer.subscription.trial_will_end` | Log trial ending (hook for email notification) |
| `invoice.created` / `invoice.updated` / `invoice.finalized` | Sync invoice to database |
| `invoice.paid` | Update invoice status to PAID |
| `invoice.payment_failed` | Set subscription to PAST_DUE, trigger dunning |
| `customer.deleted` | Remove subscription records |

### Usage-Based Billing Flow

1. Application calls `POST /api/billing/usage` with metric, quantity, and idempotency key
2. Server checks for duplicate idempotency key (skip if exists)
3. Finds the metered subscription item on the Stripe subscription
4. Reports usage to Stripe via `subscriptionItems.createUsageRecord` with `increment` action
5. Stores local record in `UsageRecord` table for dashboard display
6. At billing period end, Stripe calculates metered charges and adds to invoice

### Plan Change (Proration)

```
changePlan(subscriptionId, newPriceId)
  → stripe.subscriptions.update({
      items: [{ id: currentItemId, price: newPriceId }],
      proration_behavior: "create_prorations",
      payment_behavior: "pending_if_incomplete"
    })
```

Stripe automatically creates proration line items on the next invoice. Upgrades charge the difference immediately; downgrades create a credit.

### Plan Limits

| Resource | Free | Starter | Pro | Enterprise |
|---|---|---|---|---|
| API Calls/month | 1,000 | 50,000 | 500,000 | Unlimited |
| Storage | 1 GB | 10 GB | 100 GB | Unlimited |
| Team Members | 1 | 5 | 25 | Unlimited |
| Projects | 3 | 20 | Unlimited | Unlimited |
| Trial | — | 14 days | 14 days | — |

## Setup

```bash
git clone https://github.com/Shaisolaris/nextjs-stripe-saas.git
cd nextjs-stripe-saas

npm install
cp .env.example .env
# Fill in all environment variables

# Database
npx prisma db push
npx prisma generate

# Stripe webhook forwarding (development)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App URL |
| `NEXTAUTH_SECRET` | JWT signing secret (32+ chars) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) |
| `STRIPE_PRICE_STARTER` | Stripe Price ID for Starter plan |
| `STRIPE_PRICE_PRO` | Stripe Price ID for Pro plan |
| `STRIPE_PRICE_ENTERPRISE` | Stripe Price ID for Enterprise plan |
| `STRIPE_METERED_PRICE_API_CALLS` | Metered price ID for API call usage |
| `STRIPE_METERED_PRICE_STORAGE` | Metered price ID for storage usage |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL |

## Key Design Decisions

**Webhook-driven state machine.** The application never determines subscription status from client actions. All state transitions flow through Stripe webhooks. The `syncSubscription` function is idempotent and handles creates and updates through Prisma `upsert`. This means you can safely replay webhooks without data corruption.

**Separate Subscription model from User.** The Subscription table is a dedicated entity rather than fields on the User model. This allows clean tracking of Stripe customer IDs, subscription IDs, period dates, trial dates, and cancellation state without polluting the User model. The one-to-one relation (`userId @unique`) maintains the constraint.

**Idempotent usage reporting.** Every usage report requires an `idempotencyKey`. The server checks for duplicates before hitting Stripe's API. This prevents double-counting from retries, network failures, or duplicate webhook deliveries. The key is also passed to Stripe's `createUsageRecord` for server-side deduplication.

**Invoice as source of truth for billing history.** Rather than calculating billing history from subscription changes, invoices are synced directly from Stripe webhooks. Each invoice captures the exact amounts, period, status, and links to Stripe's hosted invoice and PDF. This matches what the customer sees in their Stripe receipt emails.

**Local usage tracking alongside Stripe metered billing.** Usage is recorded both in the local database (for real-time dashboard display) and to Stripe (for billing). The local records provide instant usage visibility without querying Stripe's API on every page load. The Stripe records are the billing authority.

**Proration via Stripe's built-in engine.** Plan changes use `proration_behavior: "create_prorations"` rather than custom calculation. Stripe handles the complex math of mid-cycle changes, credit/debit allocations, and invoice line items. The webhook handler syncs the result.

## License

MIT
