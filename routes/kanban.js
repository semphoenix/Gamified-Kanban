import { Router } from "express";
const router = Router();
import { kanbanFxns } from "../data/index.js";
import { taskFxns } from "../data/index.js";
import validation from "../validation.js";

router.route("/:kanbanId").get(async (req, res) => {
  let kanbanId;
  try {
    kanbanId = validation.checkId(req.params.kanbanId, "Id URL Param");
  } catch (e) {
    return res.status(400).render("error", { error: "Invalid Id" });
  }
  try {
    const kanban = await kanbanFxns.getKanbanById(kanbanId);
    let user = req.session.user;
    res.render("kanban", {
      groupName: kanban.groupName,
      kanbanId: kanban._id.toString(),
      Groups: user.groups,
      todoTasks: await taskFxns.getSomeTasks(kanbanId, 0),
      inprogressTasks: await taskFxns.getSomeTasks(kanbanId, 1),
      inreviewTasks: await taskFxns.getSomeTasks(kanbanId, 2),
    });
  } catch (e) {
    res
      .status(404)
      .render("error", { error: "Kanban of that id does not exist!" });
  }
});

router
  .route("/createKanban")
  .get(async (req, res) => {
    try {
      res.json("kanbanPage"); //Change this to render when we have pages
    } catch (e) {
      res.status(404).json({ error: e });
    }
  })
  .post(async (req, res) => {
    const kanbanData = req.body;
    if (!kanbanData || Object.keys(kanbanData).length === 0) {
      return res
        .status(400)
        .json({ error: "There are no fields in the request body" });
    }
    try {
      kanbanData.ownerId = validation.checkId(kanbanData.ownerId, "Owner Id");
      kanbanData.groupName = validation.checkString(
        kanbanData.groupName,
        "Group Name"
      );
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    try {
      const { ownerId, groupName } = kanbanData;
      const newKanban = await kanbanFxns.createKanban(ownerId, groupName);
      res.json(newKanban); //Change to render later
    } catch (e) {
      res.status(500).json({ error: e });
    }
  });
router.route("/:kanbanId/gacha").get(async (req, res) => {});

router
  .route('/:kanbanId/gatcha')
  .get(async (req, res) => {
    try{
        req.params.id = validation.checkId(req.params.kanbanId, "Id Url Param")
        res.json("GATCHA PAGE") // TODO: Change to render the gatcha page
    } catch(e){
        res.status(404).json({error: e})
    }
  })
  .post(async (req, res) =>{
    try{
        req.params.id = validation(checkId(req.params.kanbanId, "Id Url Param"))
        let updated_user = await kanbanFxns.playGame(req.session.user.userId, req.params.id)
        res.json("Yay you did it") // TODO: Change to render the gatcha page with new amount of points
    } catch(e){
        res.status(404).json({error:e})
    }
  })

export default router;
