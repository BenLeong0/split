import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";

import {
  authenticate,
  generateErrorResponse,
  generateSuccessfulResponse,
} from "../shared";

dotenv.config();

const userRouter: Express = express();
userRouter.use(express.json());

const prisma = new PrismaClient();

// TYPES

interface CreateUserRequestBody {
  email: string;
  name: string;
}

interface LoginRequestBody {
  email: string;
}

// ROUTES

userRouter.post(
  "/create",
  (req: Request<{}, {}, CreateUserRequestBody>, res: Response) => {
    const { email, name } = req.body;

    createUser(email, name)
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

    login(email)
      .catch((e: Error) => {
        console.error(e.message);
      })
      // ALWAYS send successful response back, since "logging in" happens at magic link level
      .finally(() => res.send(generateSuccessfulResponse({})));
  }
);

userRouter.post(
  "/deactivate",
  (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    authenticate(req)
      .then(({ userId }) => deactivateUser(userId))
      .then(() => {
        res.send(generateSuccessfulResponse("user deactivated"));
      })
      .catch((e: Error) => {
        console.log(e.message);
        res.send(generateErrorResponse(e.message));
      });
  }
);

// HELPERS

const createUser = async (email: string, name: string) => {
  return await prisma.user.create({ data: { email, name } });
};

const activateUser = async (user: User) => {
  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: true },
  });
};

const deactivateUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
};

const login = async (email: string) => {
  const user = await prisma.user.findFirstOrThrow({ where: { email } });
  await activateUser(user);
  await sendMagicLink(user);
};

const generateAccessToken = (userId: string, role: string | null = null) => {
  const token = jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

const sendMagicLink = async (user: User): Promise<void> => {
  const accessToken = generateAccessToken(user.id, user.role);
  const magicLink = `www.split.com/activation/${accessToken}`;
  console.error(`Sending magic link "${magicLink}" to ${user.email}`);
  // TODO: Integrate with email service
};

export default userRouter;
