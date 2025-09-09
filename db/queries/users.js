import db from "#db/client";
import bcrypt from "bcrypt";

export const createUser = async (firstName, lastName, email, password) => {
  const sql = `
  INSERT INTO users(first_name, last_name, email, password) VALUES($1, $2, $3, $4) RETURNING*
  `;
  const hashedPassword = await bcrypt.hash(password, 10);
  const { rows: user } = await db.query(sql, [
    firstName,
    lastName,
    email,
    hashedPassword,
  ]);
  return user[0];
};

export const getUserById = async (id) => {
  const sql = `
  SELECT * FROM users WHERE id = $1
  `;
  const { rows: user } = await db.query(sql, [id]);
  return user[0];
};
