import { Request } from "express";
import jwt from "jsonwebtoken";

import { AccessTokenData } from "./types";

export const authenticate = async (req: Request) => {
  const { authorization: authHeader } = req.headers;

  const accessToken = authHeader?.split(" ")[1];
  if (typeof accessToken === "undefined") throw Error();

  const decoded: unknown = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  return (decoded as AccessTokenData).userId;
};

export const generateSuccessfulResponse = (data: any) => ({
  status: "success",
  data,
});

export const generateErrorResponse = (errorMsg: string) => ({
  status: "error",
  error: errorMsg,
});
