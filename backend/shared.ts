import { Request } from "express";
import jwt from "jsonwebtoken";

import { AccessTokenData, GroupDetails } from "./types";

import prisma from "./shared/prisma-client";

// SHARED

/**
 * Given an HTTP request, checks the `authorization` header and returns the
 * `userId` from the access token.
 */
export const authenticate = async (req: Request) => {
  const { authorization: authHeader } = req.headers;

  const accessToken = authHeader?.split(" ")[1];
  if (typeof accessToken === "undefined") throw Error("invalid token");

  const decoded: unknown = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  const token = decoded as AccessTokenData;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: token.userId },
  });

  if (!user.isActive) throw Error("user is inactive");
  return { userId: user.id, role: user.role };
};

export const generateSuccessfulResponse = (data: any) => ({
  status: "success",
  data,
});

export const generateErrorResponse = (errorMsg: string) => ({
  status: "error",
  error: errorMsg,
});

export const getGroupDetails = async (
  groupId: string
): Promise<GroupDetails> => {
  const baseGroupDetails = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: {
      GroupMembership: {
        select: {
          user: true,
        },
      },
    },
  });
  const { GroupMembership: memberships, ...mainDetails } = baseGroupDetails;
  return {
    ...mainDetails,
    members: memberships.map((membership) => membership.user),
  };
};

export const getUsers = async (userIds: string[]) => {
  return prisma.user.findMany({ where: { id: { in: userIds } } });
};
