import { jsonb, pgTable, smallint, timestamp, uuid } from "drizzle-orm/pg-core";
import { pipelines } from "./pipelines.table";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";



export const events = pgTable("events", {

    id: uuid("id").defaultRandom().primaryKey(),
    eventType: smallint("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    pipelineId: uuid("pipeline_id").notNull().references(() => pipelines.id, {onDelete: "cascade"}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date())
});

export type Event = InferSelectModel<typeof events>;
export type NewEvent = InferInsertModel<typeof events>;