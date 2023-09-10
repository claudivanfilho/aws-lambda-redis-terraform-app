import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../src";

test("rate limitting test", async () => {
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
