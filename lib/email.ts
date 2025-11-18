import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);

export async function sendNotificationEmail(
  to: string,
  subject: string,
  html: string
) {
  if (!process.env.EMAIL_SERVER || !process.env.EMAIL_FROM) {
    console.warn("Email configuration not set, skipping email notification");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function sendGroupInviteEmail(
  to: string,
  groupName: string,
  inviterName: string,
  joinLink: string
) {
  const subject = `You're invited to join ${groupName} on Christmas Wishlist`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">🎄 Christmas Wishlist Invitation</h1>
      <p>Hi there!</p>
      <p><strong>${inviterName}</strong> has invited you to join the group <strong>${groupName}</strong>.</p>
      <p>Join now to share your wishlist and see what others are wishing for!</p>
      <a href="${joinLink}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Accept Invitation
      </a>
      <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
    </div>
  `;

  await sendNotificationEmail(to, subject, html);
}

export async function sendItemClaimedEmail(
  to: string,
  itemName: string,
  claimerName: string
) {
  const subject = `Item claimed: ${itemName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">✓ Item Claimed!</h1>
      <p>Hi!</p>
      <p>You've successfully claimed <strong>${itemName}</strong>.</p>
      <p>Don't forget to purchase it before the holidays! 🎁</p>
    </div>
  `;

  await sendNotificationEmail(to, subject, html);
}

export async function sendFundingUpdateEmail(
  to: string,
  itemName: string,
  message: string
) {
  const subject = `Funding update: ${itemName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">💰 Funding Update</h1>
      <p>Hi!</p>
      <p>${message}</p>
      <p>Item: <strong>${itemName}</strong></p>
    </div>
  `;

  await sendNotificationEmail(to, subject, html);
}
