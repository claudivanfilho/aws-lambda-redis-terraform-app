import { redis } from "../src/redis";
import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../src";

import { PLAN_PREFIX } from "../src/config";

jest.mock("../src/plans", () => {
  return {
    FREE_PLAN: {
      max: 2,
      duration: 10_000,
      monthlyQuota: 1000,
    },
    PAID_PLAN: {
      max: 60,
      duration: 10_000,
      monthlyQuota: 5,
    },
  };
});

beforeEach(async () => {
  await redis.flushall();
  await redis.set(`${PLAN_PREFIX}1`, "paid");
  await redis.set(`${PLAN_PREFIX}2`, "free");
});

test("should return error 400 when reach the rate limit", async () => {
  const event = {
    body: JSON.stringify({ companyId: "2" }),
  } as APIGatewayProxyEvent;
  const result1 = await handler(event);
  const result2 = await handler(event);
  const result3 = await handler(event);

  expect(result1).toEqual(
    expect.objectContaining({
      statusCode: 200,
    })
  );
  expect(result2).toEqual(
    expect.objectContaining({
      statusCode: 200,
    })
  );
  expect(result3).toEqual(
    expect.objectContaining({
      statusCode: 400,
    })
  );
});

test("should return 200 when not reach the rate limit", async () => {
  const event = {
    body: JSON.stringify({ companyId: "1" }),
  } as APIGatewayProxyEvent;
  const result1 = await handler(event);
  const result2 = await handler(event);
  const result3 = await handler(event);

  expect(result1).toEqual(
    expect.objectContaining({
      statusCode: 200,
    })
  );
  expect(result2).toEqual(
    expect.objectContaining({
      statusCode: 200,
    })
  );
  expect(result3).toEqual(
    expect.objectContaining({
      statusCode: 200,
    })
  );
});

test("should return error when monthly quota reached the limit", async () => {
  const event = {
    body: JSON.stringify({ companyId: "1" }),
  } as APIGatewayProxyEvent;
  await Promise.all([handler(event), handler(event), handler(event), handler(event)]);
  const result5 = await handler(event);
  const result6 = await handler(event);

  expect(result5).toEqual(
    expect.objectContaining({
      statusCode: 200,
    })
  );

  expect(result6).toStrictEqual(
    expect.objectContaining({
      statusCode: 400,
      body: JSON.stringify({ message: "Monthly quota reached" }),
    })
  );
});
