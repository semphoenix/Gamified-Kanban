import { compareSync } from "bcrypt";
import { Router } from "express";
const router = Router();
import { kanbanFxns, userFxns } from "../data/index.js";
import { taskFxns } from "../data/index.js";
import validation from "../validation.js";
import xss from 'xss'

router
  .route("/kanbans")
  .get(async (req, res) => {
    try {
      // Define temp variable for user
      const user = req.session.user;

      // Check session cookie for selectedKanbanId and load in data
      validation.checkId(req.session.selectedKanbanId);
      const selectedKanban = await kanbanFxns.getKanbanById(
        req.session.selectedKanbanId
      );

      console.log(user.groups);
      let kanbans = await kanbanFxns.getAllKanbans(user.groups);
      console.log(kanbans);

      let todoTasks = await taskFxns.getSomeTasks(req.session.selectedKanbanId, 0);
      let inprogressTasks = await taskFxns.getSomeTasks(req.session.selectedKanbanId, 1);
      let inreviewTasks = await taskFxns.getSomeTasks(req.session.selectedKanbanId, 2);

      for (const task of todoTasks) {
        const username = await userFxns.getUsernameById(task.assignment);
        task.user = username;
      }

      for (const task of inprogressTasks) {
        const username = await userFxns.getUsernameById(task.assignment);
        task.user = username;
      }

      for (const task of inreviewTasks) {
        const username = await userFxns.getUsernameById(task.assignment);
        task.user = username;
        task.canVote = task.assignment !== req.session.user._id;
        let remainingVotesNeeded = 0;
        let users = Object.keys(task.votingStatus);
        users.forEach((user) => {
          if (task.votingStatus[user] === 0) remainingVotesNeeded += 1;
        })
        remainingVotesNeeded = Math.floor(remainingVotesNeeded/2);
        task.remainingVotesNeeded = remainingVotesNeeded;
      }

      res.render("kanban", {
        groupName: selectedKanban.groupName,
        kanbanId: selectedKanban._id.toString(),
        groups: kanbans,
        todoTasks: todoTasks,
        inprogressTasks: inprogressTasks,
        inreviewTasks: inreviewTasks,
      });
    } catch (e) {
      return res
        .status(404)
        .render("error", { error: "Kanban of that id does not exist!" });
    }
  })
  .post(async (req, res) => {
    // Initializing variables
    let {chooseGroup, kanbanId, userId, name, description, difficulty, status } = req.body;
    let postType = "";

    try { 
      console.log(chooseGroup)
      // If no necessary data avaialble through error
      if (!req.body) {
        throw "Route: Kanbans/ ~ A form submitted with no necessary data";
      }
      // If the post request is for "chooseGroup"
      else if (chooseGroup){
        postType = "Choose Group";
        chooseGroup = validation.checkId(
          chooseGroup,
          "chooseGroup"
        );
      }
      // If the post request if for "createTask"
      else {
        postType = "Create Task";
        kanbanId = validation.checkId(kanbanId, "kanbanId");
        userId = validation.checkId(userId, "userId");
        name = validation.checkString(xss(name), "name");
        description = validation.checkString(xss(description), "description");
        difficulty = validation.checkDifficulty(difficulty, "difficulty");
        status = validation.checkStatus(status, "status");
      }
    } catch (e) {
      return res.status(400).render("error", { error: e });
    }

    try {
      // Process response for "Choose Group" post request
      if (postType === "Choose Group") {
        req.session.selectedKanbanId = chooseGroup;
        return res.redirect("/kanban/kanbans");
      }

      // Process response for "Create Task" post request
      else if (postType === "Create Task") {
        const newTask = await taskFxns.createTask(
          kanbanId,
          userId,
          name,
          description,
          difficulty,
          status
        );
        return res.status(200).json(newTask);
      } else {
        throw "Route: Kanbans/ ~ Something went wrong with the post request";
      }
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  });

router
  .route("/createTask")
  .post(async (req, res) => {
    console.log("/createTask", req.body);
    let { taskname, taskdescription, taskdifficulty } = req.body;
    console.log("taskname", taskname);
    taskname = validation.checkString(taskname, "route /createTask taskname");
    taskdescription = validation.checkString(
      taskdescription,
      "route /createTask taskdescription"
    );
    taskdifficulty = validation.checkDifficulty(
      Number(taskdifficulty),
      "route /createTask taskdifficulty"
    );
    let created = await taskFxns.createTask(
      req.session.selectedKanbanId,
      req.session.user._id,
      taskname,
      taskdescription,
      taskdifficulty,
      0
    );
    res.redirect("/kanban/kanbans");
});
  
router
  .route("/createKanban/joinGroup")
  .post(async (req, res) => {
    let user;
    let kanbanId;

    try{
      user = req.session.user
      user._id = validation.checkId(req.session.user._id)
    } catch (e){
      return res 
        .status(404)
        .render("error", {error: "User is not logged in!?"})
    }

    try{
      // Check the error code here
      if(user.groups.length >= 5) throw "User is already part of 5 groups!"
      kanbanId = req.body
      if(!kanbanId || Object.keys(kanbanId).length === 0) throw "There are no fields in the request body"
      if(!kanbanId['groupId']) throw "Incorrect field submitted to form!"
      kanbanId = validation.checkId(xss(kanbanId.groupId) , "Group Id") 
    } catch (e){
      return res
        .status(400)
        .render("createKanban", {username: user.username, error: e});
    }

    try{
      const updatedKanband = await kanbanFxns.addUsertoKanban(user._id, kanbanId)
      req.session.user = await userFxns.getUserById(user._id);
      req.session.selectedKanbanId = kanbanId
      return res.redirect(`/kanban/kanbans/`)
    } catch(e){
      return res
        .status(500)
        .render('error', {error: e})
    }
  })

router
  .route("/createKanban/createGroup")
  .post(async (req, res) => {
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
        xss(kanbanData.groupName),
        "Group Name"
      );
    } catch (e) {
      return res.status(400).render("error", { error: e });
    }
    try {
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
      return res.render("gatcha", { points: points });
    } catch (e) {
      return res.status(404).render("error", { error: e });
    }
  })
  .post(async (req, res) => {
    try {
      validation.checkId(req.session.selectedKanbanId, "Current Kanban");
      let updated_user = await kanbanFxns.playGame(
        req.session.user._id,
        req.session.selectedKanbanId
      );
      return res.render("gatcha", { points: updated_user.points }); // TODO: Change to render the gatcha page with new amount of points
    } catch (e) {
      let user;
      try {
        user = await kanbanFxns.getUserinKanban(
          req.session.user._id,
          req.session.selectedKanbanId
        );
      } catch (e) {
        res.status(500).render("error", { error: e });
      }
      return res.status(404).render({ error: e, points: user.points });
    }
  });

