import { boolean, pgTable,timestamp,uuid, varchar } from "drizzle-orm/pg-core";
import {pipelines} from "./pipelines.table";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";




export const sources = pgTable("sources", {

    id: uuid("id").defaultRandom().primaryKey(),
    url: varchar("url").unique().notNull(),
    isActive: boolean("is_active").notNull().default(true),
    pipelineId: uuid("pipeline_id").notNull().references(() => pipelines.id, {onDelete: "cascade"}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date())
});

export type Source = InferSelectModel<typeof sources>;
export type NewSource = InferInsertModel<typeof sources>;