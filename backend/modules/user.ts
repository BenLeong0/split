import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

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

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

const loginSchema = z.object({
  email: z.string().email(),
});

const deactivateSchema = z.object({
  email: z.string().email(),
});

// ROUTES

userRouter.post("/create", (req, res) => {
  createUserSchema
    .parseAsync(req.body)
    .then(({ email, name }) => createUser(email, name))
    .then(sendMagicLink)
    .then(() => res.send(generateSuccessfulResponse({})))
    .catch(() =>
      res.status(401).send(generateErrorResponse("unable to create user"))
    );
});

userRouter.post("/login", (req, res) => {
  loginSchema
    .parseAsync(req.body)
    .then(({ email }) => login(email))
    .catch((e: Error) => {
      console.error(e.message);
    })
    // ALWAYS send successful response back, since "logging in" happens at magic link level
    .finally(() => res.send(generateSuccessfulResponse({})));
});

userRouter.post("/deactivate", (req, res) => {
  deactivateSchema
    .parseAsync(req.body)
    .then(() => authenticate(req))
    .then(({ userId }) => deactivateUser(userId))
    .then(() => {
      res.send(generateSuccessfulResponse("user deactivated"));
    })
    .catch((e: Error) => {
      console.log(e.message);
      res.send(generateErrorResponse(e.message));
    });
});

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
