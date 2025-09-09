import db from "#db/client";

export const createBook = async (
  title,
  author,
  description,
  coverImage,
  available
) => {
  const sql = `
  INSERT INTO books(title, author, description, cover_image, available) VALUES($1, $2, $3, $4, $5) RETURNING *
  `;
  const { rows: book } = await db.query(sql, [
    title,
    author,
    description,
    coverImage,
    available,
  ]);
  return book[0];
};
