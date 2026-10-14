-- Add merchant MoMo number (webhook routing) and webhook dedupe key
ALTER TABLE "Tenant" ADD COLUMN "momoNumber" TEXT;
CREATE UNIQUE INDEX "Tenant_momoNumber_key" ON "Tenant"("momoNumber");

ALTER TABLE "Notification" ADD COLUMN "externalId" TEXT;
CREATE UNIQUE INDEX "Notification_externalId_key" ON "Notification"("externalId");