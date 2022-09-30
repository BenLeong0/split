import { Request } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

import { AccessTokenData } from "./types";

const prisma = new PrismaClient();

// SHARED

export const authenticate = async (req: Request) => {
  const { authorization: authHeader } = req.headers;

  const accessToken = authHeader?.split(" ")[1];
  if (typeof accessToken === "undefined") throw Error("invalid token");

  const decoded: unknown = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  const { userId } = decoded as AccessTokenData;

  if (!(await isUserActive(userId))) throw Error("user is inactive");
  return userId;
};

export const generateSuccessfulResponse = (data: any) => ({
  status: "success",
  data,
});

export const generateErrorResponse = (errorMsg: string) => ({
  status: "error",
  error: errorMsg,
});

// HELPERS

const isUserActive = async (userId: string) => {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  return user != null && user.isActive;
};
