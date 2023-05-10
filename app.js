//Here is where you'll set up your server as shown in lecture code
import express from "express";
const app = express();
import configRoutes from "./routes/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import exphbs from "express-handlebars";
import session from "express-session";
import { kanbanFxns } from "./data/index.js";
import { userFxns } from "./data/index.js";
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
    selectedKanbanId: undefined,
    secret: "some secret string!",
    resave: false,
    saveUninitialized: false,
  })
);

let isAuth;
let id;
app.use("/", async (req, res, next) => {
  if (req.session.user) {
    isAuth = true;
    id = req.session.user._id.toString();
  } else {
    isAuth = false;
  }
  if (req.path === "/") {
    if (isAuth) return res.redirect(`/user/createKanban`);
    else return res.redirect("/landingPage");
  }
  next();
});
app.use("/landingPage", async (req, res, next) => {
  if (isAuth) {
    res.redirect(`/user/createKanban`);
    return;
  }
  next();
});
app.use("/login", async (req, res, next) => {
  if (isAuth) {
    res.redirect(`/user/createKanban`);
    return;
  }
  next();
});

app.use("/signup", async (req, res, next) => {
  if (isAuth) {
    res.redirect(`/user/createKanban`);
    return;
  }
  next();
});
app.use("/logout", async (req, res, next) => {
  if (!isAuth) {
    res.redirect(`/landingPage`);
    return;
  }
  next();
});
app.use("/user", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    } else if (isAuth) {
      return res.redirect(`/user/createKanban`);
    }
  }
  next();
});
app.use("/user/accountsPage", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
  }
  next();
});
app.use("/user/privateUser", async (req, res, next) => {
  // Have to check if you can access page
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
    let user = await userFxns.getUserById(id);
    if (user.groups === 0) {
      return res.render("error", {
        title: "Error Page",
        error: "You must be in at least one kanban to access profiles page",
        buttonTitle: "Back to create/join page",
        link: "/user/createKanban",
      });
    }
  }
  next();
});
app.use("/user/privateUser/selectPicture", async (req, res, next) => {
  // Have to check if you can access page
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
    try {
      let user = await userFxns.getUserById(id);
      if (user.groups === 0) {
        return res.status(403).render("error", {
          title: "Error Page",
          error: "You must be in at least one kanban to access profiles page",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
      }
    } catch (e) {
      return res.status(500).render("error", {
        title: "Error Page",
        error: "Internal Server Error",
      });
    }
  }
  next();
});
app.use("/user/privateUser/selectBorder", async (req, res, next) => {
  // Have to check if you can access page
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
    try {
      let user = await userFxns.getUserById(id);
      if (user.groups === 0) {
        return res.status(403).render("error", {
          title: "Error Page",
          error: "You must be in at least one kanban to access profiles page",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
      }
    } catch (e) {
      return res.status(500).render("error", {
        title: "Error Page",
        error: "Internal Server Error",
      });
    }
  }
  next();
});
app.use("/user/privateUser/selectColor", async (req, res, next) => {
  // Have to check if you can access page
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
    try {
      let user = await userFxns.getUserById(id);
      if (user.groups === 0) {
        return res.status(403).render("error", {
          title: "Error Page",
          error: "You must be in at least one kanban to access profiles page",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
      }
    } catch (e) {
      return res.status(500).render("error", { title: "Error Page", error: e });
    }
  }
  next();
});
app.use("/user/createKanban", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
  }
  next();
});
app.use("/kanban", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    } else if (isAuth) {
      return res.redirect(`/createKanban`);
    }
  }
  next();
});
app.use("/kanban/kanbans", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
    try {
      if (!req.session.selectedKanbanId)
        return res.status(403).render("error", {
          title: "Error Page",
          error: "There is no kanban in cookie!",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
      const kanban = await kanbanFxns.getKanbanById(
        req.session.selectedKanbanId
      );
      let usersInKanban = kanban.groupUsers.map((obj) => {
        return obj.userId;
      });
      if (!usersInKanban.includes(id)) {
        return res.status(403).render("error", {
          title: "Error Page",
          error: "Cannot access this kanban",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
      }
    } catch (e) {
      return res.status(500).render("error", { title: "Error Page", error: e });
    }
  }
  next();
});
app.use("/user/createKanban", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
  }
  next();
});
app.use("/user/createKanban/createGroup", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
    try {
      const user = await userFxns.getUserById(id);
      console.log(user.groups);
      if (user.groups.length >= 5)
        return res.status(403).render("error", {
          title: "Error Page",
          error: "User is already in 5 kanbans",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
    } catch (e) {
      return res.status(500).render("error", { title: "Error Page", error: e });
    }
  }
  next();
});
app.use("/user/createKanban/joinGroup", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
    try {
      const user = await userFxns.getUserById(id);
      if (user.groups.length >= 5)
        return res.status(403).render("error", {
          title: "Error Page",
          error: "User is already in 5 kanbans",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
    } catch (e) {
      return res.status(500).render("error", { title: "Error Page", error: e });
    }
  }
  next();
});
app.use("/kanban/createTask", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
    try {
      if (!req.session.selectedKanbanId)
        return res.status(403).render("error", {
          title: "Error Page",
          error: "There is no kanban in cookie!",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
      const kanban = await kanbanFxns.getKanbanById(
        req.session.selectedKanbanId
      );
      let usersInKanban = kanban.groupUsers.map((obj) => {
        return obj.userId;
      });
      if (!usersInKanban.includes(id)) {
        return res.status(403).render("error", {
          title: "Error Page",
          error: "Cannot access this kanban",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
      }
    } catch (e) {
      return res.status(500).render("error", { title: "Error Page", error: e });
    }
  }
  next();
});
app.use("/kanban/gatcha", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
    try {
      if (!req.session.selectedKanbanId)
        return res.status(403).render("error", {
          title: "Error Page",
          error: "There is no kanban in cookie!",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
      const kanban = await kanbanFxns.getKanbanById(
        req.session.selectedKanbanId
      );
      let usersInKanban = kanban.groupUsers.map((obj) => {
        return obj.userId;
      });
      if (!usersInKanban.includes(id)) {
        return res.status(403).render("error", {
          title: "Error Page",
          error: "Cannot access this kanban",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
      }
    } catch (e) {
      return res.status(500).render("error", { title: "Error Page", error: e });
    }
  }
  next();
});
app.use("/kanban/completedTasks", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
    try {
      if (!req.session.selectedKanbanId)
        return res.status(403).render("error", {
          title: "Error Page",
          error: "There is no kanban in cookie!",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
      const kanban = await kanbanFxns.getKanbanById(
        req.session.selectedKanbanId
      );
      let usersInKanban = kanban.groupUsers.map((obj) => {
        return obj.userId;
      });
      if (!usersInKanban.includes(id)) {
        return res.status(403).render("error", {
          title: "Error Page",
          error: "Cannot access this kanban",
          buttonTitle: "Back to create/join page",
          link: "/user/createKanban",
        });
      }
    } catch (e) {
      return res.status(500).render("error", { title: "Error Page", error: e });
    }
  }
  next();
});
app.use("/kanban/vote", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
    if (isAuth) {
      return res.redirect("/user/createKanban");
    }
  }
  next();
});
app.use("/kanban/vote/:taskId", async (req, res, next) => {
  if (!isAuth) {
    return res.redirect("/landingPage");
  }
  try {
    if (!req.session.selectedKanbanId)
      return res.status(403).render("error", {
        title: "Error Page",
        error: "There is no kanban in cookie!",
        buttonTitle: "Back to create/join page",
        link: "/user/createKanban",
      });
    const kanban = await kanbanFxns.getKanbanById(req.session.selectedKanbanId);
    let usersInKanban = kanban.groupUsers.map((obj) => {
      return obj.userId;
    });
    if (!usersInKanban.includes(id)) {
      return res.status(403).render("error", {
        title: "Error Page",
        error: "Cannot access this kanban",
        buttonTitle: "Back to create/join page",
        link: "/user/createKanban",
      });
    }
  } catch (e) {
    return res.status(500).render("error", { title: "Error Page", error: e });
  }
  next();
});
app.use("/kanban/changeStatus", async (req, res, next) => {
  if (req.path === "/") {
    if (!isAuth) {
      return res.redirect("/landingPage");
    }
    if (isAuth) {
      return res.redirect("/user/createKanban");
    }
  }
  next();
});
app.use("/kanban/changeStatus/:taskId", async (req, res, next) => {
  if (!isAuth) {
    return res.redirect("/landingPage");
  }
  try {
    if (!req.session.selectedKanbanId)
      return res.status(403).render("error", {
        title: "Error Page",
        error: "There is no kanban in cookie!",
        buttonTitle: "Back to create/join page",
        link: "/user/createKanban",
      });
    const kanban = await kanbanFxns.getKanbanById(req.session.selectedKanbanId);
    let usersInKanban = kanban.groupUsers.map((obj) => {
      return obj.userId;
    });
    if (!usersInKanban.includes(id)) {
      return res.status(403).render("error", {
        title: "Error Page",
        error: "Cannot access this kanban",
        buttonTitle: "Back to create/join page",
        link: "/user/createKanban",
      });
    }
  } catch (e) {
    return res.status(500).render("error", { title: "Error Page", error: e });
  }
  next();
});
app.use("/error", async (req, res, next) => {
  if (!isAuth) {
    return res.redirect("/landingPage");
  }
  next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
