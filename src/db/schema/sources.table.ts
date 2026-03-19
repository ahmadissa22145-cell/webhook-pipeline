import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { pipelines } from "./pipelines.table.js";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: varchar("token").unique().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .unique()
    .references(() => pipelines.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  deletedAt: timestamp("deleted_at"),
});

export type Source = InferSelectModel<typeof sources>;
export type NewSource = InferInsertModel<typeof sources>;
