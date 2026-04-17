/**
 * Subscription storage — in-memory.
 * Key: Telegram user ID → plan info.
 * Set by bot after /verify, read by dashboard.
 *
 * NOTE: Vercel serverless = data hilang saat cold start.
 * Untuk production, ganti dengan database.
 * Workaround: bot re-set subscription setiap kali verify.
 */

export type Subscription = {
  userId: number;
  plan: string;
  planName: string;
  status: "active" | "expired";
  activatedAt: number;
  expiresAt: number;
};

const subs = new Map<number, Subscription>();

export function setSubscription(userId: number, plan: string, planName: string): Subscription {
  const now = Date.now();
  const sub: Subscription = {
    userId,
    plan,
    planName,
    status: "active",
    activatedAt: now,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  subs.set(userId, sub);
  return sub;
}

export function getSubscription(userId: number): Subscription | null {
  const sub = subs.get(userId);
  if (!sub) return null;
  // Check expiry
  if (Date.now() > sub.expiresAt) {
    return { ...sub, status: "expired" };
  }
  return sub;
}
