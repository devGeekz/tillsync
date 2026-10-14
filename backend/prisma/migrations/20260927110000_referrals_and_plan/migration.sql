-- Referral + plan columns so billing/referrals pages have real data
ALTER TABLE "Tenant" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'trial';
ALTER TABLE "Tenant" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "referredById" TEXT;
CREATE UNIQUE INDEX "Tenant_referralCode_key" ON "Tenant"("referralCode");