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

// ROUTES

userRouter.post(
  "/create",
  (req: Request<{}, {}, CreateUserRequestBody>, res: Response) => {
    const { email } = req.body;

    createUser(email)
      .then(sendMagicLink)
      .then(() => res.send(generateSuccessfulResponse({})))
      .catch(() =>
        res.status(401).send(generateErrorResponse("unable to create user"))
      );
  }
);

userRouter.post(
  "/login",
  (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    const { email } = req.body;

    // ALWAYS send successful response back, since "logging in" happens at magic link level
    login(email).finally(() => res.send(generateSuccessfulResponse({})));
  }
);

// HELPERS

const createUser = async (email: string) => {
  return await prisma.user.create({ data: { email } });
};

const activateUser = async (user: User) => {
  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: true },
  });
};

const login = async (email: string) => {
  const user = await prisma.user.findFirstOrThrow({ where: { email } });
  await activateUser(user);
  await sendMagicLink(user);
};

const generateAccessToken = (userId: string) => {
  const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

const sendMagicLink = async (user: User): Promise<void> => {
  const accessToken = generateAccessToken(user.id);
  const magicLink = `www.split.com/activation/${accessToken}`;
  console.error(`Sending magic link "${magicLink}" to ${user.email}`);
  // TODO: Integrate with email service
};

export default userRouter;
