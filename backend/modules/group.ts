import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import {
  authenticate,
  generateErrorResponse,
  generateSuccessfulResponse,
} from "../shared";

dotenv.config();

const groupRouter: Express = express();
groupRouter.use(express.json());

const prisma = new PrismaClient();

// TYPES

interface CreateGroupRequestBody {
  name: string;
}

// ROUTES

groupRouter.post(
  "/create",
  (req: Request<{}, {}, CreateGroupRequestBody>, res: Response) => {
    const { name } = req.body;

    authenticate(req)
      .then((creatorId) => createGroup(name, creatorId))
      .then((groupId) => {
        res.send(generateSuccessfulResponse({ groupId }));
      })
      .catch(() =>
        res.status(401).send(generateErrorResponse("unable to create group"))
      );
  }
);

// HELPERS

const createGroup = async (name: string, creator: string) => {
  const group = await prisma.group.create({ data: { name, creator } });

  const { id: groupId } = group;
  await createGroupMembership(groupId, creator, "creator");

  return groupId;
};

const createGroupMembership = async (
  groupId: string,
  userId: string,
  role?: string
) => {
  await prisma.groupMembership.create({ data: { groupId, userId, role } });
};

export default groupRouter;
