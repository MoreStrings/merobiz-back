import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const prisma = new PrismaClient();

const login = async (req) => {
  const { email, password } = req.body;

  //console.log(req.body)

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User of given email does not exist!");
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new Error("Password does not match");
  }

  const token = jwt.sign(
    { data: user },
    process.env.JWT_SECRET_CODE,
    { expiresIn: "1d" }
  );

  return { token, user };
};

const register = async (req) => {
  const { email, fullname, gender, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullname,
      gender,
    },
  });

  const token = jwt.sign(
    { data: user },
    process.env.JWT_SECRET_CODE,
    { expiresIn: "1h" }
  );

  return { user, token };
};

export { login, register };
