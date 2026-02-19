import { Role } from "./auth";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        email?: string;
        role: Role;
        parentId?: string;
      };
    }
  }
}

export {};
