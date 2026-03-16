import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";




export const subscribers = pgTable("subscribers", {

    id: uuid("id").defaultRandom().primaryKey(),
    url: varchar("url").unique().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date())
});

export type Subscriber = InferSelectModel<typeof subscribers>;
export type NewSubscriber = InferInsertModel<typeof subscribers>;
