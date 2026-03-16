import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { pipelines } from "./pipelines.table";
import { subscribers } from "./subscribers.table";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";


export const pipelineSubscribers = pgTable("pipeline_subscribers", {

    pipelineId: uuid("pipeline_id").references(() => pipelines.id, {onDelete: "cascade"}),
    subscriberId: uuid("subscriber_id").references(() => subscribers.id, {onDelete: "cascade"}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date())
},
    (table) => ({
        pk: primaryKey({ columns: [table.pipelineId, table.subscriberId]})
    })
);

export type PipelineSubscriber = InferSelectModel<typeof pipelineSubscribers>;
export type NewPipelineSubscriber = InferInsertModel<typeof pipelineSubscribers>;