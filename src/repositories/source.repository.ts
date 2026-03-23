import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { sources } from "../db/schema/index.js";

// ================== READ ====================
export async function getSourceById(id: string) {
  const [source] = await db
    .select()
    .from(sources)
    .where(and(eq(sources.id, id), isNull(sources.deletedAt)));

  return source ?? null;
}

// ===========================================

export async function getSourceByToken(token: string) {
  const [source] = await db
    .select()
    .from(sources)
    .where(and(eq(sources.token, token), isNull(sources.deletedAt)));

  return source ?? null;
}

// ===========================================

export async function listSources() {
  const storedSources = await db
    .select()
    .from(sources)
    .where(isNull(sources.deletedAt));

  return storedSources;
}
