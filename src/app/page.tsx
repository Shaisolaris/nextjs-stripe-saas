import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight">Stripe SaaS <span className="text-primary">Billing</span></h1>
      <p className="mt-6 max-w-lg text-lg text-muted-foreground">
        Subscriptions, usage-based billing, invoices, trials, proration, and webhook-driven state — all wired up.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/register"><Button size="lg">Get Started</Button></Link>
        <Link href="/login"><Button variant="outline" size="lg">Sign In</Button></Link>
      </div>
    </div>
  );
}
