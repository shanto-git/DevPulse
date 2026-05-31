import { pool } from "../../db";
import type { IUser } from "./user.interface";
import bcrypt from "bcrypt";

const createUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;
  const bPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING *`,
  [name,email,bPassword,role]);
  return result.rows[0]
};


export const userService = {
    createUserIntoDB,
}
