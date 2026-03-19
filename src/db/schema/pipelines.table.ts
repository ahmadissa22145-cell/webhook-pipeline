import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  smallint,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const pipelines = pgTable("pipelines", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).unique().notNull(),
  processingActionType: smallint("processing_action_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

export type Pipeline = InferSelectModel<typeof pipelines>;
export type NewPipeline = InferInsertModel<typeof pipelines>;
