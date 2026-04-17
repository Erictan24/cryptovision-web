import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createOrder, getOrdersByUser, getOrder, updateOrderStatus, PLANS } from "@/lib/orders";
import crypto from "crypto";

/** POST — create new order */
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { plan, method, currency } = await req.json();

  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planInfo = PLANS[plan];
  const amount = currency === "usd" ? planInfo.priceUSD : planInfo.priceIDR;

  const order = createOrder({
    userId: user.id,
    userName: user.name,
    plan,
    planName: planInfo.name,
    amount,
    currency: currency || "idr",
    method: method || "bca",
  });

  return NextResponse.json({ ok: true, order });
}

/** GET — get user's orders or specific order */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("id");

  // Get specific order (for bot verification)
  if (orderId) {
    const secret = req.nextUrl.searchParams.get("secret");
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "";

    // If secret provided, verify it's from bot
    if (secret) {
      const expectedSecret = crypto
        .createHmac("sha256", botToken)
        .update(orderId)
        .digest("hex");
      if (secret !== expectedSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const order = getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  }

  // Get user's orders
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const orders = getOrdersByUser(user.id);
  return NextResponse.json({ orders });
}

/** PATCH — update order status (from bot) */
export async function PATCH(req: NextRequest) {
  const { orderId, status, secret } = await req.json();

  // Verify request from bot
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  const expectedSecret = crypto
    .createHmac("sha256", botToken)
    .update(orderId)
    .digest("hex");

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = updateOrderStatus(orderId, status);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order });
}
