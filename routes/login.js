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

    try {
      let user = await userFxns.getAttemptedCredentials(
        userData.username,
        userData.password
      );
      req.session.user = user;
      res.redirect(`/user/${user._id.toString()}`);
    } catch (e) {
      errors.push("Invalid Credentials");
    }
    if (errors.length > 0) {
      res.render("login", {
        errors: errors,
        LoginErrors: true,
        user: userData,
      });
    }
  });

router.route("/signup").post(async (req, res) => {
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
  try {
    user = await userFxns.createUser(
      userData.username,
      userData.password,
      userData.age
    );
    //req.session.user = user;
    res.json("User Created!"); //Change to render later
  } catch (e) {}
  if (errors.length > 0) {
    res.render("login", {
      errors: errors,
      SignupErrors: true,
      user: userData,
    });
  }
});

router.get("/logout", async (req, res) => {
  req.session.destroy();
  console.log("Logged OUt!");
  res.redirect("login");
});

export default router;
