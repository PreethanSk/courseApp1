-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "otpExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otpExpiresAt" TIMESTAMP(3);
