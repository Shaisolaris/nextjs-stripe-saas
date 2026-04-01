import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/components/layout/session-provider";
import Link from "next/link";

const nav = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Billing", href: "/billing" },
  { name: "Invoices", href: "/billing/invoices" },
  { name: "Usage", href: "/billing/usage" },
  { name: "Settings", href: "/settings" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <SessionProvider>
      <div className="min-h-screen">
        <header className="border-b">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/dashboard" className="font-bold">Stripe SaaS</Link>
            <nav className="flex items-center gap-6">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground">{item.name}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </SessionProvider>
  );
}
