import { getAllBooks, getBookById } from "#db/queries/books";

import express from "express";
const router = express.Router();
export default router;

import requireUser from "#middleware/requireUser";
import { getReservationsByUserIdAndBookId } from "#db/queries/reservations";

router.route("/").get(async (req, res, next) => {
  try {
    const books = await getAllBooks();
    res.status(200).send(books);
  } catch (error) {
    return next(error);
  }
});

router.param("id", async (req, res, next, id) => {
  try {
    const book = await getBookById(id);
    if (!book) return res.status(404).send("Book not found");
    req.book = book;

    if (req.user) {
      const reservation = await getReservationsByUserIdAndBookId(
        req.user.id,
        req.book.id
      );
      if (!reservation)
        return res
          .status(403)
          .send("You are not authorized to see the reservation");
      req.reservation = reservation;
    }
    next();
  } catch (error) {
    return next(error);
  }
});

router.route("/:id").get(async (req, res, next) => {
  try {
    res.status(200).send(req.book);
  } catch (error) {
    return next(error);
  }
});

router.route("/:id/reservations").get(requireUser, async (req, res, next) => {
  try {
    // if (
    //   req.reservation === undefined ||
    //   req.reservation.user_id !== req.user.id
    // ) {
    //   return res
    //     .status(403)
    //     .send("You are not authorized to see the reservation");
    // }
    res.status(200).send(req.reservation);
  } catch (error) {
    return next(error);
  }
});
