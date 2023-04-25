import { Router } from "express";
const router = Router();
import { kanbanFxns } from "../data/index.js";
import validation from "../validation.js";

router.route("/:kanbanId").get(async (req, res) => {
  try {
    req.params.kanbanId = validation.checkId(
      req.params.kanbanId,
      "Id URL Param"
    );
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  try {
    const kanban = await kanbanFxns.getKanbanById(req.params.kanbanId);
    res.json(kanban); //Change this to render when we have pages
  } catch (e) {
    res.status(404).json({ error: e });
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

export default router;
