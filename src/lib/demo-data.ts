/**
 * Demo data — all pages work immediately with npm run dev, zero config needed.
 */
export function isDemoMode(): boolean {
  return !process.env.DATABASE_URL || process.env.DEMO_MODE === "true";
}

export const DEMO_USER = { id: "demo-1", name: "Sarah Chen", email: "sarah@demo.com", role: "ADMIN" };

export const DEMO_STATS = { users: 215, revenue: 24500, projects: 12, growth: 12.5 };

export const DEMO_PLANS = [
  { id: "free", name: "Free", price: 0, interval: "month", features: ["3 projects", "2 team members", "1 GB storage"] },
  { id: "pro", name: "Pro", price: 29, interval: "month", features: ["25 projects", "10 team members", "50 GB storage", "Priority support", "API access"], popular: true },
  { id: "enterprise", name: "Enterprise", price: 99, interval: "month", features: ["Unlimited projects", "Unlimited members", "500 GB storage", "Dedicated support", "SSO", "Audit logs"] },
];

export const DEMO_ACTIVITY = [
  { id: "1", user: "Sarah Chen", action: "created project", target: "Website Redesign", time: "2h ago" },
  { id: "2", user: "James Wilson", action: "completed task", target: "API integration", time: "4h ago" },
  { id: "3", user: "Emily Park", action: "deployed", target: "v2.4.1 to production", time: "6h ago" },
  { id: "4", user: "Alex Kim", action: "merged PR", target: "#142 Fix auth flow", time: "8h ago" },
];

export const DEMO_INVOICES = [
  { id: "inv-1", date: "Apr 1, 2026", amount: 29, status: "paid" },
  { id: "inv-2", date: "Mar 1, 2026", amount: 29, status: "paid" },
  { id: "inv-3", date: "Feb 1, 2026", amount: 29, status: "paid" },
];
