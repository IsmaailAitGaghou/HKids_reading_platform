export const ROLES = {
  ADMIN: "ADMIN",
  PARENT: "PARENT",
  CHILD: "CHILD"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
