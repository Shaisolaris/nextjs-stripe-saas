import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportUsage } from "@/lib/stripe/usage";
import { z } from "zod";

const schema = z.object({
  metric: z.enum(["API_CALLS", "STORAGE_GB", "TEAM_MEMBERS", "PROJECTS"]),
  quantity: z.number().int().positive(),
  idempotencyKey: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

    const sub = await prisma.subscription.findUnique({ where: { userId }, select: { id: true } });
    if (!sub) return NextResponse.json({ error: "No subscription found" }, { status: 404 });

    await reportUsage({
      userId,
      subscriptionId: sub.id,
      metric: parsed.data.metric,
      quantity: parsed.data.quantity,
      idempotencyKey: parsed.data.idempotencyKey,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Usage reporting error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
