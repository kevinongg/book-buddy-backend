import express from "express";
const router = express.Router();
export default router;

import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

import {
  createReservation,
  deleteReservation,
  getReservationById,
  getReservationsByUserId,
} from "#db/queries/reservations";
import { getBooksByReservationIdAndUserId } from "#db/queries/books";

router.use(requireUser);

router
  .route("/")
  .get(async (req, res) => {
    console.log(req.user.id);
    const reservations = await getReservationsByUserId(req.user.id);
    res.status(200).send(reservations);
  })
  .post(requireBody(["bookId"]), async (req, res) => {
    const { bookId } = req.body;
    const reservation = await createReservation(req.user.id, bookId);
    res.status(201).send(reservation);
  });

router.param("id", async (req, res, next, id) => {
  const reservation = await getReservationById(id);
  if (!reservation) return res.status(404).send("Reservation not found");
  req.reservation = reservation;

  const books = await getBooksByReservationIdAndUserId(
    req.reservation.id,
    req.user.id
  );
  if (!books) return res.status(404).send("Books not found");
  req.books = books;
  next();
});

router
  .route("/:id")
  .get(async (req, res) => {
    if (req.user.id !== req.reservation.user_id) {
      return res
        .status(403)
        .send("You are not authorized to view this reservation");
    }
    res.status(200).send(req.reservation);
  })
  .delete(async (req, res) => {
    console.log(req.reservation);
    if (req.user.id !== req.reservation.user_id) {
      return res
        .status(403)
        .send("You are not authorized to delete this reservation");
    }
    const remove = await deleteReservation(req.reservation.id);
    res.status(204).send(remove);
  });

//reservations/id/books
//sends the array of books that is in the reservation
//sends 403 if userid !== reservationid
router.route("/:id/books").get(async (req, res) => {
  if (req.user.id !== req.reservation.user_id) {
    return res
      .status(403)
      .send("You are not authorized to view this reservation");
  }
  res.status(200).send(req.books);
});
// .post(requireBody(["bookId"]), async (req, res) => {
//   if (req.user.id !== req.reservation.user_id) {
//     return res
//       .status(403)
//       .send("You are not authorized to view this reservation");
//   }
//   const { bookId } = req.body;
//   const reserveBook = await createReservation(req.user.id, bookId);
//   res.status(201).send(reserveBook);
// });
