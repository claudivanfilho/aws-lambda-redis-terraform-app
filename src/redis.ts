import Redis from "ioredis";
import RateLimiter from "async-ratelimiter";
import { FREE_PLAN, PAID_PLAN } from "./plans";

export const redis =
  process.env.NODE_ENV === "test"
    ? new Redis({
        host: "localhost",
        port: 6379,
      })
    : new Redis(process.env.REDIS_DB_PATH!);

export function getLimiter(plan: string) {
  if (plan === "paid") {
    return new RateLimiter({
      db: redis,
      max: PAID_PLAN.max,
      duration: PAID_PLAN.duration,
    });
  }
  return new RateLimiter({
    db: redis,
    max: FREE_PLAN.max,
    duration: FREE_PLAN.duration,
  });
}
