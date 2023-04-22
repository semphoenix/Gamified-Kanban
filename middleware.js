import express from "express";
const app = express();
import { kanbanFxns } from "./data/index";

let myMiddleWares = () => {
  async (req, res, next) => {
    let isAuth;
    let id;
    if (req.session.user) {
      isAuth = true;
      id = req.session.user._id.toString();
    } else {
      isAuth = false;
    }
    if (req.path === "/") {
      if (isAuth) {
        res.redirect(`/privateuser/:${id}`);
        return;
      } else {
        res.redirect("/login");
        return;
      }
    } else if (req.path === "/login") {
      if (isAuth) {
        res.redirect(`/privateuser/:${id}`);
        return;
      }
    } else if (req.path === "/signup") {
      if (isAuth) {
        res.redirect(`/privateuser/:${id}`);
        return;
      }
    } else if (req.path === "/privateuser/:id") {
      if (!isAuth) {
        res.redirect("/login");
        return;
      } else if (id !== req.params.id) {
        res.redirect(`/user/:${id}`);
        return;
      }
    } else if (req.path === "/kanban") {
      if (!isAuth) {
        res.redirect("/login");
        return;
      } else {
        res.redirect(`/privateuser/:${id}`); //Or should this just be error
        return;
      }
    } else if (req.path === "/error") {
      // Do we need an error page
      if (!isAuth) {
        res.redirect("/login");
        return;
      } else {
        res.redirect(`/privateuser/:${id}`);
      }
    } else if (req.path === "/kanban/:kanbanId") {
      if (!isAuth) {
        res.redirect("/login");
        return;
      } else {
        const kanban = await kanbanFxns.getKanbanById(req.params.kanbanId);
        let usersInKanban = kanban.groupUsers.map(function (obj) {
          return obj.userId;
        });
        if (!usersInKanban.includes(userId)) {
          res.redirect(`/privateuser/:${id}`); //Or should this just be error
          return;
        }
      }
    } else if (req.path === "/kanban/createKanban") {
      if (!isAuth) {
        res.redirect("/login");
        return;
      }
    } else if (req.path === "/logout") {
      if (!isAuth) {
        res.redirect("login");
        return;
      }
    }
    next();
  };
};
export default myMiddleWares;
