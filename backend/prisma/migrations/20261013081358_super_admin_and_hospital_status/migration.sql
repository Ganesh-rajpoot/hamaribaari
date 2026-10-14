-- CreateEnum
CREATE TYPE "HospitalStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "status" "HospitalStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Hospital_status_idx" ON "Hospital"("status");
