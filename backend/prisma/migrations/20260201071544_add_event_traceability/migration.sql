-- AlterTable
ALTER TABLE "agent_suggestions" ADD COLUMN     "correlation_id" UUID,
ADD COLUMN     "source_event" VARCHAR(100);
