/*
  Warnings:

  - A unique constraint covering the columns `[userId,missionId]` on the table `Participation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Participation_userId_missionId_key" ON "Participation"("userId", "missionId");
