/*
  Warnings:

  - You are about to drop the column `fullname` on the `User_clone` table. All the data in the column will be lost.
  - Added the required column `name` to the `User_clone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User_clone" DROP COLUMN "fullname",
ADD COLUMN     "name" TEXT NOT NULL;
