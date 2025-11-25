// src/utils/policyUtils.js
import Customer from "../models/customer";// adjust import path if needed

export function isExpiringWithin(dateOrNull, days = 30) {
  if (!dateOrNull) return false;
  const expiry = (dateOrNull instanceof Date) ? dateOrNull : new Date(dateOrNull);
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return expiry > now && expiry <= end;
}

/**
 * Returns: { userIdString: { email, items: [ { customerId, customerName, index, type, label, expiryDate } ] } }
 */
export async function findExpiringPolicyItemsGroupedByUser({ withinDays = 30, skipIfRecentlyNotifiedDays = 7 } = {}) {
  // lean() is optional; we convert nested values below
  const customers = await Customer.find().populate("userId", "email").lean();
  const now = new Date();
  const recentThreshold = skipIfRecentlyNotifiedDays * 24 * 60 * 60 * 1000;
  const byUser = {};

  for (const c of customers) {
    const userEmail = c.userId?.email;
    if (!userEmail) continue;

    // healthDetails
    if (Array.isArray(c.healthDetails)) {
      c.healthDetails.forEach((h, idx) => {
        const expiry = h?.expiry ? new Date(h.expiry) : null;
        const recentlyNotified = h?.reminderSentAt ? (now - new Date(h.reminderSentAt) < recentThreshold) : false;
        if (isExpiringWithin(expiry, withinDays) && !h?.reminderSent && !recentlyNotified) {
          const item = {
            customerId: c._id,
            customerName: c.customerName,
            type: "health",
            index: idx,
            label: h.product || h.company || "Health Policy",
            expiryDate: expiry
          };
          byUser[userEmail] = byUser[userEmail] || { email: userEmail, items: [] };
          byUser[userEmail].items.push(item);
        }
      });
    }

    // vehicles
    if (Array.isArray(c.vehicles)) {
      c.vehicles.forEach((v, idx) => {
        const expiry = v?.policyExpiry ? new Date(v.policyExpiry) : null;
        const recentlyNotified = v?.reminderSentAt ? (now - new Date(v.reminderSentAt) < recentThreshold) : false;
        if (isExpiringWithin(expiry, withinDays) && !v?.reminderSent && !recentlyNotified) {
          const item = {
            customerId: c._id,
            customerName: c.customerName,
            type: "vehicle",
            index: idx,
            label: v.policyCompany || v.vehicleNo || "Vehicle Policy",
            expiryDate: expiry
          };
          byUser[userEmail] = byUser[userEmail] || { email: userEmail, items: [] }; // this line gives you clarity when you understand the looping in this 
          byUser[userEmail].items.push(item);
        }
      });
    }
  }

  return byUser; // keyed by email -> { email, items }
}
