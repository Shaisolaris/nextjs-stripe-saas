import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPortalSession } from "@/lib/stripe/subscriptions";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sub = await prisma.subscription.findUnique({ where: { userId }, select: { stripeCustomerId: true } });
    if (!sub) return NextResponse.json({ error: "No subscription found" }, { status: 404 });

    const url = await createPortalSession(sub.stripeCustomerId, `${process.env.NEXT_PUBLIC_APP_URL}/billing`);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
