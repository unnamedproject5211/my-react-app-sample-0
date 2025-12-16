// src/utils/updateReminders.js
import Customer from "../models/customer";

/**
 * items = [ { customerId, type: 'health'|'vehicle', index } ]
 */
export async function markItemsNotified(items) {
  const byCustomer = items.reduce((acc, it) => {
    acc[it.customerId] = acc[it.customerId] || [];
    acc[it.customerId].push(it);
    return acc;
  }, {});

  const now = new Date();

  const ops = Object.entries(byCustomer).flatMap(([custId, itemsForCustomer]) => {
    return itemsForCustomer.map((it) => {
      if (it.type === "health") {
        return Customer.updateOne(
          { _id: custId },
          {
            $set: {
              [`healthDetails.${it.index}.reminderSent`]: true,
              [`healthDetails.${it.index}.reminderSentAt`]: now,
            },
          }
        );
      }

      if (it.type === "vehicle") {
        return Customer.updateOne(
          { _id: custId },
          {
            $set: {
              [`vehicles.${it.index}.reminderSent`]: true,
              [`vehicles.${it.index}.reminderSentAt`]: now,
            },
          }
        );
      }

      return null;
    });
  }).filter(Boolean);

  await Promise.all(ops);
}
