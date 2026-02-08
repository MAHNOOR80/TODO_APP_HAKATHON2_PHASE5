-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('overdue_reminder', 'prioritization', 'schedule_adjustment', 'neglected_task', 'general_insight');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "autonomous_agents_enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "agent_suggestions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "task_id" UUID,
    "suggestion_type" "SuggestionType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ,

    CONSTRAINT "agent_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_agent_suggestions_user_id" ON "agent_suggestions"("user_id");

-- CreateIndex
CREATE INDEX "idx_agent_suggestions_dismissed" ON "agent_suggestions"("dismissed");

-- CreateIndex
CREATE INDEX "idx_agent_suggestions_type" ON "agent_suggestions"("suggestion_type");

-- CreateIndex
CREATE INDEX "idx_agent_suggestions_created_at" ON "agent_suggestions"("created_at");

-- AddForeignKey
ALTER TABLE "agent_suggestions" ADD CONSTRAINT "agent_suggestions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_suggestions" ADD CONSTRAINT "agent_suggestions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
