-- CreateEnum
CREATE TYPE "AuthOtpPurpose" AS ENUM ('PASSWORD_RESET', 'EMAIL_CHANGE');

-- CreateTable
CREATE TABLE "auth_otps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "target_email" TEXT NOT NULL,
    "purpose" "AuthOtpPurpose" NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_otps_target_email_purpose_created_at_idx" ON "auth_otps"("target_email", "purpose", "created_at");
CREATE INDEX "auth_otps_user_id_purpose_created_at_idx" ON "auth_otps"("user_id", "purpose", "created_at");
CREATE INDEX "auth_otps_expires_at_idx" ON "auth_otps"("expires_at");

-- AddForeignKey
ALTER TABLE "auth_otps" ADD CONSTRAINT "auth_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
