import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const FROM_EMAIL = "Tunog Kalye Radio <noreply@hub.tunogkalye.net>";

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!resend) {
    console.warn("⚠️ RESEND_API_KEY not set — email skipped:", subject);
    return { success: false, message: "Email not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, message: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Email send failed";
    console.error("Email error:", msg);
    return { success: false, message: msg };
  }
}

// Helper to format price in PHP
function php(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── EMAIL TEMPLATES ─────────────────────────────────────

const emailBase = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tunog Kalye Radio</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#dc2626,#f97316);padding:30px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                📻 TUNOG KALYE <span style="opacity:0.8">RADIO</span>
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                Music from the streets, for the world.
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:30px 40px;color:#1a1a2e;line-height:1.6;font-size:15px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#6b7280;font-size:12px;">
                Tunog Kalye Radio &copy; ${new Date().getFullYear()} &middot; Surrey, BC, Canada<br>
                <a href="https://hub.tunogkalye.net" style="color:#dc2626;text-decoration:none;">hub.tunogkalye.net</a>
                &nbsp;&middot;&nbsp;
                <a href="https://www.tunogkalye.net" style="color:#dc2626;text-decoration:none;">www.tunogkalye.net</a>
              </p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;">
                You received this email because you have an account on Tunog Kalye Radio Hub.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const ctaButton = (text: string, url: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td align="center">
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#dc2626,#f97316);color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;

export const welcomeEmail = (name: string, role: string) => ({
  subject: `Welcome to Tunog Kalye Radio, ${name}! 🎵`,
  html: emailBase(`
    <h2 style="margin:0 0 16px;font-size:22px;">Kamusta, ${name}! 👋</h2>
    <p>Welcome to the <strong>Kanto</strong> — the heart of Filipino independent music.</p>
    ${
      role === "ARTIST"
        ? `
      <p>Your artist account has been created. Our team will review your profile and verify your account. Once verified, you can:</p>
      <ul style="padding-left:20px;">
        <li>List merchandise and earn from your music</li>
        <li>Set up Stripe Connect for automatic payouts (90% goes directly to you)</li>
        <li>Track orders, earnings, and fan engagement</li>
      </ul>
      ${ctaButton("Go to Artist Dashboard", `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/artist`)}
    `
        : `
      <p>Welcome to the community! You can now:</p>
      <ul style="padding-left:20px;">
        <li>Browse merch from Filipino indie artists</li>
        <li>Support the station through the Kanto Fund</li>
        <li>Leave reviews for products you love</li>
      </ul>
      ${ctaButton("Browse the Merch Store", `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/store`)}
    `
    }
    <p style="color:#6b7280;font-size:13px;margin-top:24px;">Music from the streets, for the world. 🇵🇭</p>
  `),
});

export const artistVerifiedEmail = (name: string, bandName: string) => ({
  subject: `🎉 You're Verified! Welcome to the Kanto, ${bandName}`,
  html: emailBase(`
    <h2 style="margin:0 0 16px;font-size:22px;">Great news, ${name}! 🎉</h2>
    <p><strong>${bandName}</strong> has been verified on Tunog Kalye Radio.</p>
    <p>You're now part of our growing family of Filipino independent artists. Here's what you can do:</p>
    <ol style="padding-left:20px;">
      <li style="margin-bottom:8px;"><strong>Set up Stripe Connect</strong> — Link your bank account for automatic payouts. You receive 90% of every sale instantly.</li>
      <li style="margin-bottom:8px;"><strong>Add your first product</strong> — Create merchandise listings with photos, sizes, and pricing.</li>
      <li style="margin-bottom:8px;"><strong>Share with your fans</strong> — Send them to your store page on hub.tunogkalye.net.</li>
    </ol>
    ${ctaButton("Go to Artist Dashboard", `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/artist`)}
    <p style="color:#6b7280;font-size:13px;margin-top:24px;">Remember: You retain 100% of your copyrights. Always. That's the Kanto way.</p>
  `),
});

export const orderConfirmationEmail = (
  name: string,
  orderNumber: string,
  items: { productName: string; quantity: number; unitPrice: number }[],
  total: number
) => ({
  subject: `Order Confirmed! 🛒 Order #${orderNumber}`,
  html: emailBase(`
    <h2 style="margin:0 0 16px;font-size:22px;">Thank you for your order, ${name}! 🛒</h2>
    <p>Your order <strong>#${orderNumber}</strong> has been placed successfully.</p>
    <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;margin:16px 0;">
      <tr style="background:#f9fafb;">
        <th style="text-align:left;padding:10px;font-size:13px;color:#6b7280;">Product</th>
        <th style="text-align:center;padding:10px;font-size:13px;color:#6b7280;">Qty</th>
        <th style="text-align:right;padding:10px;font-size:13px;color:#6b7280;">Price</th>
      </tr>
      ${items
        .map(
          (item) => `
        <tr>
          <td style="padding:10px;border-top:1px solid #e5e7eb;">${item.productName}</td>
          <td style="text-align:center;padding:10px;border-top:1px solid #e5e7eb;">${item.quantity}</td>
          <td style="text-align:right;padding:10px;border-top:1px solid #e5e7eb;">${php(item.unitPrice * item.quantity)}</td>
        </tr>`
        )
        .join("")}
      <tr>
        <td colspan="2" style="text-align:right;padding:12px;border-top:2px solid #1a1a2e;font-weight:bold;">Total</td>
        <td style="text-align:right;padding:12px;border-top:2px solid #1a1a2e;font-weight:bold;font-size:18px;color:#dc2626;">${php(total)}</td>
      </tr>
    </table>
    <p style="background:#fef3c7;padding:12px 16px;border-radius:8px;font-size:13px;color:#92400e;">
      💡 <strong>90% of your purchase goes directly to the artists.</strong> Thank you for supporting Filipino independent music!
    </p>
    ${ctaButton("Track My Order", `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/orders`)}
  `),
});

export const orderShippedEmail = (
  name: string,
  orderNumber: string,
  trackingNumber: string | null,
  artistName: string
) => ({
  subject: `📦 Your Order #${orderNumber} Has Been Shipped!`,
  html: emailBase(`
    <h2 style="margin:0 0 16px;font-size:22px;">Great news, ${name}! 📦</h2>
    <p><strong>${artistName}</strong> has shipped your order <strong>#${orderNumber}</strong>.</p>
    ${
      trackingNumber
        ? `
      <div style="background:#f0fdf4;padding:16px;border-radius:8px;border:1px solid #bbf7d0;margin:16px 0;">
        <p style="margin:0 0 4px;color:#166534;font-weight:bold;">Tracking Number</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#15803d;letter-spacing:0.5px;">${trackingNumber}</p>
      </div>
    `
        : ""
    }
    <p>Expected delivery: <strong>3-7 business days</strong> depending on your location.</p>
    <p>We'd love to hear what you think! Once you receive your order, consider leaving a review to help other fans discover great Filipino indie merch.</p>
    ${ctaButton("Leave a Review", `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/reviews`)}
  `),
});

export const newOrderForArtistEmail = (
  bandName: string,
  customerName: string,
  orderNumber: string,
  items: { productName: string; quantity: number; artistCut: number }[]
) => {
  const totalEarnings = items.reduce((sum, i) => sum + i.artistCut, 0);
  return {
    subject: `💰 New Order! #${orderNumber} — You've Got a Sale!`,
    html: emailBase(`
    <h2 style="margin:0 0 16px;font-size:22px;">Kamusta, ${bandName}! 💰</h2>
    <p><strong>${customerName}</strong> just purchased from your store!</p>
    <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;margin:16px 0;">
      <tr style="background:#f9fafb;">
        <th style="text-align:left;padding:10px;font-size:13px;color:#6b7280;">Product</th>
        <th style="text-align:center;padding:10px;font-size:13px;color:#6b7280;">Qty</th>
        <th style="text-align:right;padding:10px;font-size:13px;color:#6b7280;">Your Earnings</th>
      </tr>
      ${items
        .map(
          (item) => `
        <tr>
          <td style="padding:10px;border-top:1px solid #e5e7eb;">${item.productName}</td>
          <td style="text-align:center;padding:10px;border-top:1px solid #e5e7eb;">${item.quantity}</td>
          <td style="text-align:right;padding:10px;border-top:1px solid #e5e7eb;color:#16a34a;font-weight:600;">${php(item.artistCut)}</td>
        </tr>`
        )
        .join("")}
      <tr>
        <td colspan="2" style="text-align:right;padding:12px;border-top:2px solid #16a34a;font-weight:bold;">Total Earnings</td>
        <td style="text-align:right;padding:12px;border-top:2px solid #16a34a;font-weight:bold;font-size:18px;color:#16a34a;">${php(totalEarnings)}</td>
      </tr>
    </table>
    <div style="background:#eff6ff;padding:16px;border-radius:8px;border:1px solid #bfdbfe;margin:16px 0;">
      <p style="margin:0;color:#1e40af;font-weight:bold;">📦 Next Steps</p>
      <ol style="margin:8px 0 0;padding-left:20px;color:#1e3a8a;font-size:14px;">
        <li>Prepare and pack the order</li>
        <li>Ship within 3 business days</li>
        <li>Mark as shipped in your dashboard and provide a tracking number</li>
      </ol>
    </div>
    <p style="color:#6b7280;font-size:13px;">Your earnings will be automatically deposited to your linked bank account via Stripe Connect. 90% of every sale is yours, instantly.</p>
    ${ctaButton("View Order in Dashboard", `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/artist/orders`)}
  `),
  };
};

export const donationThankYouEmail = (name: string, amount: number, tier: string) => ({
  subject: `Maraming Salamat! 🙏 Your ${tier} Support Means the World`,
  html: emailBase(`
    <h2 style="margin:0 0 16px;font-size:22px;">Maraming Salamat, ${name}! 🙏</h2>
    <p>Your <strong>${tier}</strong> contribution of <strong style="color:#dc2626;font-size:18px;">${php(amount)}</strong> keeps the Kanto alive.</p>
    <p>Your generosity directly supports:</p>
    <ul style="padding-left:20px;">
      <li style="margin-bottom:8px;"><strong>24/7 OPM Broadcasting</strong> — Keeping Filipino indie music on air around the clock</li>
      <li style="margin-bottom:8px;"><strong>The Kanto Fund</strong> — Funding independent artists' next recording session, music video, or live gig</li>
      <li style="margin-bottom:8px;"><strong>The Community</strong> — Every dollar strengthens the Kanto for all of us</li>
    </ul>
    <p>🎤 You'll hear your name mentioned on air during our next broadcast!</p>
    ${ctaButton("Listen Live Now", "https://www.tunogkalye.net")}
    <p style="color:#6b7280;font-size:13px;margin-top:24px;">Music is better when it's shared. Salamat sa suporta! 🇵🇭</p>
  `),
});

export const submissionReceivedEmail = (name: string, bandName: string) => ({
  subject: `🎵 We Got Your Demo, ${bandName}!`,
  html: emailBase(`
    <h2 style="margin:0 0 16px;font-size:22px;">Kamusta, ${name}! 🎵</h2>
    <p>We received your music submission for <strong>${bandName}</strong>.</p>
    <p>Here's what happens next:</p>
    <ol style="padding-left:20px;">
      <li style="margin-bottom:8px;"><strong>This Week:</strong> Our team of DJs and curators will review your submission. Real humans — not algorithms.</li>
      <li style="margin-bottom:8px;"><strong>When Approved:</strong> We'll email you with the good news and schedule your song into rotation.</li>
      <li style="margin-bottom:8px;"><strong>On Air:</strong> Your music reaches listeners across Canada, the Philippines, and beyond.</li>
    </ol>
    <p style="background:#fef3c7;padding:12px 16px;border-radius:8px;font-size:13px;color:#92400e;">
      🎸 You keep <strong>100% of your copyrights</strong>. Always. We only ask for non-exclusive digital broadcasting rights.
    </p>
    ${ctaButton("Listen to the Station", "https://www.tunogkalye.net")}
  `),
});
