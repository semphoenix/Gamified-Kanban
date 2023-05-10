import { Router } from "express";
const router = Router();
import xss from "xss";
import { userFxns } from "../data/index.js";
import validation from "../validation.js";

router
  .route("/login")
  .get(async (req, res) => {
    try {
      res.status(200).render("login", { title: "Login Page" });
    } catch (e) {
      res
        .status(500)
        .render("error", { title: "Error Page", error: e, status: "500" });
    }
  })
  .post(async (req, res) => {
    const userData = req.body;
    let errors = [];
    // if there's a problem with input, will be added to errors
    try {
      userData.username = validation.checkString(
        xss(userData.username),
        "Username"
      );
    } catch (e) {
      errors.push(e);
    }
    try {
      userData.password = validation.checkString(
        xss(userData.password),
        "Password"
      );
    } catch (e) {
      errors.push(e);
    }
    if (errors.length > 0) {
      res.status(400).render("login", {
        title: "Login Page",
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
      res.status(302).redirect(`/user/createKanban`);
    } catch (e) {
      errors.push("Invalid Credentials");
      res.status(400).render("login", {
        title: "Login Page",
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
      res.status(200).render("signup", { title: "Signup Page" });
    } catch (e) {
      res.status(500).render({ title: "Error Page", error: e, status: "500" });
    }
  })
  .post(async (req, res) => {
    const userData = req.body;
    let userForm = {};
    let user;
    let errors = [];
    // if there's a problem with input, will be added to errors
    try {
      userData.username = validation.checkString(
        xss(userData.username),
        "Username"
      );
      userForm["username"] = userData.username;
    } catch (e) {
      errors.push(e);
    }
    try {
      userData.password = validation.checkPassword(
        xss(userData.password),
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
        title: "Signup Page",
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
      res.status(302).redirect("/login"); // Should add some sort of message on login page to tell user their account has been created.
    } catch (e) {
      errors.push(e);
      res.status(400).render("signup", {
        title: "Signup Page",
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
  res.status(200).redirect("/login");
});

router
  .get("/landing", async (req, res) => {
    res.render("landingPage")
  })

export default router;
