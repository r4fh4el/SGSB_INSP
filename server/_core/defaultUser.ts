import type { InsertUser } from "@shared/dbTypes";
import * as db from "../db";

const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID ?? "default-user";
const DEFAULT_USER_NAME = process.env.DEFAULT_USER_NAME ?? "Usuário Padrão";
const DEFAULT_USER_EMAIL = process.env.DEFAULT_USER_EMAIL ?? null;
const DEFAULT_USER_ROLE = process.env.DEFAULT_USER_ROLE ?? "admin";

let ensurePromise: Promise<InsertUser> | null = null;

export function getDefaultUserProfile(): InsertUser {
  return {
    id: DEFAULT_USER_ID,
    name: DEFAULT_USER_NAME,
    email: DEFAULT_USER_EMAIL,
    loginMethod: "internal",
    role: DEFAULT_USER_ROLE as InsertUser["role"],
    ativo: true,
    createdAt: new Date(),
    lastSignedIn: new Date(),
  };
}

export async function ensureDefaultUser(): Promise<InsertUser> {
  if (!ensurePromise) {
    const profile = getDefaultUserProfile();
    ensurePromise = db
      .upsertUser(profile)
      .then(() => profile)
      .catch((error) => {
        ensurePromise = null;
        throw error;
      });
  }
  return ensurePromise;
}

export { DEFAULT_USER_ID };

