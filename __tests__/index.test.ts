import { PLAN_PREFIX, redis } from "./../src/config";
import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../src";

beforeAll(async () => {
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
