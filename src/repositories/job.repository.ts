import { jobs } from "../db/schema/index.js";
import { db } from "../db/index.js";

// ================== CREATE ===================
export async function createJob(eventId: string) {
  const [job] = await db
    .insert(jobs)
    .values({
      eventId,
    })
    .returning();

  return job;
}
