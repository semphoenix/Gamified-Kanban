const router = Router();
import { Router } from "express";
import { userFxns } from "../data/index.js";
import { kanbanFxns } from "../data/index.js";
import validation from "../validation.js";
import session from "express-session";

router.route("/privateUser")
  .get(async (req, res) => {
    try {
      // Check the cookie for user info
      if(!req.session.user) throw "Route: privateUser ~ User does not have authenticated cookie!"
      const user = await userFxns.getUserById(req.session.user._id);

      // Make sure user is part of a group
      if(user.groups.length === 0) throw "Route: privateUser ~ User should be part of a group before getting here!"

      // Check the cookie for SelectedKanbanId & default to first group if not found
      if(!req.session.selectedKanbanId) req.session.selectedKanbanId = user.groups[0];

      // Get Kanban information using group & session id
      const kanbans = await kanbanFxns.getAllKanbans(user.groups)
      const selectedKanban = await kanbanFxns.getKanbanById(req.session.selectedKanbanId)

      res.render("profile", {
        groups: kanbans,
        currentKanban: selectedKanban,
        user: user.username,
        userId: user._id,
        prizes: selectedKanban.Prizes,
      });
    } catch (e) {
      res.status(404).json({ error: e });
    }
})
  // Used to change the selectedKanbanId & reset the page
  .post(async (req, res) => {
    try{
      let content = req.body
      content.chooseGroup = validation.checkId(content.chooseGroup)
      req.session.selectedKanbanId = content.chooseGroup
      return res.redirect("/user/privateUser")
    } catch(e){
      res.status(404).json({error: e})
    }
  });

  // router.route("/publicUser/:id").get(async (req, res) => {
//   try {
//     req.params.id = validation.checkId(req.params.id, "Id URL Param");
//   } catch (e) {
//     return res.status(400).json({ error: e });
//   }
//   try {
//     const user = await userFxns.getUserById(id);
//     res.json(user); //Change this to render when we have pages
//   } catch (e) {
//     res.status(404).json({ error: e });
//   }
// });

router.route("/accountsPage").get(async (req, res) => {
  try {
    if(!req.session.user) throw "Router: /acocountsPage ~ User param not attached to session cookie!"
    req.session.user._id = validation.checkId(req.session.user._id, "User Id");
  } catch (e) {
    return res.status(400).json({ error: e });
  }

  try {
    const user = await userFxns.getUserById(req.session.user._id); //Not used
    res.render("accounts", {
      userId: req.session.user._id,
      username: user.username,
    }); //Change this to render when we have pages
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

export default router;
