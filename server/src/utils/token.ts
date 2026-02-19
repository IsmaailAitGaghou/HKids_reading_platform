import crypto from "node:crypto";
import { env } from "../config/env";
import { Role } from "../types/auth";

export interface AuthTokenPayload {
  sub: string;
  email?: string;
  role: Role;
  parentId?: string;
  iat: number;
  exp: number;
}

interface IssueTokenPayload {
  sub: string;
  email?: string;
  role: Role;
  parentId?: string;
}

const sign = (encodedPayload: string): string => {
  return crypto.createHmac("sha256", env.AUTH_SECRET).update(encodedPayload).digest("base64url");
};

export const issueToken = (payload: IssueTokenPayload): string => {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: AuthTokenPayload = {
    ...payload,
    iat: now,
    exp: now + env.TOKEN_TTL_SECONDS
  };

  const encodedPayload = Buffer.from(JSON.stringify(fullPayload), "utf8").toString("base64url");
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const verifyToken = (token: string): AuthTokenPayload | null => {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const providedBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== providedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as AuthTokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};
