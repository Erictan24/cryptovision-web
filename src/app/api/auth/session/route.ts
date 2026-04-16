import { NextResponse } from "next/server";
import { getSession, deleteSession } from "@/lib/auth";

/** GET — return current session user (or null) */
export async function GET() {
  const user = await getSession();
  return NextResponse.json({ user });
}

/** DELETE — logout (clear cookie) */
export async function DELETE() {
  await deleteSession();
  return NextResponse.json({ ok: true });
}
