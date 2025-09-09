import db from "#db/client";

export const createReservation = async (userId, bookId) => {
  const sql = `
  INSERT INTO reservations(user_id, book_id) VALUES($1, $2) RETURNING *
  `;
  const { rows: reservation } = await db.query(sql, [userId, bookId]);
  return reservation[0];
};
