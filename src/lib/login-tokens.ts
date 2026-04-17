/**
 * In-memory login token store.
 * Token flow: bot generates token → user clicks link → website verifies token → login.
 *
 * Tokens expire after 5 minutes. In production with multiple Vercel instances,
 * this should be replaced with Redis/DB. For now, single-instance is fine.
 */

type TokenData = {
  userId: number;
  name: string;
  username?: string;
  photo?: string;
  createdAt: number;
};

const tokens = new Map<string, TokenData>();

const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Store a login token (called by bot via API) */
export function storeToken(token: string, data: TokenData): void {
  // Cleanup expired tokens
  const now = Date.now();
  for (const [k, v] of tokens) {
    if (now - v.createdAt > TOKEN_TTL_MS) tokens.delete(k);
  }
  tokens.set(token, { ...data, createdAt: now });
}

/** Verify and consume a login token (one-time use) */
export function consumeToken(token: string): TokenData | null {
  const data = tokens.get(token);
  if (!data) return null;

  // Check expiry
  if (Date.now() - data.createdAt > TOKEN_TTL_MS) {
    tokens.delete(token);
    return null;
  }

  // One-time use: delete after consuming
  tokens.delete(token);
  return data;
}
