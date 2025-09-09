import db from "#db/client";

export const createReservation = async (userId, bookId) => {
  const reserveSql = `
  INSERT INTO reservations(user_id, book_id) VALUES($1, $2) RETURNING *
  `;
  const { rows: reservation } = await db.query(reserveSql, [userId, bookId]);

  const updateSql = `
  UPDATE books
  SET available = false
  WHERE books.id = $1
  `;
  await db.query(updateSql, [bookId]);

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

export const getReservationsByUserId = async (userId) => {
  const sql = `
  SELECT reservations.id, reservations.book_id, books.title, books.author, books.description, books.cover_image
    FROM reservations
    JOIN books ON books.id = reservations.book_id
    JOIN users ON users.id = reservations.user_id
    WHERE user_id = $1
  `;
  const { rows: reservedBooks } = await db.query(sql, [userId]);
  return reservedBooks;
};

export const getReservationById = async (id) => {
  const sql = `
  SELECT * FROM reservations WHERE id = $1
  `;
  const {
    rows: [reservation],
  } = await db.query(sql, [id]);
  return reservation;
};

export const deleteReservation = async (reservationId) => {
  const deleteSql = `
  DELETE FROM reservations WHERE id = $1 RETURNING *
  `;
  const {
    rows: [reservation],
  } = await db.query(deleteSql, [reservationId]);
  console.log(reservation);

  const updateSql = `
  UPDATE books
  SET available = true
  WHERE books.id = $1
  `;
  await db.query(updateSql, [reservation.book_id]);

  return reservation;
};
