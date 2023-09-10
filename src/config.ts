import Redis from "ioredis";
import RateLimiter from "async-ratelimiter";

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
      max: 60,
      duration: 10_000,
    });
  }
  return new RateLimiter({
    db: redis,
    max: 2,
    duration: 10_000,
  });
}

export const PLAN_PREFIX = "plan_company_";
