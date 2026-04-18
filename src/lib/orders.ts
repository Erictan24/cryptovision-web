/**
 * Order storage — in-memory untuk MVP.
 * Nanti upgrade ke PostgreSQL/Redis kalau user banyak.
 */

export type OrderStatus = "pending" | "paid" | "active" | "expired";

export type Order = {
  id: string;
  userId: number;
  userName: string;
  plan: string;
  planName: string;
  amount: string;
  currency: string;
  method: string;
  status: OrderStatus;
  createdAt: number;
};

const orders = new Map<string, Order>();
const ORDER_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function createOrder(data: Omit<Order, "id" | "status" | "createdAt">): Order {
  // Cleanup expired
  const now = Date.now();
  for (const [k, v] of orders) {
    if (v.status === "pending" && now - v.createdAt > ORDER_TTL_MS) {
      orders.set(k, { ...v, status: "expired" });
    }
  }

  const id = `CV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const order: Order = { ...data, id, status: "pending", createdAt: now };
  orders.set(id, order);
  return order;
}

export function getOrder(id: string): Order | null {
  return orders.get(id) || null;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const order = orders.get(id);
  if (!order) return null;
  const updated = { ...order, status };
  orders.set(id, updated);
  return updated;
}

export function getOrdersByUser(userId: number): Order[] {
  return Array.from(orders.values())
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export const PLANS: Record<string, { name: string; priceIDR: string; priceUSD: string; amountIDR: number }> = {
  m1: { name: "Bot 1 Bulan", priceIDR: "Rp 449.000", priceUSD: "$35", amountIDR: 449000 },
  m3: { name: "Bot 3 Bulan", priceIDR: "Rp 999.000", priceUSD: "$79", amountIDR: 999000 },
  y1: { name: "Bot 1 Tahun", priceIDR: "Rp 2.999.000", priceUSD: "$239", amountIDR: 2999000 },
  lt: { name: "Bot Lifetime", priceIDR: "Rp 4.999.000", priceUSD: "$399", amountIDR: 4999000 },
  indicator: { name: "Indikator TradingView", priceIDR: "Rp 199.000", priceUSD: "$15", amountIDR: 199000 },
};
