import { Router } from "express";
const router = Router();
import { userFxns } from "../data/index.js";
import validation from "../validation.js";

router
  .route("/login")
  .get(async (req, res) => {
    try {
      res.render("login");
    } catch (e) {
      res.status(500).render("error", { error: e, status: "500" });
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
        loginErrors: true,
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
      console.log("Logging in");
      res.redirect(`/user/accountsPage`);
    } catch (e) {
      errors.push("Invalid Credentials");
      res.status(400).render("login", {
        errors: errors,
        LoginErrors: true,
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
    let userForm = {};
    let user;
    let errors = [];
    // if there's a problem with input, will be added to errors
    try {
      userData.username = validation.checkString(userData.username, "Username");
      userForm["username"] = userData.username;
    } catch (e) {
      errors.push(e);
    }
    try {
      userData.password = validation.checkPassword(
        userData.password,
        "Password"
      );
    } catch (e) {
      errors.push(e);
    }
    try {
      if (userData.confirmPassword !== userData.password)
        throw "Passwords do not match!";
    } catch (e) {
      errors.push(e);
    }
    try {
      userData.age = parseInt(userData.age);
      userData.age = validation.checkAge(userData.age, "Age");
      userForm["age"] = userData.age;
    } catch (e) {
      errors.push(e);
    }
    if (errors.length > 0) {
      res.status(400).render("signup", {
        errors: errors,
        SignupErrors: true,
        user: userForm,
      });
      return;
    }
    try {
      user = await userFxns.createUser(
        userData.username,
        userData.password,
        userData.confirmPassword,
        userData.age
      );
      req.session.user = user;
      res.redirect("/login"); // Should add some sort of message on login page to tell user their account has been created.
    } catch (e) {
      errors.push(e);
      res.status(400).render("signup", {
        errors: errors,
        SignupErrors: true,
        user: userForm,
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
