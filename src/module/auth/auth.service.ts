import config from "../../config";
import { pool } from "../../db";
import type { IUser } from "../users/user.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const loginUserIntoDb = async (payload: IUser) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email = $1
        `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("Invalid Credential");
  }

  const user = userData.rows[0];

  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invalid credential");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  const accessToken = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "1d",
  });

  return {
    token: accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};

export const authService = {
  loginUserIntoDb,
};
