import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { storeToken, consumeToken } from "@/lib/login-tokens";
import { createSession, type SessionUser } from "@/lib/auth";

/**
 * POST /api/auth/token — Generate login token (called by Telegram bot).
 *
 * Body: { user_id, name, username?, photo?, secret }
 * secret = HMAC-SHA256(user_id, bot_token) — proves request is from our bot.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, name, username, photo, secret } = body;

    if (!user_id || !name || !secret) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify the request is from our bot
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    const expectedSecret = crypto
      .createHmac("sha256", botToken)
      .update(String(user_id))
      .digest("hex");

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate one-time token
    const token = crypto.randomBytes(32).toString("hex");
    storeToken(token, {
      userId: user_id,
      name,
      username,
      photo,
      createdAt: Date.now(),
    });

    // Build login URL
    const origin = req.nextUrl.origin;
    const loginUrl = `${origin}/auth?token=${token}`;

    return NextResponse.json({ ok: true, token, url: loginUrl });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/auth/token?token=xxx — Verify token and create session.
 * Called when user clicks login link from Telegram.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 400 });
  }

  const data = consumeToken(token);
  if (!data) {
    return NextResponse.json(
      { error: "Token expired or invalid" },
      { status: 401 },
    );
  }

  // Create session
  const user: SessionUser = {
    id: data.userId,
    name: data.name,
    username: data.username,
    photo: data.photo,
    provider: "telegram",
  };
  await createSession(user);

  return NextResponse.json({ ok: true, user });
}
