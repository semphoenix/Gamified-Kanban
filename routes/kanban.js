import { Router } from "express";
const router = Router();
import { kanbanFxns, userFxns } from "../data/index.js";
import { taskFxns } from "../data/index.js";
import validation from "../validation.js";

router
  .route("/kanbans")
  .get(async (req, res) => {
    try {
      // Define temp variable for user
      const user = req.session.user

      // Check session cookie for selectedKanbanId and load in data
      validation.checkId(req.session.selectedKanbanId)
      const selectedKanban = await kanbanFxns.getKanbanById(req.session.selectedKanbanId);

      // For selectedKanban, get todoTasks & load kanbans for dropdown
      const todoTasks = await taskFxns.getSomeTasks(req.session.selectedKanbanId, 0);
      console.log(user.groups)
      let kanbans = await kanbanFxns.getAllKanbans(user.groups)
      console.log(kanbans)

      res.render("kanban", {
        groupName: selectedKanban.groupName,
        kanbanId: selectedKanban._id.toString(),
        groups: kanbans,
        todoTasks: todoTasks,
        inprogressTasks: await taskFxns.getSomeTasks(req.session.selectedKanbanId, 1),
        inreviewTasks: await taskFxns.getSomeTasks(req.session.selectedKanbanId, 2)
      });
    } catch (e) {
      return res
        .status(404)
        .render("error", { error: "Kanban of that id does not exist!" });
    }
  })
  .post(async (req, res) => {
    // Initializing variables
    let { userId, name, description, difficulty, status } = ""
    let content;
    let postType = ""

    try {
      content = req.body
      console.log(content)
      // If no necessary data avaialble through error
      if(!content){
        throw "Route: Kanbans/ ~ A form submitted with no necessary data"        
      } 
      // If the post request is for "chooseGroup"
      else if(!("kanbanId" in content) || ("userId" in content) || ("name" in content) || ("description" in content) || ("difficulty" in content) || ("status" in content)){
        postType = "Choose Group"
        content.chooseGroup = validation.checkId(content.chooseGroup, "chooseGroup")
      } 
      // If the post request if for "createTask"
      else {
        postType = "Create Task"
        let { userId, name, description, difficulty, status } = req.body;
        kanbanId = validation.checkId(kanbanId, "kanbanId");
        userId = validation.checkId(userId, "userId");
        name = validation.checkString(name, "name");
        description = validation.checkString(description, "description");
        difficulty = validation.checkDifficulty(difficulty, "difficulty");
        status = validation.checkStatus(status, "status");
      }

    } catch (e) {
      return res.status(400).render("error", { error: e });
    }

    try {
      // Process response for "Choose Group" post request
      if (postType === "Choose Group"){
        req.session.selectedKanbanId = content.chooseGroup
        return res.redirect("/kanban/kanbans")
      } 

      // Process response for "Create Task" post request
      else if (postType === "Create Task"){
        const newTask = await taskFxns.createTask(
          kanbanId,
          userId,
          name,
          description,
          difficulty,
          status
        )
        return res.status(200).json(newTask);
      } else{
        throw "Route: Kanbans/ ~ Something went wrong with the post request"
      }

    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

router.route("/createTask").post(async(req,res) => {
  console.log("/createTask", req.body);
  let {taskname, taskdescription, taskdifficulty} = req.body;
  console.log("taskname", taskname);
  taskname = validation.checkString(taskname, "route /createTask taskname");
  taskdescription = validation.checkString(taskdescription, "route /createTask taskdescription");
  taskdifficulty = validation.checkDifficulty(Number(taskdifficulty), "route /createTask taskdifficulty");
  let created = await taskFxns.createTask(req.session.selectedKanbanId, req.session.user._id, taskname, taskdescription, taskdifficulty, 0)
  res.status(200).json(created);
})
router.route("/createKanban").post(async (req, res) => {
  console.log("createKanban");
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
  let kanbanData = req.body;
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
    console.log("creating kanban");
    const { groupName } = kanbanData;
    const newKanban = await kanbanFxns.createKanban(ownerId, groupName);
    req.session.user = await userFxns.getUserById(user._id);
    req.session.selectedKanbanId = newKanban._id
    return res.redirect(`/kanban/kanbans`);
  } catch (e) {
    return res.status(500).render("error", { error: e });
  }
});

router
  .route("/gatcha")
  .get(async (req, res) => {
    try {
      validation.checkId(req.session.selectedKanbanId, "Current Kanban");
      const points = await kanbanFxns.getUserPoints(
        req.session.user._id, 
        req.session.selectedKanbanId
      );
      return res.render("gatcha", {points: points});
    } catch (e) {
      return res.status(404).render('gatcha', {error: e, points:"---"});
    }
  })
  .post(async (req, res) => {
    try {
      validation.checkId(req.session.selectedKanbanId, "Current Kanban");
      let updated_user = await kanbanFxns.playGame(
        req.session.user.userId,
        req.session.selectedKanbanId
      );
      return res.render("gatcha", {points: updated_user.points}); // TODO: Change to render the gatcha page with new amount of points
    } catch (e) {
      return res.status(404).json({error: e, points: "---"});
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
      groups: user.groups,
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
      groups: user.groups,
      todoTasks: await taskFxns.getSomeTasks(kanbanId, 0),
      inprogressTasks: await taskFxns.getSomeTasks(kanbanId, 1),
      inreviewTasks: await taskFxns.getSomeTasks(kanbanId, 2),
    });
  } catch (e) {
    return res.status(404).render("error", { error: e });
  }
});

export default router;
