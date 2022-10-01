import { Request } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

import { AccessTokenData } from "./types";

const prisma = new PrismaClient();

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

  if (!(await isUserActive(token.userId))) throw Error("user is inactive");
  return token;
};

export const generateSuccessfulResponse = (data: any) => ({
  status: "success",
  data,
});

export const generateErrorResponse = (errorMsg: string) => ({
  status: "error",
  error: errorMsg,
});

export const getUsers = async (userIds: string[]) => {
  return prisma.user.findMany({ where: { id: { in: userIds } } });
};

// HELPERS

const isUserActive = async (userId: string) => {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  return user != null && user.isActive;
};
