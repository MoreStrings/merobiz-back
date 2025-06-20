/*
  Warnings:

  - Added the required column `fullname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Others');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fullname" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL;
