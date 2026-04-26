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

  // Signal yang di-generate bot — semua user lihat ini di Signals page
  await sql`
    CREATE TABLE IF NOT EXISTS signals (
      id BIGSERIAL PRIMARY KEY,
      symbol TEXT NOT NULL,
      direction TEXT NOT NULL,
      strategy TEXT DEFAULT 'swing',
      quality TEXT,
      score INTEGER,
      entry NUMERIC,
      sl NUMERIC,
      tp1 NUMERIC,
      tp2 NUMERIC,
      rr NUMERIC,
      reasons JSONB,
      executed BOOLEAN DEFAULT false,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  // Add status column kalau tabel sudah ada dari versi lama
  await sql`ALTER TABLE signals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'`;
  await sql`CREATE INDEX IF NOT EXISTS idx_signals_created ON signals(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status)`;

  // Posisi yang lagi running (limit terisi, belum close)
  await sql`
    CREATE TABLE IF NOT EXISTS positions (
      id BIGSERIAL PRIMARY KEY,
      signal_id BIGINT,
      symbol TEXT NOT NULL,
      direction TEXT NOT NULL,
      strategy TEXT DEFAULT 'swing',
      quality TEXT,
      entry NUMERIC,
      sl NUMERIC,
      tp1 NUMERIC,
      tp2 NUMERIC,
      rr NUMERIC,
      qty NUMERIC,
      reasons JSONB,
      tp1_hit BOOLEAN DEFAULT false,
      bep_active BOOLEAN DEFAULT false,
      opened_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_positions_opened ON positions(opened_at DESC)`;

  // Trade yang sudah selesai — Win/Loss/BEP
  await sql`
    CREATE TABLE IF NOT EXISTS trades (
      id BIGSERIAL PRIMARY KEY,
      symbol TEXT NOT NULL,
      direction TEXT NOT NULL,
      strategy TEXT DEFAULT 'swing',
      quality TEXT,
      entry NUMERIC,
      exit_price NUMERIC,
      sl NUMERIC,
      tp1 NUMERIC,
      tp2 NUMERIC,
      pnl_usd NUMERIC,
      pnl_r NUMERIC,
      outcome TEXT,
      bep_done BOOLEAN DEFAULT false,
      opened_at TIMESTAMP,
      closed_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_trades_closed ON trades(closed_at DESC)`;

  // Referral tracking
  await sql`
    CREATE TABLE IF NOT EXISTS referrals (
      id BIGSERIAL PRIMARY KEY,
      referrer_id BIGINT NOT NULL,
      referred_id BIGINT NOT NULL UNIQUE,
      plan_purchased TEXT,
      commission_pct INTEGER DEFAULT 10,
      commission_paid BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

// ─── SIGNALS / TRADES / STATS ────────────────────────────────

export async function pushSignalDb(s: {
  symbol: string; direction: string; strategy?: string; quality?: string;
  score?: number; entry?: number; sl?: number; tp1?: number; tp2?: number;
  rr?: number; reasons?: string[]; executed?: boolean;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO signals (symbol, direction, strategy, quality, score, entry, sl, tp1, tp2, rr, reasons, executed)
    VALUES (${s.symbol}, ${s.direction}, ${s.strategy || 'swing'}, ${s.quality || null},
            ${s.score || null}, ${s.entry || null}, ${s.sl || null},
            ${s.tp1 || null}, ${s.tp2 || null}, ${s.rr || null},
            ${JSON.stringify(s.reasons || [])}, ${s.executed || false})
  `;
}

