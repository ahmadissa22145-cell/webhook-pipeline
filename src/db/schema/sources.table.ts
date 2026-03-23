import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { isNull } from "drizzle-orm";
import { pipelines } from "./pipelines.table.js";

export const sources = pgTable(
  "sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    token: uuid("token").notNull().defaultRandom(),

    isActive: boolean("is_active").notNull().default(true),

    pipelineId: uuid("pipeline_id")
      .notNull()
      .references(() => pipelines.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),

    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    uniqueTokenActive: uniqueIndex("sources_token_unique_active")
      .on(table.token)
      .where(isNull(table.deletedAt)),

    uniquePipelineActive: uniqueIndex("sources_pipeline_unique_active")
      .on(table.pipelineId)
      .where(isNull(table.deletedAt)),
  }),
);
