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
  console.log(id);
  const book = await getBookById(id);
  if (!book) return res.status(404).send("Book not found");
  req.book = book;
  next();
});

router.route("/:id").get(async (req, res) => {
  res.status(200).send(req.book);
});

router.route("/:id/reservations").get(requireUser, async (req, res) => {
  const reservation = getReservationsByUserIdAndBookId(
    req.user.id,
    req.book.id
  );
  res.status(200).send(reservation);
});
