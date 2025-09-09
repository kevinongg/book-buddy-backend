import getUserFromToken from "#middleware/getUserFromToken";
import express from "express";
const app = express();
export default app;

import morgan from "morgan";

import userRoutes from "./api/users.js";
import bookRoutes from "./api/books.js";
import reservationRoutes from "./api/reservations.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(getUserFromToken);

app.use("/users", userRoutes);
app.use("/books", bookRoutes);
app.use("/reservations", reservationRoutes);

app.use((err, req, res, next) => {
  switch (err.code) {
    // Invalid type
    case "22P02":
      return res.status(400).send(err.message);
    // Unique constraint violation
    case "23505":
    // Foreign key violation
    case "23503":
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("OH NO, SOMETHING WENT TERRIBLY WRONG :(");
});
