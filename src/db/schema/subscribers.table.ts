import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    url: varchar("url").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),

    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    uniqueActiveUrl: uniqueIndex("unique_active_subscriber_url")
      .on(table.url)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);

export type Subscriber = InferSelectModel<typeof subscribers>;
export type NewSubscriber = InferInsertModel<typeof subscribers>;
