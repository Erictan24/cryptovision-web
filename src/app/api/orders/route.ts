import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth";
import { createOrderDb, getOrderDb, getOrdersByUserDb, updateOrderStatusDb } from "@/lib/db";

const PLANS: Record<string, { name: string; priceIDR: string; priceUSD: string }> = {
  bot: { name: "Bot Scalping + Swing", priceIDR: "Rp 449.000", priceUSD: "$35" },
  indicator: { name: "Indikator TradingView", priceIDR: "Rp 199.000", priceUSD: "$15" },
};

/** POST — create new order */
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { plan, method, currency } = await req.json();
  if (!plan || !PLANS[plan]) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const planInfo = PLANS[plan];
  const amount = currency === "usd" ? planInfo.priceUSD : planInfo.priceIDR;
  const id = `CV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  await createOrderDb(id, user.id, user.name, plan, planInfo.name, amount, currency || "idr", method || "bca");

  return NextResponse.json({ ok: true, order: { id, plan, planName: planInfo.name, amount, method } });
}

/** GET — get user's orders or specific order */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("id");
  const secret = req.nextUrl.searchParams.get("secret");

  if (orderId) {
    if (secret) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
      const expected = crypto.createHmac("sha256", botToken).update(orderId).digest("hex");
      if (secret !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const order = await getOrderDb(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order });
  }

  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const orders = await getOrdersByUserDb(user.id);
  return NextResponse.json({ orders });
}

/** PATCH — update order status (from bot) */
export async function PATCH(req: NextRequest) {
  const { orderId, status, secret } = await req.json();
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  const expected = crypto.createHmac("sha256", botToken).update(orderId).digest("hex");
  if (secret !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await updateOrderStatusDb(orderId, status);
  const order = await getOrderDb(orderId);
  return NextResponse.json({ ok: true, order });
}
