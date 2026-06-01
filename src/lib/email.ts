import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM ?? "Planet Raffle <noreply@planetraffle.co.uk>";
const APP    = process.env.NEXT_PUBLIC_APP_URL ?? "https://planetraffle.co.uk";

// ── Templates ─────────────────────────────────────────────────────────────────

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Planet Raffle</title>
  <style>
    body { margin:0; padding:0; background:#0a0a0a; font-family:system-ui,-apple-system,sans-serif; color:#fff; }
    .wrap { max-width:600px; margin:0 auto; padding:40px 24px; }
    .logo { font-size:28px; font-weight:800; color:#8b5cf6; letter-spacing:-1px; }
    .logo span { color:#fff; }
    .card { background:#111; border:1px solid #222; border-radius:16px; padding:32px; margin:24px 0; }
    h1 { font-size:24px; font-weight:700; margin:0 0 8px; }
    p  { color:#aaa; line-height:1.6; margin:0 0 16px; }
    .btn { display:inline-block; background:linear-gradient(135deg,#8b5cf6,#3b82f6); color:#fff; font-weight:700; font-size:16px; padding:14px 32px; border-radius:10px; text-decoration:none; }
    .highlight { color:#8b5cf6; font-weight:700; }
    .footer { color:#555; font-size:13px; text-align:center; margin-top:32px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">Planet <span>Raffle</span></div>
    ${content}
    <div class="footer">© ${new Date().getFullYear()} Planet Raffle · <a href="${APP}/terms" style="color:#555">Terms</a> · <a href="${APP}/faq" style="color:#555">FAQ</a></div>
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
    <div class="card" style="border-color:#8b5cf6">
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
      <h1>Welcome to Planet Raffle! 🎉</h1>
      <p>Hey ${name}, you're now part of the UK's most exciting raffle platform.</p>
      <p>Every ticket is just <span class="highlight">£1</span> — and the bigger your bundle, the more free tickets you get!</p>
      <p style="color:#aaa;font-size:13px">You can view your tickets, order history, and past wins any time from your dashboard.</p>
      <a href="${APP}" class="btn">Browse Live Raffles</a>
    </div>
  `);

  return resend.emails.send({ from: FROM, to, subject: "Welcome to Planet Raffle! 🎉", html });
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: { to: string; name: string; resetUrl: string }) {
  const html = baseTemplate(`
    <div class="card">
      <h1>Reset your password</h1>
      <p>Hey ${name}, we received a request to reset your Planet Raffle password.</p>
      <p>Click the button below to set a new password. This link expires in <span class="highlight">1 hour</span>.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p style="color:#555;font-size:13px;margin-top:24px">If you didn't request this, you can safely ignore this email — your password won't change.</p>
    </div>
  `);

  return resend.emails.send({ from: FROM, to, subject: "Reset your Planet Raffle password", html });
}

export async function sendAccountDeletedEmail({ to, name }: { to: string; name: string }) {
  const html = baseTemplate(`
    <div class="card">
      <h1>Account deleted</h1>
      <p>Hi ${name}, your Planet Raffle account has been permanently deleted as requested.</p>
      <p>All your personal data, tickets, and order history have been removed from our systems.</p>
      <p style="color:#aaa;font-size:13px">If you'd like to join again in the future, you're always welcome back.</p>
    </div>
  `);

  return resend.emails.send({ from: FROM, to, subject: "Your Planet Raffle account has been deleted", html });
}
