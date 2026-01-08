import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { InsertUser } from "@shared/dbTypes";
import { DEFAULT_USER_ID, ensureDefaultUser, getDefaultUserProfile } from "./defaultUser";
import { ENV } from "./env";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: InsertUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: InsertUser | null = null;

  if (ENV.skipAuth) {
    try {
      user = await ensureDefaultUser();
    } catch (error) {
      console.error("[Auth] Failed to ensure default user", error);
      user = getDefaultUserProfile();
    }
  } else {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
