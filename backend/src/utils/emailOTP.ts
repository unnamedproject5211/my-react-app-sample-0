// src/utils/emailSMTP.ts
import axios from "axios";

/**
 * Send OTP using Brevo (Sendinblue) HTTP API.
 * Requires BREVO_API_KEY and FROM_EMAIL in environment variables.
 * not real
 */

const BREVO_API = "https://api.brevo.com/v3/smtp/email";
const API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER;

if (!API_KEY) {
  console.warn("⚠️ BREVO_API_KEY is not set. Emails will fail.");
}

export const sendOtpEmail = async (to: string, otp: string) => {
  try {
    const payload = {
      sender: { email: FROM_EMAIL },
      to: [{ email: to }],
      subject: "Your verification code",
      htmlContent: `<p>Your verification code is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`,
    };

    const res = await axios.post(BREVO_API, payload, {
      headers: {
        "api-key": API_KEY || "",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    });

    console.log("✅ Brevo email sent:", res.data.messageId || res.status);
    return true;
  } catch (err: any) {
    console.error("❌ Brevo sendOtpEmail error:", err?.response?.data || err.message || err);
    throw err; // let controller handle failure
  }
};
