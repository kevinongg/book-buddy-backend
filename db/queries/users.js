import db from "#db/client";
import bcrypt from "bcrypt";

export const createUser = async (firstName, lastName, email, password) => {
  const sql = `
  INSERT INTO users(first_name, last_name, email, password) VALUES($1, $2, $3, $4) RETURNING*
  `;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(sql, [firstName, lastName, email, hashedPassword]);
  return user;
};

export const getUserById = async (id) => {
  const sql = `
  SELECT * FROM users WHERE id = $1
  `;
  const { rows: user } = await db.query(sql, [id]);
  return user[0];
};

export const getUserByEmailAndPassword = async (email, password) => {
  const sql = `
  SELECT * FROM users WHERE email = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [email]);
  if (!user) return null;
  const userExists = await bcrypt.compare(password, user.password);
  if (!userExists) return null;
  return user;
};

export const getUserInfoByUserId = async (userId) => {
  const sql = `
  SELECT 
    users.id AS user_id,
    users.first_name,
    users.last_name,
    users.email,
    (SELECT json_agg(json_build_object(
      'reservation_id', reservations.id,
      'book_id', books.id,
      'title', books.title,
      'author', books.author,
      'description', books.description,
      'cover_image', books.cover_image)
    ) FROM 
        reservations
      JOIN 
        books ON books.id = reservations.book_id
    ) AS 
        reservations
  FROM
    users
  WHERE
    users.id = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [userId]);
  return user;
};
