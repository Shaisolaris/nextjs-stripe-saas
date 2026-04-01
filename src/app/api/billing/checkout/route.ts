import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getUserId } from "@/lib/auth";
import { getOrCreateCustomer, createCheckoutSession } from "@/lib/stripe/subscriptions";
import { getPlanByPriceId } from "@/lib/stripe/plans";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);
    if (!userId || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, trial } = (await req.json()) as { priceId: string; trial?: boolean };
    if (!priceId) return NextResponse.json({ error: "Price ID required" }, { status: 400 });

    const customerId = await getOrCreateCustomer(userId, session.user.email);
    const plan = getPlanByPriceId(priceId);

    const url = await createCheckoutSession({
      customerId,
      priceId,
      userId,
      trialDays: trial && plan?.trial ? plan.trial : undefined,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
