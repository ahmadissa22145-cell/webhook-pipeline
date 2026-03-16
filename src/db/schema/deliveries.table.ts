import { pgTable, smallint, timestamp, uuid } from "drizzle-orm/pg-core";
import { jobs } from "./jobs.table";
import { subscribers } from "./subscribers.table";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";


export const deliveries = pgTable("deliveries", {

    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id").notNull().references(() => jobs.id, {onDelete: "cascade"}),
    subscriberId: uuid("subscriber_id").notNull().references(() => subscribers.id, {onDelete: "cascade"}),
    status: smallint("status").notNull().default(0),
    responseCode: smallint("response_code"),
    attempts: smallint("attempts").notNull().default(0),
    arrivedAt: timestamp("arrived_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date())
});

export type Delivery = InferSelectModel<typeof deliveries>;
export type NewDelivery = InferInsertModel<typeof deliveries>;