import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

/** Initialize tables (run once) */
export async function initDb() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      telegram_id BIGINT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      username TEXT,
      photo TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(telegram_id),
      plan TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      activated_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      user_name TEXT,
      plan TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      amount TEXT NOT NULL,
      currency TEXT DEFAULT 'idr',
      method TEXT DEFAULT 'bca',
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

/** Upsert user (create or update) */
export async function upsertUser(telegramId: number, name: string, username?: string, photo?: string) {
  const sql = getDb();
  await sql`
    INSERT INTO users (telegram_id, name, username, photo)
    VALUES (${telegramId}, ${name}, ${username || null}, ${photo || null})
    ON CONFLICT (telegram_id) DO UPDATE SET
      name = EXCLUDED.name,
      username = EXCLUDED.username,
      photo = EXCLUDED.photo
  `;
}

/** Create order */
export async function createOrderDb(
  id: string, userId: number, userName: string, plan: string,
  planName: string, amount: string, currency: string, method: string
) {
  const sql = getDb();
  await sql`
    INSERT INTO orders (id, user_id, user_name, plan, plan_name, amount, currency, method)
    VALUES (${id}, ${userId}, ${userName}, ${plan}, ${planName}, ${amount}, ${currency}, ${method})
  `;
}

/** Get order by ID */
export async function getOrderDb(id: string) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM orders WHERE id = ${id}`;
  return rows[0] || null;
}

/** Update order status */
export async function updateOrderStatusDb(id: string, status: string) {
  const sql = getDb();
  await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
}

/** Get orders by user */
export async function getOrdersByUserDb(userId: number) {
  const sql = getDb();
  return await sql`SELECT * FROM orders WHERE user_id = ${userId} ORDER BY created_at DESC`;
}

/** Set subscription (create new, expire old) */
export async function setSubscriptionDb(userId: number, plan: string, planName: string) {
  const sql = getDb();
  // Expire old subscriptions
  await sql`UPDATE subscriptions SET status = 'expired' WHERE user_id = ${userId} AND status = 'active'`;
  // Create new
  await sql`
    INSERT INTO subscriptions (user_id, plan, plan_name, expires_at)
    VALUES (${userId}, ${plan}, ${planName}, NOW() + INTERVAL '30 days')
  `;
}

/** Get active subscription */
export async function getSubscriptionDb(userId: number) {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM subscriptions
    WHERE user_id = ${userId} AND status = 'active' AND expires_at > NOW()
    ORDER BY activated_at DESC LIMIT 1
  `;
  return rows[0] || null;
}
