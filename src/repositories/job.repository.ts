import { jobs } from "../db/schema/index.js";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { JobStatus } from "../types/jobStatus.type.js";

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

// ================== READ ===================

export async function listJobs(status?: JobStatus, limit?: number) {
  if (status) {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, status))
      .orderBy(jobs.createdAt)
      .limit(limit ?? 10);
  }

  return await db
    .select()
    .from(jobs)
    .orderBy(jobs.createdAt)
    .limit(limit ?? 10);
}

export async function getJobById(jobId: string) {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

  return job ?? null;
}
