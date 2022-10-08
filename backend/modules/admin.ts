import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { GroupMembership, User } from "@prisma/client";

import prisma from "../shared/prisma-client";

import {
  SplitResponse,
  authenticate,
  generateErrorResponse,
  generateSuccessfulResponse,
  getGroupDetails,
} from "../shared/utils";
import { GroupDetails } from "../types";
import { CreateUserRequestBody, createUser, generateAccessToken } from "./user";

dotenv.config();

const adminRouter: Express = express();
adminRouter.use(express.json());

adminRouter.use((req: Request, res: Response, next) => {
  authenticate(req)
    .then(({ role }) => {
      if (role !== "admin") throw new Error("not an admin");
      next();
    })
    .catch(() => res.sendStatus(403));
});

adminRouter.post(
  "/make_admin",
  async (
    req: Request<{}, {}, { userId: string }>,
    res: SplitResponse<User>
  ) => {
    const { userId } = req.body;
    const newAdmin = await prisma.user.update({
      where: { id: userId },
      data: { role: "admin" },
    });
    console.log(newAdmin);
    res.send(generateSuccessfulResponse(newAdmin));
  }
);

adminRouter.post(
  "/create_user",
  async (
    req: Request<{}, {}, CreateUserRequestBody>,
    res: SplitResponse<string>
  ) => {
    const { email, name } = req.body;
    createUser(email, name)
      .then((user) => generateAccessToken(user.id))
      .then((accessToken) => res.send(generateSuccessfulResponse(accessToken)))
      .catch((e: Error) =>
        res.status(400).send(generateErrorResponse(e.message))
      );
  }
);

adminRouter.get(
  "/all_users",
  async (req: Request, res: SplitResponse<User[]>) => {
    const allUsers = await prisma.user.findMany();
    console.log(allUsers);
    res.send(generateSuccessfulResponse(allUsers));
  }
);

adminRouter.get("/user/:userId", async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
  });
  console.log(user);
  res.send(user);
});

adminRouter.get(
  "/all_groups",
  async (req: Request, res: SplitResponse<GroupDetails[]>) => {
    const allGroups = await prisma.group.findMany();
    const allGroupDetails = await Promise.all(
      allGroups.map(async (group) => await getGroupDetails(group.id))
    );
    console.log(allGroupDetails);
    res.send(generateSuccessfulResponse(allGroupDetails));
  }
);

adminRouter.get(
  "/all_group_memberships",
  async (req: Request, res: SplitResponse<GroupMembership[]>) => {
    const allGroupMemberships = await prisma.groupMembership.findMany();
    console.log(allGroupMemberships);
    res.send(generateSuccessfulResponse(allGroupMemberships));
  }
);

export default adminRouter;
