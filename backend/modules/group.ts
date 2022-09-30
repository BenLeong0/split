import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const groupRouter: Express = express();
groupRouter.use(express.json());

const prisma = new PrismaClient();

groupRouter.post("create", (req: Request, res: Response) => {
  res.send("yo");
});

export default groupRouter;
