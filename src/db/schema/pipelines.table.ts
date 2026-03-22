import { InferInsertModel, InferSelectModel, isNull } from "drizzle-orm";
import {
  pgTable,
  smallint,
  timestamp,
  uuid,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const pipelines = pgTable(
  "pipelines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    processingActionType: smallint("processing_action_type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    uniqueActiveName: uniqueIndex("unique_pipeline_name_active")
      .on(table.name)
      .where(isNull(table.deletedAt)),
  }),
);

export type Pipeline = InferSelectModel<typeof pipelines>;
export type NewPipeline = InferInsertModel<typeof pipelines>;
