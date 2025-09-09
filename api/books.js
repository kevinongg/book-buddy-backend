import { getAllBooks, getBookById } from "#db/queries/books";

import express from "express";
const router = express.Router();
export default router;

import requireUser from "#middleware/requireUser";
import { getReservationsByUserIdAndBookId } from "#db/queries/reservations";

router.route("/").get(async (req, res) => {
  const books = await getAllBooks();
  res.status(200).send(books);
});

router.param("id", async (req, res, next, id) => {
  const book = await getBookById(id);
  if (!book) return res.status(404).send("Book not found");
  req.book = book;

  if (req.user) {
    const reservation = getReservationsByUserIdAndBookId(
      req.user.id,
      req.book.id
    );
    req.reservation = reservation;
  }
  next();
});

router.route("/:id").get(async (req, res) => {
  res.status(200).send(req.book);
});

router.route("/:id/reservations").get(requireUser, async (req, res) => {
  if (!req.user.id !== req.reservation.user_id) {
    return res
      .status(403)
      .send("You are not authorized to see the reservations");
  }
  res.status(200).send(reservation);
});
