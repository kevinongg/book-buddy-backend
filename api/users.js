import { createUser, getUserByEmailAndPassword } from "#db/queries/users";

import requireBody from "#middleware/requireBody";

import { createToken } from "#utils/jwt";

import express from "express";
const router = express.Router();
export default router;

router
  .route("/register")
  .post(
    requireBody(["firstName", "lastName", "email", "password"]),
    async (req, res) => {
      const { firstName, lastName, email, password } = req.body;
      const user = await createUser(firstName, lastName, email, password);
      // console.log(user);
      // console.log({ id: user.id });
      const token = createToken({ id: user.id });
      res.status(201).send(token);
    }
  );

router
  .route("/login")
  .post(requireBody(["email", "password"]), async (req, res) => {
    const { email, password } = req.body;
    const user = await getUserByEmailAndPassword(email, password);
    if (!user) return res.status(401).send("Invalid email and password");
    const token = createToken({ id: user.id });
    res.status(200).send(token);
  });
