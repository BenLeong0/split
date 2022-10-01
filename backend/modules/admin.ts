import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import { authenticate } from "../shared";

dotenv.config();

const adminRouter: Express = express();
adminRouter.use(express.json());

const prisma = new PrismaClient();

adminRouter.use((req: Request, res: Response, next) => {
  authenticate(req)
    .then(({ role }) => {
      console.log(role);
      if (role !== "admin") throw Error();
    })
    .then(() => next())
    .catch(() => res.sendStatus(403));
});

adminRouter.post(
  "/make_admin",
  async (req: Request<{}, {}, { userId: string }>, res: Response) => {
    const { userId } = req.body;
    const newAdmin = await prisma.user.update({
      where: { id: userId },
      data: { role: "admin" },
    });
    console.log(newAdmin);
    res.send(newAdmin);
  }
);

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

adminRouter.get(
  "/all_group_memberships",
  async (req: Request, res: Response) => {
    const allGroupMemberships = await prisma.groupMembership.findMany();
    console.log(allGroupMemberships);
    res.send(allGroupMemberships);
  }
);

export default adminRouter;
