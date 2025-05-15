/*
  Warnings:

  - The values [ADJOINT_CHEF_GROUPE,ADJOINT_CHEF_SECTION,ADJOINT_COMMANDANT_UNITE,ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `date` on the `Mission` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Mission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('RESERVISTE', 'CHEF_GROUPE', 'CHEF_SECTION', 'COMMANDANT_UNITE');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'RESERVISTE';
COMMIT;

-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "date",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
