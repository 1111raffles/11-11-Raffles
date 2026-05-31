import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM ?? "Raffle Rumble <noreply@rafflerumble.com>";
const APP    = process.env.NEXT_PUBLIC_APP_URL ?? "https://rafflerumble.com";

// ── Templates ─────────────────────────────────────────────────────────────────

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Raffle Rumble</title>
  <style>
    body { margin:0; padding:0; background:#0a0a0a; font-family:system-ui,-apple-system,sans-serif; color:#fff; }
    .wrap { max-width:600px; margin:0 auto; padding:40px 24px; }
    .logo { font-size:28px; font-weight:800; color:#f59e0b; letter-spacing:-1px; }
    .logo span { color:#fff; }
    .card { background:#111; border:1px solid #222; border-radius:16px; padding:32px; margin:24px 0; }
    h1 { font-size:24px; font-weight:700; margin:0 0 8px; }
    p  { color:#aaa; line-height:1.6; margin:0 0 16px; }
    .btn { display:inline-block; background:#f59e0b; color:#000; font-weight:700; font-size:16px; padding:14px 32px; border-radius:10px; text-decoration:none; }
    .highlight { color:#f59e0b; font-weight:700; }
    .footer { color:#555; font-size:13px; text-align:center; margin-top:32px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">Raffle<span>Rumble</span></div>
    ${content}
    <div class="footer">© ${new Date().getFullYear()} Raffle Rumble · <a href="${APP}/terms" style="color:#555">Terms</a> · <a href="${APP}/faq" style="color:#555">FAQ</a></div>
  </div>
</body>
</html>`;
}

// ── Emails ────────────────────────────────────────────────────────────────────

export async function sendPurchaseConfirmation({
  to,
  name,
  raffleName,
  ticketNumbers,
  totalPaid,
  drawTime,
}: {
  to:            string;
  name:          string;
  raffleName:    string;
  ticketNumbers: number[];
  totalPaid:     number;
  drawTime:      Date;
}) {
  const ticketList = ticketNumbers
    .map((n) => `<span class="highlight">#${n}</span>`)
    .join(", ");

  const html = baseTemplate(`
    <div class="card">
      <h1>🎟️ You're in the draw!</h1>
      <p>Hey ${name}, your tickets for <strong>${raffleName}</strong> are confirmed.</p>
      <p>Your ticket numbers: ${ticketList}</p>
      <p>Amount paid: <span class="highlight">£${(totalPaid / 100).toFixed(2)}</span></p>
      <p>Draw time: <span class="highlight">${drawTime.toLocaleString("en-GB", { timeZone: "Europe/London" })}</span></p>
      <a href="${APP}/dashboard" class="btn">View My Tickets</a>
    </div>
    <p style="text-align:center;color:#555;font-size:13px">Good luck! 🤞</p>
  `);

  return resend.emails.send({ from: FROM, to, subject: `🎟️ ${ticketNumbers.length} ticket(s) confirmed — ${raffleName}`, html });
}

export async function sendDrawReminder({
  to,
  name,
  raffleName,
  ticketCount,
  drawTime,
}: {
  to:          string;
  name:        string;
  raffleName:  string;
  ticketCount: number;
  drawTime:    Date;
}) {
  const html = baseTemplate(`
    <div class="card">
      <h1>⏰ Draw starts soon!</h1>
      <p>Hey ${name}, the draw for <strong>${raffleName}</strong> is happening soon.</p>
      <p>You have <span class="highlight">${ticketCount} ticket(s)</span> in this draw.</p>
      <p>Draw time: <span class="highlight">${drawTime.toLocaleString("en-GB", { timeZone: "Europe/London" })}</span></p>
      <a href="${APP}" class="btn">Watch Live Draw</a>
    </div>
  `);

  return resend.emails.send({ from: FROM, to, subject: `⏰ Draw starting soon — ${raffleName}`, html });
}

export async function sendWinnerNotification({
  to,
  name,
  raffleName,
  ticketNumber,
  prizeDescription,
}: {
  to:               string;
  name:             string;
  raffleName:       string;
  ticketNumber:     number;
  prizeDescription: string;
}) {
  const html = baseTemplate(`
    <div class="card" style="border-color:#f59e0b">
      <h1>🏆 You won!</h1>
      <p>Congratulations <strong>${name}</strong>! Your ticket <span class="highlight">#${ticketNumber}</span> was drawn for <strong>${raffleName}</strong>.</p>
      <p style="color:#fff">${prizeDescription}</p>
      <a href="${APP}/dashboard" class="btn">Claim Your Prize</a>
    </div>
  `);

  return resend.emails.send({ from: FROM, to, subject: `🏆 You won ${raffleName}! 🎉`, html });
}

export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  const html = baseTemplate(`
    <div class="card">
      <h1>Welcome to Raffle Rumble! 🎉</h1>
      <p>Hey ${name}, you're now part of the UK's most exciting raffle platform.</p>
      <p>Every ticket is just <span class="highlight">£1</span> — and the bigger your bundle, the more free tickets you get!</p>
      <a href="${APP}" class="btn">Browse Live Raffles</a>
    </div>
  `);

  return resend.emails.send({ from: FROM, to, subject: "Welcome to Raffle Rumble! 🎉", html });
}
