import db from "#db/client";

import { faker } from "@faker-js/faker";
import { createUser } from "./queries/users.js";
import { createBook } from "./queries/books.js";
import { createReservation } from "./queries/reservations.js";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  //create 2 users
  let users = [];
  for (let i = 0; i < 2; i++) {
    const user = await createUser(
      faker.person.firstName(),
      faker.person.lastName(),
      faker.internet.exampleEmail(),
      faker.internet.password()
    );
    users.push(user);
  }

  let bookIds = [];
  for (let b = 0; b < 10; b++) {
    const book = await createBook(
      faker.book.title(),
      faker.book.author(),
      faker.commerce.productDescription(),
      faker.image.urlLoremFlickr({ category: "books" }),
      true
    );
    bookIds.push(book.id);
  }

  const fiveBooks = bookIds.slice(0, 5);
  const lastFiveBooks = bookIds.slice(5, 10);
  // for (const user of users) {
  // console.log(fiveBooks);
  for (const bookId of fiveBooks) {
    const test = await createReservation(users[0].id, bookId);
    // console.log(test);
  }
  for (const bookId of lastFiveBooks) {
    const test2 = await createReservation(users[1].id, bookId);
    // console.log(test2);
  }
}
