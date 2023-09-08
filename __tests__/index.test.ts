import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../src";

test("lambda function should return a value when invoked", async () => {
  const body = JSON.stringify({ message: "ok" });
  const event = {} as APIGatewayProxyEvent;
  expect(await handler(event)).toStrictEqual({
    statusCode: 200,
    body,
  });
});
