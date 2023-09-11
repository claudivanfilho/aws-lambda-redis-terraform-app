import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getLimiter, redis } from "./redis";
import { PLAN_PREFIX } from "./config";
import { checkMonthlyQuota } from "./quota";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const companyId = JSON.parse(event.body || "{}").companyId;

  if (!companyId) return getErrorResponse("companyId not provided");

  const timeStart = Date.now();
  const plan: string | null = await redis.get(`${PLAN_PREFIX}${companyId}`);
  if (!plan) return getErrorResponse("companyId does not have a plan attached");
  const limiter = await getLimiter(plan).get({ id: companyId });
  const timeEnd = Date.now();

  if (!limiter.remaining) return getErrorResponse("Rate limit reached");

  if (!(await checkMonthlyQuota(companyId, plan))) {
    return getErrorResponse("Monthly quota reached");
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "ok",
      redisTime: (timeEnd - timeStart) / 1000,
      remaining: limiter.remaining,
    }),
    headers: {
      "Access-Control-Allow-Origin": "https://claudivanfilho.github.io",
    },
  };
};

function getErrorResponse(message: string) {
  return {
    statusCode: 400,
    body: JSON.stringify({ message }),
    headers: {
      "Access-Control-Allow-Origin": "https://claudivanfilho.github.io",
    },
  };
}
