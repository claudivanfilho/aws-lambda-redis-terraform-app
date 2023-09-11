import * as dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import { handler } from "../src";

// Create an Express application
const app = express();
const port = 3000;

app.use(
  cors({
    origin: "*",
  })
);
// Middleware to parse JSON requests
app.use(express.json());

// Define a POST route at /lambda
app.post("/lambda", async (req: Request, res: Response) => {
  const result = await handler({ body: JSON.stringify(req.body) } as any);
  return res
    .header("Access-Control-Allow-Origin", "*")
    .status(result.statusCode)
    .json(JSON.parse(result.body));
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
