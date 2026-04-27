// Email helper — pakai Resend API.
// Setup: register di resend.com, dapat API key, set env RESEND_API_KEY.
// Kalau RESEND_API_KEY tidak di-set, semua call jadi no-op (fail-silent).

const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@cryptovision.app";
const RESEND_API = "https://api.resend.com/emails";

type SendOpts = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(opts: SendOpts): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — email skipped");
    return false;
  }

  try {
    const r = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    return r.ok;
  } catch (e) {
    console.error("[email] send failed", e);
    return false;
  }
}

/** Welcome email setelah subscription aktif. */
export function welcomeEmailHtml(opts: {
  userName: string;
  planName: string;
  expiresAt: string;
  locale?: "id" | "en";
}): { subject: string; html: string } {
  const isId = opts.locale !== "en";
  const subject = isId
    ? `Subscription ${opts.planName} aktif — Selamat datang!`
    : `Subscription ${opts.planName} active — Welcome!`;

  const greet = isId ? "Halo" : "Hello";
  const intro = isId
    ? `Subscription <strong>${opts.planName}</strong> kamu sudah aktif sampai <strong>${opts.expiresAt}</strong>.`
    : `Your <strong>${opts.planName}</strong> subscription is active until <strong>${opts.expiresAt}</strong>.`;
  const next = isId ? "Langkah selanjutnya:" : "Next steps:";
  const items = isId
    ? [
        "Buka <a href='https://cryptovision-web.vercel.app/dashboard/signals'>Dashboard Signals</a> untuk lihat sinyal real-time",
        "Notif Telegram otomatis terkirim setiap signal baru",
        "Cek <a href='https://cryptovision-web.vercel.app/glossary'>Glossary</a> untuk pelajari TP1/SL/BEP/RR",
      ]
    : [
        "Open <a href='https://cryptovision-web.vercel.app/dashboard/signals'>Dashboard Signals</a> for real-time signals",
        "Telegram notifications auto-send for every new signal",
        "Check <a href='https://cryptovision-web.vercel.app/glossary'>Glossary</a> to learn TP1/SL/BEP/RR",
      ];

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <h1 style="color: #3b9bd9;">CryptoVision</h1>
  <p>${greet} <strong>${opts.userName}</strong>,</p>
  <p>${intro}</p>
  <p>${next}</p>
  <ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>
  <p style="margin-top: 30px; color: #666; font-size: 12px;">
    ${isId
      ? "Performance lampau bukan jaminan masa depan. Trading futures berisiko tinggi."
      : "Past performance does not guarantee future results. Futures trading is high-risk."}
  </p>
</body>
</html>
  `.trim();

  return { subject, html };
}
