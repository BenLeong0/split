import { Group, User } from "@prisma/client";

export interface GroupDetails extends Group {
  members: User[];
}

export interface AccessTokenData {
  userId: string;
  iat: string;
  exp: string;
}
