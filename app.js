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

app.route("/").get((req, res) => {
  res.send("Welcome to the Book Buddy API");
});

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

// ⚡️ Quick usage guide

// Use 200 when you’re returning data.

// Use 201 when you create something.

// Use 204 when you delete something.

// Use 400 for invalid input.

// Use 401/403 for auth issues.

// Use 404 when the thing doesn’t exist.

// Use 409 when it already exists (conflict).

// Use 422 when validation fails.

// Use 500+ if it’s your server’s fault.
