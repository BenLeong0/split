import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const groupRouter: Express = express();
groupRouter.use(express.json());

const prisma = new PrismaClient();

export default groupRouter;
