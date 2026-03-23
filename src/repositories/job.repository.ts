import { jobs } from "../db/schema/index.js";
import { db } from "../db/index.js";
import { eq, sql } from "drizzle-orm";
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

// ================== UPDATE ===================

export async function updateJobStatus(jobId: string, status: JobStatus) {
  const [jobUpdated] = await db
    .update(jobs)
    .set({ status })
    .where(eq(jobs.id, jobId))
    .returning();

  return jobUpdated ?? null;
}

// ===========================================
export async function incrementJobAttempts(jobId: string) {
  const [jobUpdated] = await db
    .update(jobs)
    .set({ attempts: sql`${jobs.attempts} + 1` })
    .where(eq(jobs.id, jobId))
    .returning();

  return jobUpdated ?? null;
}

// ================== READ ===================

export async function listJobs(status?: JobStatus, limit?: number) {
  if (status) {
    return await db
      .select({
        id: jobs.id,
        eventId: jobs.eventId,
        statusText: sql<string>`
    CASE 
      WHEN ${jobs.status} = 0 THEN 'PENDING'
      WHEN ${jobs.status} = 1 THEN 'PROCESSING'
      WHEN ${jobs.status} = 2 THEN 'COMPLETED'
      WHEN ${jobs.status} = 3 THEN 'FAILED'
      WHEN ${jobs.status} = 4 THEN 'RETRYING'
      ELSE 'unknown'
    END
  `,
        status: jobs.status,
        attempts: jobs.attempts,
        processedAt: jobs.processedAt,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
      })
      .from(jobs)
      .where(eq(jobs.status, status))
      .orderBy(jobs.createdAt)
      .limit(limit ?? 10);
  }

  return await db
    .select({
      id: jobs.id,
      eventId: jobs.eventId,
      statusText: sql<string>`
    CASE 
      WHEN ${jobs.status} = 0 THEN 'PENDING'
      WHEN ${jobs.status} = 1 THEN 'PROCESSING'
      WHEN ${jobs.status} = 2 THEN 'COMPLETED'
      WHEN ${jobs.status} = 3 THEN 'FAILED'
      WHEN ${jobs.status} = 4 THEN 'RETRYING'
      ELSE 'unknown'
    END
  `,
      status: jobs.status,
      attempts: jobs.attempts,
      processedAt: jobs.processedAt,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
    })
    .from(jobs)
    .orderBy(jobs.createdAt)
    .limit(limit ?? 10);
}

// ===========================================
export async function getJobById(jobId: string) {
  const [job] = await db
    .select({
      id: jobs.id,
      eventId: jobs.eventId,
      statusText: sql<string>`
    CASE 
      WHEN ${jobs.status} = 0 THEN 'PENDING'
      WHEN ${jobs.status} = 1 THEN 'PROCESSING'
      WHEN ${jobs.status} = 2 THEN 'COMPLETED'
      WHEN ${jobs.status} = 3 THEN 'FAILED'
      WHEN ${jobs.status} = 4 THEN 'RETRYING'
      ELSE 'unknown'
    END
  `,
      status: jobs.status,
      attempts: jobs.attempts,
      processedAt: jobs.processedAt,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
    })
    .from(jobs)
    .where(eq(jobs.id, jobId));

  return job ?? null;
}
