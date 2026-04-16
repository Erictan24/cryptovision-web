import { NextRequest, NextResponse } from "next/server";
import {
  verifyTelegramAuth,
  createSession,
  type TelegramUser,
  type SessionUser,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const data: TelegramUser = await req.json();

    // Verify Telegram hash
    if (!verifyTelegramAuth(data)) {
      return NextResponse.json(
        { error: "Invalid Telegram authentication" },
        { status: 401 },
      );
    }

    // Build session user
    const user: SessionUser = {
      id: data.id,
      name: [data.first_name, data.last_name].filter(Boolean).join(" "),
      username: data.username,
      photo: data.photo_url,
      provider: "telegram",
    };

    // Create JWT session
    await createSession(user);

    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
