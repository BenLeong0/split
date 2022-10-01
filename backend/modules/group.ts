import express, { Express, Request, response, Response } from "express";
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

interface JoinGroupRequestBody {
  groupId: string;
}

interface LeaveGroupRequestBody {
  groupId: string;
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

groupRouter.post(
  "/join",
  (req: Request<{}, {}, JoinGroupRequestBody>, res: Response) => {
    const { groupId } = req.body;

    authenticate(req)
      .then((userId) => createGroupMembership(groupId, userId))
      .then(() => res.send(generateSuccessfulResponse({ groupId })))
      .catch(() =>
        res.status(401).send(generateErrorResponse("unable to join group"))
      );
  }
);

groupRouter.post(
  "/leave",
  (req: Request<{}, {}, LeaveGroupRequestBody>, res: Response) => {
    const { groupId } = req.body;

    authenticate(req)
      .then((userId) => deleteGroupMembership(groupId, userId))
      .then(() => res.send(generateSuccessfulResponse({ groupId })))
      .catch(() =>
        res.status(401).send(generateErrorResponse("failed to leave group"))
      );
  }
);

groupRouter.get(
  "/all_members/:groupId",
  (req: Request<{ groupId: string }>, res: Response) => {
    const { groupId } = req.params;

    Promise.all([getAllGroupMembers(groupId), authenticate(req)])
      .then(([groupMemberIds, userId]) => {
        if (!groupMemberIds.includes(userId)) throw Error("not a member");
        return groupMemberIds;
      })
      .then((groupMemberIds) =>
        prisma.user.findMany({ where: { id: { in: groupMemberIds } } })
      )
      .then((users) => res.send(generateSuccessfulResponse({ users })))
      .catch(() =>
        res
          .status(401)
          .send(generateErrorResponse("unable to fetch group members"))
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

const deleteGroupMembership = async (groupId: string, userId: string) => {
  await prisma.groupMembership.delete({
    where: { userId_groupId: { userId, groupId } },
  });
};

const getAllGroupMembers = async (groupId: string) => {
  const allMemberships = await prisma.groupMembership.findMany({
    where: { groupId },
  });
  return allMemberships.map((membership) => membership.userId);
};

export default groupRouter;
