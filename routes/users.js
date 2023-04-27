import { Router } from "express";
const router = Router();
import { userFxns } from "../data/index.js";
import { kanbanFxns } from "../data/index.js";
import validation from "../validation.js";

router.route("/privateUser/:id").get(async (req, res) => {
  try {
    req.params.id = validation.checkId(req.params.id, "Id URL Param");
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  try {
    const user = await userFxns.getUserById(req.params.id);
    const userGroup = user.groups[0];
    const userInKanban = await kanbanFxns.getUserinKanban(
      req.params.id,
      userGroup
    );
    res.render("profile", {
      Groups: user.groups,
      User: user.username,
      userId: req.params.id,
      Prizes: userInKanban.rewards,
    });
  } catch (e) {
    res.status(404).json({ error: e });
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
router.route("/accountsPage/:id").get(async (req, res) => {
  try {
    req.params.id = validation.checkId(req.params.id, "Id URL Param");
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  try {
    const user = await userFxns.getUserById(req.params.id); //Not used
    res.render("accounts", { userId: req.params.id }); //Change this to render when we have pages
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

export default router;
