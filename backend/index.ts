import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import adminRouter from "./modules/admin";
import userRouter from "./modules/user";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use("/admin", adminRouter);
app.use("/user", userRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
