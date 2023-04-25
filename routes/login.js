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
    let errors = [];
    // if there's a problem with input, will be added to errors
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
    if (errors.length > 0) {
      res.render("login", {
        errors: errors,
        LoginErrors: true,
        user: userData,
      });
      return;
    }
    try {
      let user = await userFxns.getAttemptedCredentials(
        userData.username,
        userData.password
      );
      req.session.user = user;
      res.redirect(`/user/${user._id.toString()}`);
    } catch (e) {
      errors.push("Invalid Credentials");
      res.render("login", {
        errors: errors,
        LoginErrors: true,
        user: userData,
      });
      return;
    }
  });

router
  .route("/signup")
  .get(async (req, res) => {
    try {
      res.render("signup");
    } catch (e) {
      res.status(500).render({ error: e, status: "500" });
    }
  })
  .post(async (req, res) => {
    const userData = req.body;
    let user;
    let errors = [];
    // if there's a problem with input, will be added to errors
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
      userData.age = parseInt(userData.age);
      userData.age = validation.checkAge(userData.age, "Age");
    } catch (e) {
      errors.push(e);
    }
    if (errors.length > 0) {
      res.render("login", {
        errors: errors,
        SignupErrors: true,
        user: userData,
      });
      return;
    }
    try {
      user = await userFxns.createUser(
        userData.username,
        userData.password,
        userData.age
      );
      req.session.user = user;
      res.json("User Created!"); //Change to render later
    } catch (e) {
      errors.push(e);
      res.status(500).render("login", {
        errors: errors,
        SignupErrors: true,
        user: userData,
      });
      return;
    }
  });

router.get("/logout", async (req, res) => {
  req.session.destroy();
  console.log("Logged Out!");
  res.redirect("/login");
});

export default router;
