import { Router } from "express";
const router = Router();
import { kanbanFxns, userFxns } from "../data/index.js";
import validation from "../validation.js";

router
  .route("/login")
  .get(async (req, res) => {
    try {
      res.render("login");
    } catch (e) {
      res.status(500).render({ error: e, status: "500" });
    }
  })
  .post(async (req, res) => {
    const userData = req.body;
    let user;
    let errors = [];
    // if there's a problem with input, will direct user back to loginpage with error message
    try {
      userData.username = validation.checkString(userData.username, "Username");
    } catch (e) {
      errors.push(e);
    }
    try {
      userData.password = validation.checkString(userData.password, "Password");
    } catch (e) {
      errors.push(e);
    }

    try {
      user = await userFxns.getAttemptedCredentials(
        userData.username,
        userData.password
      );
      req.session.user = user;
      res.json("Logged in!"); //Change to render later
    } catch (e) {
      errors.push("Invalid Credentials");
    }
    if (errors.length > 0) {
      res.render("login", {
        errors: errors,
        hasErrors: true,
        user: userData,
      });
    }
  });
router.get("/logout", async (req, res) => {
  req.session.destroy();
  res.send("Logged out");
});

export default router;
