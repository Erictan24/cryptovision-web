import { NextRequest, NextResponse } from "next/server";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";

/**
 * GET /api/test-email?to=email@x.com&key=ADMIN_KEY
 *
 * Test endpoint untuk verify Resend integration tanpa flow /verify.
 * Admin-only via ADMIN_API_KEY (env var yang sama dgn /api/admin/grant).
 *
 * Return JSON dengan diagnostic detail:
 * - resendKeyPresent: true/false (apakah RESEND_API_KEY env terdeteksi)
 * - emailFromValue: nilai EMAIL_FROM
 * - sendResult: hasil sendEmail() — apakah Resend menerima request
 *
 * Use case: troubleshoot kenapa welcome email tidak masuk.
 */
export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to") || "";
  const key = req.nextUrl.searchParams.get("key") || "";

  const expected = process.env.ADMIN_API_KEY || "";
  if (!expected || key !== expected) {
    return NextResponse.json({ error: "Unauthorized — pass ?key=ADMIN_API_KEY" }, { status: 401 });
  }

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Invalid ?to= email param" }, { status: 400 });
  }

  const resendKeyPresent = !!process.env.RESEND_API_KEY;
  const resendKeyPrefix = process.env.RESEND_API_KEY
    ? process.env.RESEND_API_KEY.slice(0, 8) + "..."
    : null;
  const emailFromValue = process.env.EMAIL_FROM || "(not set, using default)";

  const { subject, html } = welcomeEmailHtml({
    userName: "Test User",
    planName: "Test Plan",
    expiresAt: "31 Desember 2030",
    locale: "id",
  });

  const sendResult = await sendEmail({ to, subject, html });

  return NextResponse.json({
    ok: true,
    diagnostic: {
      resendKeyPresent,
      resendKeyPrefix,
      emailFromValue,
      sendResult,
      to,
    },
    message: sendResult
      ? "Email sent — cek Resend Logs + inbox dalam 1-2 menit"
      : "sendEmail returned false — cek server logs untuk detail (kemungkinan API key salah atau Resend reject)",
  });
}
