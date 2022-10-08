import express, { Express, Request } from "express";
import dotenv from "dotenv";

import prisma from "../shared/prisma-client";

import {
  SplitResponse,
  authenticate,
  generateErrorResponse,
  generateSuccessfulResponse,
  getGroupDetails,
  getUsers,
} from "../shared/utils";
import { GroupDetails } from "../types";

dotenv.config();

const groupRouter: Express = express();
groupRouter.use(express.json());

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

interface GroupDetailsParams {
  groupId: string;
}

interface GroupMembersParams {
  groupId: string;
}

// ROUTES

groupRouter.post(
  "/create",
  (
    req: Request<{}, {}, CreateGroupRequestBody>,
    res: SplitResponse<{ groupId: string }>
  ) => {
    const { name } = req.body;

    authenticate(req)
      .then(({ userId }) => createGroup(name, userId))
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
  (
    req: Request<{}, {}, JoinGroupRequestBody>,
    res: SplitResponse<{ groupId: string }>
  ) => {
    const { groupId } = req.body;

    authenticate(req)
      .then(({ userId }) => createGroupMembership(groupId, userId))
      .then(() => res.send(generateSuccessfulResponse({ groupId })))
      .catch(() =>
        res.status(401).send(generateErrorResponse("unable to join group"))
      );
  }
);

groupRouter.post(
  "/leave",
  (
    req: Request<{}, {}, LeaveGroupRequestBody>,
    res: SplitResponse<{ groupId: string }>
  ) => {
    const { groupId } = req.body;

    authenticate(req)
      .then(({ userId }) => deleteGroupMembership(groupId, userId))
      .then(() => res.send(generateSuccessfulResponse({ groupId })))
      .catch(() =>
        res.status(401).send(generateErrorResponse("failed to leave group"))
      );
  }
);

groupRouter.get(
  "/details/:groupId",
  (req: Request<{ groupId: string }>, res: SplitResponse<GroupDetails>) => {
    const { groupId } = req.params;

    authenticate(req)
      .then(async ({ userId, role }) => {
        const groupDetails = await getGroupDetails(groupId);
        if (
          role !== "admin" &&
          !groupDetails.members.map((member) => member.id).includes(userId)
        ) {
          throw Error("not a member");
        }
        res.send(generateSuccessfulResponse(groupDetails));
      })
      .catch(() =>
        res
          .status(401)
          .send(generateErrorResponse("unable to fetch group details"))
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

const getGroup = async (groupId: string) => {
  return await prisma.group.findUniqueOrThrow({ where: { id: groupId } });
};

const getAllGroupMembers = async (groupId: string) => {
  const allMemberships = await prisma.groupMembership.findMany({
    where: { groupId },
  });
  return allMemberships.map((membership) => membership.userId);
};

export default groupRouter;
