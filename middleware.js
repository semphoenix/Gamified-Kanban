import express from "express";
const app = express();
import { kanbanFxns } from "./data/index";

let myMiddleWares = () => {
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
      if (isAuth) return res.redirect(`/user/privateUser/:${id}`);
      else return res.redirect("/login");
    }
    next();
  });

  app.use("/login", async (req, res, next) => {
    if (isAuth) {
      res.redirect(`/privateUser/:${id}`);
      return;
    }
    next();
  });

  app.use("/signup", async (req, res, next) => {
    if (isAuth) {
      res.redirect(`/privateUser/:${id}`);
      return;
    }
    next();
  });
  app.use("/user", async (req, res, next) => {
    if (!isAuth) {
      return res.redirect("/login");
    } else if (isAuth) {
      return res.redirect(`/user/privateUser/:${id}`);
    }
    next();
  });
  app.use("/user/privateUser", async (req, res, next) => {
    if (!isAuth) {
      return res.redirect("/login");
    } else if (isAuth) {
      return res.redirect(`/user/privateUser/:${id}`);
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
      return res.redirect("/login");
    } else if (id !== req.params.id) {
      return res.redirect(`/user/publicUser/:${id}`);
    }
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
    } else if (id === req.params.id) {
      return res.redirect(`/user/accountsPage/:${id}`); //Should user be able to access their public page??
    }
    next();
  });
  app.use("/kanban", async (req, res, next) => {
    if (!isAuth) {
      return res.redirect("/login");
    } else if (isAuth) {
      return res.redirect(`/privateUser/:${id}`); //Or should this just be error
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
        return res.redirect(`/user/privateUser/:${id}`); //Or should this just be error
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
};
export default myMiddleWares;
