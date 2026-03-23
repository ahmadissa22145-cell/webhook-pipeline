ALTER TABLE "sources" DROP CONSTRAINT "sources_token_unique";--> statement-breakpoint
ALTER TABLE "sources" DROP CONSTRAINT "sources_pipeline_id_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "sources_token_unique_active" ON "sources" USING btree ("token") WHERE "sources"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "sources_pipeline_unique_active" ON "sources" USING btree ("pipeline_id") WHERE "sources"."deleted_at" is null;