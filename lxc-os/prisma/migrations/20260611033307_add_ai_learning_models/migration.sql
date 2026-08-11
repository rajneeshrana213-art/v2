-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "plan" ADD COLUMN     "plan_type" TEXT NOT NULL DEFAULT 'PLATFORM';

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "billing_cycle" TEXT DEFAULT 'monthly',
ADD COLUMN     "plan_key" TEXT DEFAULT 'free',
ADD COLUMN     "user_id" TEXT;

-- CreateTable
CREATE TABLE "smart_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "summary" TEXT NOT NULL,
    "conceptMap" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "smart_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hinglish_voice_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "transcription" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hinglish_voice_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_styles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "styleType" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "last_interaction" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_twins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comprehensionVectors" JSONB NOT NULL,
    "weaknesses" TEXT[],
    "strengths" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digital_twins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adaptive_states" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theta" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "beta" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "last_calibrated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adaptive_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards_ai" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "noteId" TEXT,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "next_review" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcards_ai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_sync_buffers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "operation" TEXT NOT NULL,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offline_sync_buffers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject_scores" JSONB NOT NULL,
    "recent_trend" DOUBLE PRECISION NOT NULL,
    "last_aggregated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "focus_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "distraction_spikes" INTEGER NOT NULL,
    "focus_score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "focus_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failure_risk_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "risk_score" DOUBLE PRECISION NOT NULL,
    "risk_level" TEXT NOT NULL,
    "factors" TEXT[],
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failure_risk_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wellness_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "burnout_index" DOUBLE PRECISION NOT NULL,
    "anxiety_index" DOUBLE PRECISION NOT NULL,
    "sentiment_log" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wellness_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "risk_alert_id" TEXT,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'Hinglish',
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_simulations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "target_career" TEXT NOT NULL,
    "simulated_paths" JSONB NOT NULL,
    "success_probability" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifiable_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "cert_id" TEXT NOT NULL,
    "blockchain_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifiable_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "career_path" TEXT NOT NULL,
    "fit_score" DOUBLE PRECISION NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soft_skills_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "communication_rate" DOUBLE PRECISION NOT NULL,
    "pitch_modulation" DOUBLE PRECISION NOT NULL,
    "leadership_score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soft_skills_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peer_study_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "members" TEXT[],
    "active_battles" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "peer_study_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "smart_notes_userId_idx" ON "smart_notes"("userId");

-- CreateIndex
CREATE INDEX "hinglish_voice_logs_userId_idx" ON "hinglish_voice_logs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_styles_userId_key" ON "learning_styles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "digital_twins_userId_key" ON "digital_twins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "adaptive_states_userId_key" ON "adaptive_states"("userId");

-- CreateIndex
CREATE INDEX "flashcards_ai_userId_idx" ON "flashcards_ai"("userId");

-- CreateIndex
CREATE INDEX "offline_sync_buffers_userId_synced_idx" ON "offline_sync_buffers"("userId", "synced");

-- CreateIndex
CREATE UNIQUE INDEX "performance_metrics_userId_key" ON "performance_metrics"("userId");

-- CreateIndex
CREATE INDEX "focus_sessions_userId_idx" ON "focus_sessions"("userId");

-- CreateIndex
CREATE INDEX "failure_risk_alerts_userId_resolved_idx" ON "failure_risk_alerts"("userId", "resolved");

-- CreateIndex
CREATE INDEX "wellness_logs_userId_idx" ON "wellness_logs"("userId");

-- CreateIndex
CREATE INDEX "mentor_sessions_userId_idx" ON "mentor_sessions"("userId");

-- CreateIndex
CREATE INDEX "parent_notifications_userId_idx" ON "parent_notifications"("userId");

-- CreateIndex
CREATE INDEX "decision_simulations_userId_idx" ON "decision_simulations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verifiable_credentials_cert_id_key" ON "verifiable_credentials"("cert_id");

-- CreateIndex
CREATE INDEX "verifiable_credentials_userId_idx" ON "verifiable_credentials"("userId");

-- CreateIndex
CREATE INDEX "career_recommendations_userId_idx" ON "career_recommendations"("userId");

-- CreateIndex
CREATE INDEX "soft_skills_scores_userId_idx" ON "soft_skills_scores"("userId");

-- CreateIndex
CREATE INDEX "subscription_user_id_idx" ON "subscription"("user_id");

-- CreateIndex
CREATE INDEX "subscription_user_id_is_active_end_date_idx" ON "subscription"("user_id", "is_active", "end_date");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
