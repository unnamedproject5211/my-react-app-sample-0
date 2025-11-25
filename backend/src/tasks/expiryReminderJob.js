// tasks/expiryReminderJob.js
import cron from "node-cron";
import { findExpiringPolicyItemsGroupedByUser } from "../utils/policyUtils.js";
import { sendExpiryReminderEmail } from "../utils/emailReminder.ts"; // adjust path
import { markItemsNotified } from "../utils/updateReminders.js";

export function startExpiryReminderJob() {
  // Run daily at 09:00 IST
  cron.schedule("*/3 * * * *", async () => {
    console.log("Running expiry reminder job...");
    try {
      const grouped = await findExpiringPolicyItemsGroupedByUser({ withinDays: 30, skipIfRecentlyNotifiedDays: 7 });

      for (const [userEmail, payload] of Object.entries(grouped)) {
        const items = payload.items;
        const ok = await sendExpiryReminderEmail(userEmail, items);
        if (ok) {
          const flat = items.map(it => ({ customerId: it.customerId, type: it.type, index: it.index }));
          await markItemsNotified(flat);
        } else {
          console.error(`Failed to send reminders to ${userEmail}`);
        }
      }

      console.log("Expiry reminder job finished.");
    } catch (err) {
      console.error("Expiry reminder job failed:", err);
    }
  }, { scheduled: true, timezone: "Asia/Kolkata" });
}
