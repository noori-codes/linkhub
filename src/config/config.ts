import dotenv from "dotenv";

import type { SignOptions } from "jsonwebtoken";

export const config = {
  jwtSecret: process.env.JWT_SECRET as string,

  jwtExpiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
};
