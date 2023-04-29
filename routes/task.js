import { Router } from "express";
const router = Router();
import { taskFxns } from "../data/index.js";
import validation from "../validation.js";

//casting a vote
router.route("/vote/:taskId").patch(async (req, res) => {
  // for casting a vote
  let taskId = req.params.taskId;
  let { userId, vote } = req.body;
  try {
    vote = validation.checkVote(vote, "vote");
    userId = validation.checkId(userId, "userId");
    taskId = validation.checkId(taskId, "taskId");
  } catch (e) {
    return res.status(400).render("error", { error: e });
  }

  try {
    const votingStatus = await taskFxns.castVote(userId, taskId, vote);
    // checks to see if the voting status was updated
    res.status(200).render("kanban", )
  } catch (e) {
    res.status(404).render("error", { error: e });
  }
});

//changing status
router.route("/changeStatus/:taskId").put(async (req, res) => {
  // for changing status
  let taskId = req.params.taskId;
  let { newStatus } = req.body;
  try {
    taskId = validation.checkId(taskId, "taskId");
    newStatus = validation.checkStatus(newStatus, "status");
  } catch (e) {
    return res.status(400).json({ error: e });
  }

  try {
    const task = await taskFxns.changeStatus(taskId, newStatus);
    res.status(200).json(task);
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

export default router;
