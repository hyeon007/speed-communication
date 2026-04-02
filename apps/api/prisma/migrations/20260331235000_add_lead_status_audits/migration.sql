CREATE TABLE "public"."lead_status_audits" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "previousStatus" "public"."LeadStatus" NOT NULL,
    "nextStatus" "public"."LeadStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_status_audits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lead_status_audits_leadId_changedAt_idx"
ON "public"."lead_status_audits"("leadId", "changedAt");

ALTER TABLE "public"."lead_status_audits"
ADD CONSTRAINT "lead_status_audits_leadId_fkey"
FOREIGN KEY ("leadId") REFERENCES "public"."leads"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