router
  .route("/completedTasks")
  .get(async (req, res) => {
    try{
        validation.checkId(req.session.selectedKanbanId, "Current Kanban")
      let completedTasks = await taskFxns.getSomeTasks(req.session.selectedKanbanId, 3)
      let voterUsers = []
      let voterIds =  []
      
      for(let i = 0; i < completedTasks.length; i++){
        voterIds = Object.keys(completedTasks[i].votingStatus)
        for(let j = 0; j < voterIds.length; j++){
          // Skip if the user is the same as the kanban
          if (completedTasks[i].assignment === voterIds[j]){
            continue
          }

          let username = await userFxns.getUsernameById(voterIds[j])
          let votingStatus = ""
          if(completedTasks[i].votingStatus[voterIds[j]] === 1){
            votingStatus = "approved"
          } else {
            votingStatus = "denied"
          }
          voterUsers.push({user: username, status: votingStatus})
        }
        completedTasks[i]["voterInfo"] = voterUsers
        voterUsers = []
      }
    
      return res.render("completed", {tasks: completedTasks})
    } catch (e){
      return res.status(404).render("completed", {tasks: [], error: e}) 
    }
  })

router.route("/vote/:taskId").patch(async (req, res) => {
  // for casting a vote
  let taskId = req.params.taskId;
  let { vote } = req.body;
  let userId = req.session.user._id;
  try {
    vote = validation.checkVote(+vote, "vote");
    taskId = validation.checkId(taskId, "taskId");
  } catch (e) {
    return res.status(400).render("error", { error: e });
  }

  try {
    const task = await taskFxns.castVote(userId, taskId, vote);
    let remainingVotesNeeded = 0;
    let users = Object.keys(task.votingStatus);
    users.forEach((user) => {
      if (task.votingStatus[user] === 0) remainingVotesNeeded += 1;
    })
    remainingVotesNeeded = Math.floor(remainingVotesNeeded/2);
    // checks to see if the voting status was updated
    return res.status(200).json({
      completed: task.status === 3,
      newVoteCount: remainingVotesNeeded
    });
  } catch (e) {
    console.log(e);
    return res.status(404).render("error", { error: e });
  }
});

router.route("/changeStatus/:taskId").patch(async (req, res) => {
  // for changing status
  let taskId = req.params.taskId;
  console.log(req.body);
  let { status } = req.body;
  status = +status;
  try {
    taskId = validation.checkId(taskId, "taskId");
    status = validation.checkStatus(status, "status");
  } catch (e) {
    console.log(e);
    return res.status(400).render("error", { error: e });
  }
  try {
    const task = await taskFxns.changeStatus(taskId, +req.body.status);
    let userId = req.session.user._id;
    const canVote = (task.assignment !== userId && task.status === 2 && task.votingStatus[userId] === 0);
    const users = Object.keys(task.votingStatus);
    return res.status(200).json({
      canVote: canVote, 
      remainingVotesNeeded: Math.floor(users.length/2),
    });
  } catch (e) {
    console.log(e);
    return res.status(404).render("error", { error: e });
  }
});

export default router;