export async function pushTradeDb(t: {
  symbol: string; direction: string; strategy?: string; quality?: string;
  entry?: number; exit_price?: number; sl?: number; tp1?: number; tp2?: number;
  pnl_usd?: number; pnl_r?: number; outcome?: string; bep_done?: boolean;
  opened_at?: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO trades (symbol, direction, strategy, quality, entry, exit_price, sl, tp1, tp2,
                       pnl_usd, pnl_r, outcome, bep_done, opened_at)
    VALUES (${t.symbol}, ${t.direction}, ${t.strategy || 'swing'}, ${t.quality || null},
            ${t.entry || null}, ${t.exit_price || null}, ${t.sl || null},
            ${t.tp1 || null}, ${t.tp2 || null}, ${t.pnl_usd || null}, ${t.pnl_r || null},
            ${t.outcome || null}, ${t.bep_done || false},
            ${t.opened_at || null})
  `;
}

export async function getSignalsDb(limit = 50, status?: string) {
  const sql = getDb();
  if (status) {
    return await sql`SELECT * FROM signals WHERE status = ${status} ORDER BY created_at DESC LIMIT ${limit}`;
  }
  return await sql`SELECT * FROM signals ORDER BY created_at DESC LIMIT ${limit}`;
}

/** Update signal status (bot panggil saat limit fills / closed). */
export async function updateSignalStatusDb(symbol: string, status: string) {
  const sql = getDb();
  // Update signal pending terbaru untuk symbol ini (max 1)
  await sql`
    UPDATE signals SET status = ${status}
    WHERE id = (
      SELECT id FROM signals
      WHERE symbol = ${symbol} AND status = 'pending'
      ORDER BY created_at DESC LIMIT 1
    )
  `;
}

// ─── POSITIONS (running) ─────────────────────────────────────

export async function pushPositionDb(p: {
  symbol: string; direction: string; strategy?: string; quality?: string;
  entry?: number; sl?: number; tp1?: number; tp2?: number; rr?: number;
  qty?: number; reasons?: string[]; signal_id?: number;
}) {
  const sql = getDb();
  // Upsert by symbol — bot bisa update kalau posisi yang sama (e.g. tp1_hit, bep_active)
  await sql`
    INSERT INTO positions (symbol, direction, strategy, quality, entry, sl, tp1, tp2, rr, qty, reasons, signal_id)
    VALUES (${p.symbol}, ${p.direction}, ${p.strategy || 'swing'}, ${p.quality || null},
            ${p.entry || null}, ${p.sl || null}, ${p.tp1 || null}, ${p.tp2 || null},
            ${p.rr || null}, ${p.qty || null},
            ${JSON.stringify(p.reasons || [])}, ${p.signal_id || null})
    ON CONFLICT (symbol) DO UPDATE SET
      direction = EXCLUDED.direction,
      strategy = EXCLUDED.strategy,
      entry = EXCLUDED.entry,
      sl = EXCLUDED.sl,
      tp1 = EXCLUDED.tp1,
      tp2 = EXCLUDED.tp2,
      rr = EXCLUDED.rr,
      qty = EXCLUDED.qty,
      opened_at = NOW()
  `;
}

export async function updatePositionStateDb(symbol: string, opts: {
  tp1_hit?: boolean; bep_active?: boolean; sl?: number;
}) {
  const sql = getDb();
  if (opts.sl !== undefined) {
    await sql`UPDATE positions SET sl = ${opts.sl} WHERE symbol = ${symbol}`;
  }
  if (opts.tp1_hit !== undefined) {
    await sql`UPDATE positions SET tp1_hit = ${opts.tp1_hit} WHERE symbol = ${symbol}`;
  }
  if (opts.bep_active !== undefined) {
    await sql`UPDATE positions SET bep_active = ${opts.bep_active} WHERE symbol = ${symbol}`;
  }
}

export async function deletePositionDb(symbol: string) {
  const sql = getDb();
  await sql`DELETE FROM positions WHERE symbol = ${symbol}`;
}

export async function getPositionsDb() {
  const sql = getDb();
  return await sql`SELECT * FROM positions ORDER BY opened_at DESC`;
}

export async function getTradesDb(limit = 100) {
  const sql = getDb();
  return await sql`SELECT * FROM trades ORDER BY closed_at DESC LIMIT ${limit}`;
}

export async function getPerformanceStatsDb() {
  const sql = getDb();
  const today = await sql`
    SELECT COUNT(*) AS total, SUM(CASE WHEN pnl_usd > 0 THEN 1 ELSE 0 END) AS wins,
           SUM(pnl_usd) AS net_pnl
    FROM trades WHERE closed_at >= CURRENT_DATE
  `;
  const month = await sql`
    SELECT COUNT(*) AS total, SUM(CASE WHEN pnl_usd > 0 THEN 1 ELSE 0 END) AS wins,
           SUM(pnl_usd) AS net_pnl
    FROM trades WHERE closed_at >= DATE_TRUNC('month', CURRENT_DATE)
  `;
  const all = await sql`
    SELECT COUNT(*) AS total, SUM(CASE WHEN pnl_usd > 0 THEN 1 ELSE 0 END) AS wins,
           SUM(pnl_usd) AS net_pnl
    FROM trades
  `;
  return { today: today[0], month: month[0], all: all[0] };
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

/** Durasi langganan (days) berdasarkan plan key */
function getPlanDurationDays(plan: string): number {
  switch (plan) {
    case "m1": return 30;
    case "m3": return 90;
    case "y1": return 365;
    case "lt": return 36500;  // 100 tahun = lifetime
    default:   return 30;
  }
}

/** Set subscription (create new, expire old) */
export async function setSubscriptionDb(userId: number, plan: string, planName: string) {
  const sql = getDb();
  const days = getPlanDurationDays(plan);
  // Expire old subscriptions
  await sql`UPDATE subscriptions SET status = 'expired' WHERE user_id = ${userId} AND status = 'active'`;
  // Create new dengan durasi sesuai plan
  await sql`
    INSERT INTO subscriptions (user_id, plan, plan_name, expires_at)
    VALUES (${userId}, ${plan}, ${planName}, NOW() + (${days} || ' days')::INTERVAL)
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
