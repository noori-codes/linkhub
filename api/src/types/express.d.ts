import type { IUser } from "../models/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user: IUser;
      // Populated by cookie-parser middleware
      cookies: Record<string, string>;
    }
  }
}

export {};
