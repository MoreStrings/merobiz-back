import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const prisma = new PrismaClient();

const signin = async (req) => {
  const { email, password } = req.body;

  const user_clone = await prisma.user_clone.findUnique({
    where: { email },
  });

  if (!user_clone) {
    throw new Error("User of given email does not exist!");
  }

  const valid = await bcrypt.compare(password, user_clone.password);

  if (!valid) {
    throw new Error("Password does not match");
  }

  const token = jwt.sign(
    { data: user_clone },
    process.env.JWT_SECRET_CODE,
    { expiresIn: "1d" }
  );

  return { token, user_clone };
};

const signup = async (req) => {
  const { email, name, password } = req.body;

  const existingUser = await prisma.user_clone.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user_clone = await prisma.user_clone.create({
    data: {
      email,
      password: hashedPassword,
      name
    },
  });

  const token = jwt.sign(
    { data: user_clone },
    process.env.JWT_SECRET_CODE,
    { expiresIn: "1h" }
  );

  return { user_clone, token };
};

export { signin, signup };
