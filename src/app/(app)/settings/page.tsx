"use client";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { data: session } = useSession();
  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold">Settings</h1></div>
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium">Name</label><p className="text-sm text-muted-foreground">{session?.user?.name || "—"}</p></div>
          <div><label className="text-sm font-medium">Email</label><p className="text-sm text-muted-foreground">{session?.user?.email || "—"}</p></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
