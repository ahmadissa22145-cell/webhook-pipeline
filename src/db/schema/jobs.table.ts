import { pgTable, smallint, timestamp, uuid } from "drizzle-orm/pg-core";
import { events } from "./events.table.js";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  status: smallint("status").notNull().default(0),
  attempts: smallint("attempts").notNull().default(0),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type job = InferSelectModel<typeof jobs>;
export type Newjob = InferInsertModel<typeof jobs>;
