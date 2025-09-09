import db from "#db/client";

export const createReservation = async (userId, bookId) => {
  const sql = `
  INSERT INTO reservations(user_id, book_id) VALUES($1, $2) RETURNING *
  `;
  const { rows: reservation } = await db.query(sql, [userId, bookId]);
  return reservation[0];
};

export const getReservationsByUserIdAndBookId = async (userId, bookId) => {
  const sql = `
  SELECT *
    FROM reservations
    WHERE book_id = $1 AND user_id = $2
  `;
  const { rows: reservations } = await db.query(sql, [userId, bookId]);
  return reservations;
};
