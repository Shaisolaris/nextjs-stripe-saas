"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { const d = await res.json() as { error?: string }; setError(d.error || "Registration failed"); setLoading(false); return; }
    const signInRes = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    if (signInRes?.error) { setError("Login failed after registration"); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center"><CardTitle>Create Account</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium">Name</label><input className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="mb-1 block text-sm font-medium">Email</label><input className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="mb-1 block text-sm font-medium">Password</label><input className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" isLoading={loading}>Create Account</Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link></p>
      </CardFooter>
    </Card>
  );
}
