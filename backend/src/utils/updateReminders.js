// src/utils/updateReminders.js
import { log } from "node:console";
import Customer from "../models/customer";

/**
 * items = [ { customerId, type: 'health'|'vehicle', index } ]
 */
export async function markItemsNotified(items) {
  const byCustomer = items.reduce((acc, it) => {
    acc[it.customerId] = acc[it.customerId] || [];
    acc[it.customerId].push(it);
    console.log(acc,"sample console me");    
    return acc;
  }, {});

  const ops = Object.entries(byCustomer).map(async ([custId, itemsForCustomer]) => {
    const customer = await Customer.findById(custId);
    if (!customer) return;
    const now = new Date();

    for (const it of itemsForCustomer) {
      if (it.type === "health" && customer.healthDetails && customer.healthDetails[it.index]) {
        customer.healthDetails[it.index].reminderSent = true;
        customer.healthDetails[it.index].reminderSentAt = now;
      } else if (it.type === "vehicle" && customer.vehicles && customer.vehicles[it.index]) {
        customer.vehicles[it.index].reminderSent = true;
        customer.vehicles[it.index].reminderSentAt = now;
      }
    }

    await customer.save();
  });

  await Promise.all(ops);
}
