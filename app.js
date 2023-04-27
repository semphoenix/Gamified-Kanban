//Here is where you'll set up your server as shown in lecture code
import express from "express";
const app = express();
import configRoutes from "./routes/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import exphbs from "express-handlebars";
import session from "express-session";
import { kanbanFxns } from "./data/index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const staticDir = express.static(__dirname + "/public");

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

app.use("/public", staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(express.json());
app.use(
  session({
    name: "AuthCookie",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: false,
  })
);

let isAuth;
let id;
app.use(async (req, res, next) => {
  if (req.session.user) {
    isAuth = true;
    id = req.session.user._id.toString();
  } else {
    isAuth = false;
  }
  if (req.path === "/") {
    if (isAuth) return res.redirect(`/user/privateUser/${id}`);
    else return res.redirect("/login");
  }
  next();
});

app.use("/login", async (req, res, next) => {
  if (isAuth) {
    res.redirect(`/privateUser/${id}`);
    return;
  }
  next();
});

app.use("/signup", async (req, res, next) => {
  if (isAuth) {
    res.redirect(`/privateUser/${id}`);
    return;
  }
  next();
});
app.use("/user", async (req, res, next) => {
  if (req.path === "/user") {
    if (!isAuth) {
      console.log("Not AUth");
      return res.redirect("/login");
    } else if (isAuth) {
      console.log("AUth");
      return res.redirect(`/user/privateUser/${id}`);
    }
  }
  next();
});
app.use("/user/privateUser", async (req, res, next) => {
  if (req.path === "/user/privateUser") {
    if (!isAuth) {
      console.log("Not AUth");
      return res.redirect("/login");
    } else if (isAuth) {
      console.log("AUth");
      return res.redirect(`/user/privateUser/${id}`);
    }
  }

  next();
});
// app.use("/user/publicUser", async (req, res, next) => {
//   if (!isAuth) {
//     return res.redirect("/login");
//   } else if (isAuth) {
//     return res.redirect(`/user/privateUser/:${id}`);
//   }
//   next();
// });
app.use("/user/privateUser/:id", async (req, res, next) => {
  if (!isAuth) {
    console.log("Not Auth!");
    return res.redirect("/login");
  }
  console.log("Auth");
  next();
});
// app.use("/user/publicUser/:id", async (req, res, next) => {
//   if (!isAuth) {
//     return res.redirect("/login");
//   } else if (id === req.params.id) {
//     return res.redirect(`/user/:privateUser${id}`); //Should user be able to access their public page??
//   }
//   next();
// });
app.use("/user/accountsPage/:id", async (req, res, next) => {
  if (!isAuth) {
    return res.redirect("/login");
  } else if (id !== req.params.id) {
    return res.render("error", {
      error: "Not authorized to use user's profile",
    }); //Should user be able to access their public page??
  }
  next();
});
app.use("/kanban", async (req, res, next) => {
  if (req.path === "/kanban") {
    if (!isAuth) {
      return res.redirect("/login");
    } else if (isAuth) {
      return res.redirect(`/accountsPage/${id}`); //Or should this just be error
    }
  }
  next();
});
app.use("/kanban/:kanbanId", async (req, res, next) => {
  if (!isAuth) {
    return res.redirect("/login");
  } else {
    const kanban = await kanbanFxns.getKanbanById(req.params.kanbanId);
    let usersInKanban = kanban.groupUsers.map(function (obj) {
      return obj.userId;
    });
    if (!usersInKanban.includes(id)) {
      return res.redirect(`/user/privateUser/${id}`); //Or should this just be error
    }
  }
  next();
});
app.use("/kanban/createKanban", async (req, res, next) => {
  if (!isAuth) {
    return res.redirect("/login");
  }
  next();
});
app.use("/error", async (req, res, next) => {
  if (!isAuth) {
    return res.redirect("/login");
  }
  next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
