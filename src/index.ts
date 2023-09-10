import * as dotenv from "dotenv";
dotenv.config();

import { Ratelimit } from "@upstash/ratelimit";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = {
  free: new Ratelimit({
    redis,
    analytics: true,
    prefix: "ratelimit:free",
    limiter: Ratelimit.slidingWindow(2, "10s"),
    ephemeralCache: new Map(),
  }),
  paid: new Ratelimit({
    redis,
    analytics: true,
    prefix: "ratelimit:paid",
    limiter: Ratelimit.slidingWindow(60, "10s"),
    ephemeralCache: new Map(),
  }),
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const companyId = JSON.parse(event.body || "{}").companyId;

  if (!companyId) return getErrorResponse("companyId not provided");

  const timeStart = Date.now();
  const plan: "free" | "paid" | null = await redis.get(`plan_company_${companyId}`);
  if (!plan) return getErrorResponse("companyId does not have a plan attached");
  const { success } = await ratelimit[plan].limit(companyId);
  const timeEnd = Date.now();

  if (!success) return getErrorResponse("Rate limit reached");

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "ok", redisTime: (timeEnd - timeStart) / 1000 }),
  };
};

function getErrorResponse(message: string) {
  return {
    statusCode: 400,
    body: JSON.stringify({ message }),
  };
}
