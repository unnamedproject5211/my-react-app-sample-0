// src/utils/emailReminder.ts
import axios from "axios";

const BREVO_API = "https://api.brevo.com/v3/smtp/email";
const API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || "no-reply@yourapp.com";

if (!API_KEY) {
  console.warn("⚠️ BREVO_API_KEY is not set. Reminder emails will fail.");
}

/**
 * items: array of { customerName, expiryDate (ISO string or Date), type, label }
 */
export const sendExpiryReminderEmail = async (to: string, items: Array<any>) => {
  if (!items || items.length === 0) return true;

  const listHtml = items
    .map(it => {
      const dateStr = new Date(it.expiryDate).toISOString().split("T")[0];
      return `<li><strong>${it.customerName}</strong> — ${it.label} (${it.type}) — expires on <b>${dateStr}</b></li>`;
    })
    .join("");

  const payload = {
    sender: { email: FROM_EMAIL },
    to: [{ email: to }],
    subject: "Policy Expiry Reminder",
    htmlContent: `
      <p>Hello,</p>
      <p>The following customer policies are expiring within the next 30 days:</p>
      <ul>${listHtml}</ul>
      <p>Please contact your customers to renew their policies.</p>
      <p>Thanks,<br/>Your Insurance App</p>
    `,
    textContent: "Some of your customer policies are expiring soon. Please check your dashboard."
  };

  try {
    const res = await axios.post(BREVO_API, payload, {
      headers: {
        "api-key": API_KEY || "",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000
    });

    console.log("📧 Brevo sendExpiryReminderEmail:", res.data && (res.data.messageId || res.status));
    return true;
  } catch (err: any) {
    console.error("❌ Brevo sendExpiryReminderEmail error:", err?.response?.data || err.message || err);
    return false;
  }
};
