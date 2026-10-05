CREATE TYPE "RequestPriority" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

ALTER TABLE "categories" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "requests"
  ADD COLUMN "priority" "RequestPriority" NOT NULL DEFAULT 'MEDIA',
  ADD COLUMN "assignee_id" TEXT,
  ADD COLUMN "deleted_at" TIMESTAMP(3);

ALTER TABLE "requests" ADD CONSTRAINT "requests_assignee_id_fkey"
  FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "request_comments" (
  "id" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "request_id" TEXT NOT NULL,
  "author_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "request_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "request_history" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "details" TEXT,
  "request_id" TEXT NOT NULL,
  "actor_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "request_history_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "request_comments" ADD CONSTRAINT "request_comments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "request_comments" ADD CONSTRAINT "request_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "requests_assignee_id_idx" ON "requests"("assignee_id");
CREATE INDEX "requests_priority_idx" ON "requests"("priority");
CREATE INDEX "request_comments_request_id_created_at_idx" ON "request_comments"("request_id", "created_at");
CREATE INDEX "request_history_request_id_created_at_idx" ON "request_history"("request_id", "created_at");
