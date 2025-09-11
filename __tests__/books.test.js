import app from "#app";
import db from "#db/client";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// api/books.test.js

let token;
let user;
let book;
let reservation;

beforeAll(async () => {
  await db.connect();
  await db.query("BEGIN");

  // Create user
  const userRes = await request(app).post("/users/register").send({
    firstName: "Test",
    lastName: "User",
    email: "testuser@example.com",
    password: "password123",
  });
  token = userRes.text;

  const {
    rows: [dbUser],
  } = await db.query("SELECT * FROM users WHERE email = $1", [
    "testuser@example.com",
  ]);
  user = dbUser;

  // Create book
  const {
    rows: [dbBook],
  } = await db.query(
    `INSERT INTO books(title, author, description, cover_image, available)
     VALUES('Test Book', 'Test Author', 'Test Description', 'test.jpg', true)
     RETURNING *`
  );
  book = dbBook;

  // Create reservation
  const {
    rows: [dbReservation],
  } = await db.query(
    `INSERT INTO reservations(user_id, book_id) VALUES($1, $2) RETURNING *`,
    [user.id, book.id]
  );
  reservation = dbReservation;
});

afterAll(async () => {
  await db.query("ROLLBACK");
  await db.end();
});

describe("books API", () => {
  it("GET /books returns all books", async () => {
    const response = await request(app).get("/books");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: book.id })])
    );
  });

  it("GET /books/:id returns the specific book", async () => {
    const response = await request(app).get(`/books/${book.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ id: book.id }));
  });

  it("GET /books/:id returns 404 for non-existent book", async () => {
    const response = await request(app).get(`/books/${book.id + 9999}`);
    expect(response.status).toBe(404);
  });

  describe("GET /books/:id/reservations", () => {
    it("returns 401 if not logged in", async () => {
      const response = await request(app).get(`/books/${book.id}/reservations`);
      expect(response.status).toBe(401);
    });

    it("returns 403 if user is not the owner of the reservation", async () => {
      // Create another user
      await request(app).post("/users/register").send({
        firstName: "Other",
        lastName: "User",
        email: "otheruser@example.com",
        password: "password123",
      });
      const {
        rows: [otherUser],
      } = await db.query("SELECT * FROM users WHERE email = $1", [
        "otheruser@example.com",
      ]);
      const otherToken = await request(app)
        .post("/users/login")
        .send({
          email: "otheruser@example.com",
          password: "password123",
        })
        .then((res) => res.text);

      const response = await request(app)
        .get(`/books/${book.id}/reservations`)
        .set("Authorization", `Bearer ${otherToken}`);
      expect(response.status).toBe(403);
    });

    it("returns 200 and reservation if user is owner", async () => {
      const response = await request(app)
        .get(`/books/${book.id}/reservations`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toEqual(
        expect.objectContaining({ id: reservation.id })
      );
    });
  });
});
