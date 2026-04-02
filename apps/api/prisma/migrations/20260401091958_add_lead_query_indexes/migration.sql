-- CreateIndex
CREATE INDEX "lead_status_audits_changedAt_idx" ON "public"."lead_status_audits"("changedAt");

-- CreateIndex
CREATE INDEX "lead_status_audits_nextStatus_changedAt_idx" ON "public"."lead_status_audits"("nextStatus", "changedAt");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "public"."leads"("status");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "public"."leads"("createdAt");

-- CreateIndex
CREATE INDEX "leads_status_createdAt_idx" ON "public"."leads"("status", "createdAt");
