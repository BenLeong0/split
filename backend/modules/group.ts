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
      .then((creatorId) => {
        createGroup(name, creatorId);
      })
      .then((groupId) => res.send(generateSuccessfulResponse({ groupId })))
      .catch(() =>
        res.status(401).send(generateErrorResponse("unable to create group"))
      );
  }
);

// HELPERS

const createGroup = async (name: string, creator: string) => {
  const group = await prisma.group.create({ data: { name, creator } });
  return group.id;
};

export default groupRouter;
