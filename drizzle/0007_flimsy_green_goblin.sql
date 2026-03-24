ALTER TABLE "pipeline_subscribers" DROP CONSTRAINT "pipeline_subscribers_pipeline_id_subscriber_id_pk";--> statement-breakpoint
ALTER TABLE "pipeline_subscribers" ALTER COLUMN "pipeline_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pipeline_subscribers" ALTER COLUMN "subscriber_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pipeline_subscribers" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "pipeline_subscribers" ADD COLUMN "unsubscribed_at" timestamp;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_subscription" ON "pipeline_subscribers" USING btree ("pipeline_id","subscriber_id") WHERE "pipeline_subscribers"."unsubscribed_at" is null;