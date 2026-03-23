import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { sources } from "../db/schema/index.js";

// ================== CREATE ===================
export async function createSource(pipelineId: string) {
  const [source] = await db
    .insert(sources)
    .values({
      pipelineId,
    })
    .returning();

  return source;
}

// ================== UPDATE ===================
export async function updateSourceStatus(id: string, isActive: boolean) {
  const [updated] = await db
    .update(sources)
    .set({
      isActive,
    })
    .where(and(eq(sources.id, id), isNull(sources.deletedAt)))
    .returning();

  return updated ?? null;
}

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

// ================== DELETE ===================
export async function deleteSource(id: string) {
  const [deleted] = await db
    .update(sources)
    .set({
      deletedAt: new Date(),
    })
    .where(and(eq(sources.id, id), isNull(sources.deletedAt)))
    .returning();

  return deleted ?? null;
}
