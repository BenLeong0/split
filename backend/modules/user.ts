import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";

import { generateErrorResponse, generateSuccessfulResponse } from "../shared";
import { LoginRequestBody, CreateUserRequestBody } from "../types";

dotenv.config();

const userRouter: Express = express();
userRouter.use(express.json());

const prisma = new PrismaClient();

userRouter.post(
  "/create",
  (req: Request<{}, {}, CreateUserRequestBody>, res: Response) => {
    const { email } = req.body;

    createUser(email)
      .then(() => res.send(generateSuccessfulResponse({})))
      .catch(() =>
        res.status(401).send(generateErrorResponse("unable to create user"))
      );
  }
);

userRouter.post(
  "/login",
  (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    const { userId } = req.body;

    activateUser(userId)
      .then(() =>
        res.send(
          generateSuccessfulResponse({ token: generateAccessToken(userId) })
        )
      )
      .catch(() =>
        res.status(401).send(generateErrorResponse("unable to login"))
      );
  }
);

const createUser = async (email: string) => {
  const user = await prisma.user.create({ data: { email } });
  sendMagicLink(user);
};

const loginUser = async (userId: string) => {
  activateUser(userId);
};

const activateUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });
};

const generateAccessToken = async (userId: string) => {
  const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

const sendMagicLink = (user: User): string => {
  const magicLink = `www.split.com/activation?userId=${user.id}`;
  console.log(`Sending magic link "${magicLink}" to ${user.email}`);
  // TODO: Integrate with email service
  return magicLink;
};

export default userRouter;
