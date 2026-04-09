import { prisma } from "@/lib/db";
import { sendEmail, welcomeEmail, artistVerifiedEmail, orderConfirmationEmail, orderShippedEmail, newOrderForArtistEmail, donationThankYouEmail, submissionReceivedEmail } from "@/lib/email";

// Generic notification: DB + Email
export async function notifyUser(
  userId: number,
  opts: {
    title: string;
    message: string;
    type: "ORDER" | "PAYMENT" | "SHIPMENT" | "SYSTEM";
    link?: string;
    // Email-specific
    sendEmail?: boolean;
    emailTemplate?: "welcome" | "verified" | "orderConfirmed" | "orderShipped" | "newOrder" | "donation" | "submission";
    emailData?: Record<string, unknown>;
  }
) {
  try {
    // 1. Save notification to database
    await prisma.notification.create({
      data: {
        userId,
        title: opts.title,
        message: opts.message,
        type: opts.type,
        link: opts.link,
      },
    });
  } catch (err) {
    console.error("Failed to save notification:", err);
  }

  // 2. Send email
  if (opts.sendEmail && opts.emailTemplate) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.email) return;

      let email: { subject: string; html: string } | null = null;

      switch (opts.emailTemplate) {
        case "welcome":
          email = welcomeEmail(user.name || "there", opts.emailData?.role as string || "CUSTOMER");
          break;
        case "verified":
          email = artistVerifiedEmail(user.name || "there", (opts.emailData?.bandName as string) || "Artist");
          break;
        case "orderConfirmed":
          email = orderConfirmationEmail(
            user.name || "there",
            (opts.emailData?.orderNumber as string) || "",
            (opts.emailData?.items as { productName: string; quantity: number; unitPrice: number }[]) || [],
            (opts.emailData?.total as number) || 0
          );
          break;
        case "orderShipped":
          email = orderShippedEmail(
            user.name || "there",
            (opts.emailData?.orderNumber as string) || "",
            (opts.emailData?.trackingNumber as string) || null,
            (opts.emailData?.artistName as string) || "the artist"
          );
          break;
        case "newOrder":
          email = newOrderForArtistEmail(
            (opts.emailData?.bandName as string) || "Artist",
            (opts.emailData?.customerName as string) || "A customer",
            (opts.emailData?.orderNumber as string) || "",
            (opts.emailData?.items as { productName: string; quantity: number; artistCut: number }[]) || []
          );
          break;
        case "donation":
          email = donationThankYouEmail(
            user.name || "there",
            (opts.emailData?.amount as number) || 0,
            (opts.emailData?.tier as string) || "Supporter"
          );
          break;
        case "submission":
          email = submissionReceivedEmail(
            user.name || "there",
            (opts.emailData?.bandName as string) || "Artist"
          );
          break;
      }

      if (email) {
        await sendEmail({ to: user.email, subject: email.subject, html: email.html });
      }
    } catch (err) {
      console.error("Failed to send notification email:", err);
    }
  }
}

// Convenience functions
export async function notifyWelcome(userId: number, role: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return notifyUser(userId, {
    title: "Welcome to Tunog Kalye Radio!",
    message: "Your account has been created. Welcome to the Kanto!",
    type: "SYSTEM",
    sendEmail: true,
    emailTemplate: "welcome",
    emailData: { role },
  });
}

export async function notifyArtistVerified(artistUserId: number, bandName: string) {
  return notifyUser(artistUserId, {
    title: "Artist Account Verified! 🎉",
    message: `Congratulations! Your artist profile "${bandName}" has been verified.`,
    type: "SYSTEM",
    link: "/artist",
    sendEmail: true,
    emailTemplate: "verified",
    emailData: { bandName },
  });
}

export async function notifyOrderConfirmed(customerId: number, order: {
  id: number;
  orderNumber: string;
  totalAmount: number;
  orderItems: { productName: string; quantity: number; unitPrice: number }[];
}) {
  return notifyUser(customerId, {
    title: `Order Confirmed: #${order.orderNumber}`,
    message: `Your order #${order.orderNumber} has been placed successfully!`,
    type: "ORDER",
    link: `/dashboard/orders/${order.id}`,
    sendEmail: true,
    emailTemplate: "orderConfirmed",
    emailData: {
      orderNumber: order.orderNumber,
      total: order.totalAmount,
      items: order.orderItems,
    },
  });
}

export async function notifyOrderShipped(customerId: number, order: {
  id: number;
  orderNumber: string;
}, trackingNumber: string | null, artistName: string) {
  return notifyUser(customerId, {
    title: `Order Shipped: #${order.orderNumber}`,
    message: `Your order has been shipped by ${artistName}. ${trackingNumber ? `Tracking: ${trackingNumber}` : ""}`,
    type: "SHIPMENT",
    link: `/dashboard/orders/${order.id}`,
    sendEmail: true,
    emailTemplate: "orderShipped",
    emailData: {
      orderNumber: order.orderNumber,
      trackingNumber,
      artistName,
    },
  });
}

export async function notifyArtistNewOrder(artistUserId: number, order: {
  id: number;
  orderNumber: string;
}, customerName: string, items: { productName: string; quantity: number; artistCut: number }[], bandName: string) {
  return notifyUser(artistUserId, {
    title: `New Sale! Order #${order.orderNumber}`,
    message: `${customerName} just purchased from your store!`,
    type: "ORDER",
    link: "/artist/orders",
    sendEmail: true,
    emailTemplate: "newOrder",
    emailData: {
      bandName,
      customerName,
      orderNumber: order.orderNumber,
      items,
    },
  });
}

export async function notifyDonationThankYou(userId: number | null, amount: number, tier: string) {
  if (!userId) return;
  return notifyUser(userId, {
    title: `Thank you for your ${tier} support! 🙏`,
    message: `Your ${tier} contribution of ₱${amount} means the world. Maraming salamat!`,
    type: "PAYMENT",
    sendEmail: true,
    emailTemplate: "donation",
    emailData: { amount, tier },
  });
}

export async function notifySubmissionReceived(userId: number | null, bandName: string) {
  if (!userId) return;
  return notifyUser(userId, {
    title: "Demo Received! 🎵",
    message: `We got your submission for "${bandName}". Our DJs will review it this week.`,
    type: "SYSTEM",
    sendEmail: true,
    emailTemplate: "submission",
    emailData: { bandName },
  });
}
