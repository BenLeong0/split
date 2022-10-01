import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const adminRouter: Express = express();
adminRouter.use(express.json());

const prisma = new PrismaClient();

adminRouter.get("/all_users", async (req: Request, res: Response) => {
  const allUsers = await prisma.user.findMany();
  console.log(allUsers);
  res.send(allUsers);
});

adminRouter.get("/user/:userId", async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
  });
  console.log(user);
  res.send(user);
});

adminRouter.get("/all_groups", async (req: Request, res: Response) => {
  const allGroups = await prisma.group.findMany();
  console.log(allGroups);
  res.send(allGroups);
});

export default adminRouter;
