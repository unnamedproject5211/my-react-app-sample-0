// src/utils/dateUtils.ts
export function isExpiringSoon(date: string, days = 30): boolean {
  if (!date) return false;
  const expiry = new Date(date);
  if (isNaN(expiry.getTime())) return false;

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetDate = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());

  const diffMs = targetDate.getTime() - startOfToday.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= days;
}
