import { FREE_PLAN, PAID_PLAN } from "./plans";
import { redis } from "./redis";

export async function checkMonthlyQuota(companyId: string, plan: string) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are 0-based, so add 1

  const key = `quota:${companyId}:${currentMonth}`;
  const quota = plan === "paid" ? PAID_PLAN.monthlyQuota : FREE_PLAN.monthlyQuota; // Monthly quota limit

  // Increment the request count for the current month
  await redis.incr(key);

  // Get the current request count for the month
  const requestCount = await redis.get(key);

  // Check if the quota has been exceeded
  if (+requestCount! > quota) {
    return false; // Quota exceeded
  }

  return true; // Quota not exceeded
}
