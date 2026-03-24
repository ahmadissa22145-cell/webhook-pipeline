import { pgTable, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { pipelines } from "./pipelines.table.js";
import { subscribers } from "./subscribers.table.js";
import { InferInsertModel, InferSelectModel, isNull } from "drizzle-orm";

export const pipelineSubscribers = pgTable(
  "pipeline_subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pipelineId: uuid("pipeline_id")
      .references(() => pipelines.id, { onDelete: "cascade" })
      .notNull(),
    subscriberId: uuid("subscriber_id")
      .references(() => subscribers.id, { onDelete: "cascade" })
      .notNull(),
    unsubscribedAt: timestamp("unsubscribed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueActiveSubscription: uniqueIndex("unique_active_subscription")
      .on(table.pipelineId, table.subscriberId)
      .where(isNull(table.unsubscribedAt)),
  }),
);

export type PipelineSubscriber = InferSelectModel<typeof pipelineSubscribers>;
export type NewPipelineSubscriber = InferInsertModel<
  typeof pipelineSubscribers
>;
