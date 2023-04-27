import { Router } from "express";
const router = Router();
import { kanbanFxns } from "../data/index.js";
import { taskFxns } from "../data/index.js";
import validation from "../validation.js";

router
  .route("/:kanbanId")
  .get(async (req, res) => {
    let kanbanId;
    try {
      kanbanId = validation.checkId(req.params.kanbanId, "Id URL Param");
    } catch (e) {
      return res.status(400).render("error", { error: "Invalid Id" });
    }
    try {
      const kanban = await kanbanFxns.getKanbanById(kanbanId);
      let user = req.session.user;
      let todoTasks = await taskFxns.getSomeTasks(kanbanId, 0);
      console.log(todoTasks);
      res.render("kanban", {
        groupName: kanban.groupName,
        kanbanId: kanban._id.toString(),
        Groups: user.groups,
        todoTasks: todoTasks,
        inprogressTasks: await taskFxns.getSomeTasks(kanbanId, 1),
        inreviewTasks: await taskFxns.getSomeTasks(kanbanId, 2),
      });
    } catch (e) {
      return res
        .status(404)
        .render("error", { error: "Kanban of that id does not exist!" });
    }
  })
  .post(async (req, res) => {
    // for adding a task
    let kanbanId = req.params.kanbanId;
    let { userId, name, description, difficulty, status } = req.body;
    try {
      kanbanId = validation.checkId(kanbanId, "kanbanId");
      userId = validation.checkId(userId, "userId");
      name = validation.checkString(name, "name");
      description = validation.checkString(description, "description");
      difficulty = validation.checkDifficulty(difficulty, "difficulty");
      status = validation.checkStatus(status, "status");
    } catch (e) {
      return res.status(400).render("error", { error: e });
    }
    try {
      const newTask = await taskFxns.createTask(
        kanbanId,
        userId,
        name,
        description,
        difficulty,
        status
      );
      return res.status(200).json(newTask);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

router.route("/createKanban").post(async (req, res) => {
  let user;
  let ownerId;
  try {
    user = req.session.user;
    ownerId = user._id.toString();
  } catch (e) {
    return res
      .status(404)
      .render("error", { error: "There are no fields in the request body" });
  }
  const kanbanData = req.body;
  if (!kanbanData || Object.keys(kanbanData).length === 0) {
    return res
      .status(400)
      .render("error", { error: "There are no fields in the request body" });
  }
  try {
    ownerId = validation.checkId(ownerId, "Owner Id");
    kanbanData.groupName = validation.checkString(
      kanbanData.groupName,
      "Group Name"
    );
  } catch (e) {
    return res.status(400).render("error", { error: e });
  }
  try {
    const { groupName } = kanbanData;
    const newKanban = await kanbanFxns.createKanban(ownerId, groupName);
    return res.redirect(`/kanban/:${newKanban._id.toString()}`);
  } catch (e) {
    return res.status(500).render("error", { error: e });
  }
});

router
  .route("/:kanbanId/gatcha")
  .get(async (req, res) => {
    try {
      req.params.id = validation.checkId(req.params.kanbanId, "Id Url Param");
      return res.json("GATCHA PAGE"); // TODO: Change to render the gatcha page
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })
  .post(async (req, res) => {
    try {
      req.params.id = validation(checkId(req.params.kanbanId, "Id Url Param"));
      let updated_user = await kanbanFxns.playGame(
        req.session.user.userId,
        req.params.id
      );
      return res.json("Yay you did it"); // TODO: Change to render the gatcha page with new amount of points
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });
router.route(":kanbanId/vote/:taskId").patch(async (req, res) => {
  // for casting a vote
  let taskId = req.params.taskId;
  let kanbanId = req.params.kanbanId;
  let { userId, vote } = req.body;
  try {
    vote = validation.checkVote(vote, "vote");
    userId = validation.checkId(userId, "userId");
    taskId = validation.checkId(taskId, "taskId");
    kanbanId = validation.checkId(kanbanId, "kanbanId");
  } catch (e) {
    return res.status(400).render("error", { error: e });
  }

  try {
    await taskFxns.castVote(userId, taskId, vote);
    const kanban = await kanbanFxns.getKanbanById(kanbanId);
    let user = req.session.user;
    // checks to see if the voting status was updated
    return res.render("kanban", {
      groupName: kanban.groupName,
      kanbanId: kanban._id.toString(),
      Groups: user.groups,
      todoTasks: await taskFxns.getSomeTasks(kanbanId, 0),
      inprogressTasks: await taskFxns.getSomeTasks(kanbanId, 1),
      inreviewTasks: await taskFxns.getSomeTasks(kanbanId, 2),
    });
  } catch (e) {
    return res.status(404).render("error", { error: e });
  }
});
router.route(":kanbanId/changeStatus/:taskId").patch(async (req, res) => {
  // for changing status
  let taskId = req.params.taskId;
  let kanbanId = req.params.kanbanId;
  let { newStatus } = req.body;
  try {
    taskId = validation.checkId(taskId, "taskId");
    kanbanId = req.params.kanbanId;
    newStatus = validation.checkStatus(newStatus, "status");
  } catch (e) {
    return res.status(400).render("error", { error: e });
  }
  try {
    await taskFxns.changeStatus(taskId, newStatus);
    const kanban = await kanbanFxns.getKanbanById(kanbanId);
    let user = req.session.user;
    return res.status(200).render("kanban", {
      groupName: kanban.groupName,
      kanbanId: kanban._id.toString(),
      Groups: user.groups,
      todoTasks: await taskFxns.getSomeTasks(kanbanId, 0),
      inprogressTasks: await taskFxns.getSomeTasks(kanbanId, 1),
      inreviewTasks: await taskFxns.getSomeTasks(kanbanId, 2),
    });
  } catch (e) {
    return res.status(404).render("error", { error: e });
  }
});

export default router;
