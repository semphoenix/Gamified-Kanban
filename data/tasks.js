import kanbanFxns from "./kanban.js";
import userFxns from "./users.js";
import validation from "../validation.js";
import { kanbans } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

let exportedMethods = {
  /**
   * Info for creating a task
   * @param {ObjectId} kanbanId
   * @param {ObjectId} userId
   * @param {string} name
   * @param {string} description
   * @param {int} difficulty
   * @param {int} status
   * @returns task object
   */
  async createTask(kanbanId, userId, name, description, difficulty, status) {
    kanbanId = validation.checkId(kanbanId, "kanbanId");
    userId = validation.checkId(userId, "userId");
    name = validation.checkString(name, "name");
    description = validation.checkString(description, "description");
    difficulty = validation.checkDifficulty(difficulty, "difficulty");
    status = validation.checkStatus(status, "status");
    // voting status -- init each to -1
    let kanban = await kanbanFxns.getKanbanById(kanbanId);
    const votingStatus = kanban.groupUsers.reduce((uid, obj) => {
      Object.keys(obj).forEach((key) => {
        if (key === "userId") uid[obj[key]] = -1; // -1 means user hasn't voted yet
      });
      return uid;
    }, {});

    // any limit on number of tasks per kanban or per users?
    const newTask = {
      _id: new ObjectId(),
      kanbanId: kanbanId,
      assignment: userId,
      name: name,
      description: description,
      difficulty: difficulty,
      status: status,
      votingStatus: votingStatus,
    };
    kanban.tasks.push(newTask);
    const updateInfo = {
      tasks: kanban.tasks,
    };
    const kanbanCollection = await kanbans();
    const insertInfo = await kanbanCollection.findOneAndUpdate(
      { _id: new ObjectId(kanbanId) },
      { $set: updateInfo },
      { returnDocument: "after" }
    );
    if (insertInfo.lastErrorObject.n === 0) throw "Error: createTask failed";
    return newTask;
  },
  /**
   * @param {ObjectId} taskId
   * @returns task object
   */
  async getTask(taskId) {
    taskId = validation.checkId(taskId);
    let kanbanCollection = await kanbans();
    const kanban = await kanbanCollection.findOne({
      tasks: { $elemMatch: { _id: new ObjectId(taskId) } },
    });
    if (!kanban) throw "album get: album id does not exist";
    let task;
    kanban.tasks.forEach((t) => {
      if (t._id == taskId) task = t;
    });
    return task;
  },
  /**
   * @param {ObjectId} kanbanId
   * @returns kanban tasks as strings
   */
  async getAllTasks(kanbanId) {
    kanbanId = validation.checkId(kanbanId);
    let kanban = await kanbanFxns.getKanbanById(kanbanId);
    if (kanban === null) throw "Error getAllTasks: No kanban with that id";
    kanban.tasks = kanban.tasks.map((t) => {
      t._id = t._id.toString();
      return e;
    });
    return kanban.tasks;
  },
  /**
   * changes the status of a task
   * @param {ObjectId} taskId
   * @param {int} newStatus
   * @returns task
   */
  async changeStatus(taskId, newStatus) {
    taskId = validation.checkId(taskId, "changeStatus taskId");
    newStatus = validation.checkStatus(newStatus, "status");
    let kanbanCollection = await kanbans();
    const kanban = await kanbanCollection // get the tasks
      .findOne(
        { tasks: { $elemMatch: { _id: new ObjectId(taskId) } } },
        { tasks: 1, _id: 1 }
      );
    let tasks = kanban.tasks;
    let task;
    kanban.tasks.forEach((t) => {
      if (t._id.toString() == taskId) task = t;
    });
    task.status = newStatus;
    if (task.status < 2) {
      // resets votes if it's dragged out of inreview
      Object.keys(task.votingStatus).forEach(function (user) {
        task.votingStatus[user] = -1;
      });
    }
    const insertInfo = await kanbanCollection.findOneAndUpdate(
      { _id: kanban._id },
      { $set: { tasks: tasks } },
      { returnDocument: "after" }
    );
    if (insertInfo.lastErrorObject.n === 0) throw "Error: changeStatus failed";
    return task;
  },

  /**
   * lets userId vote on a task for a given kanbanId. can change vote. only 0 or 1.
   * @param {ObjectId} userId
   * @param {ObjectId} taskId
   * @param {int} vote
   * @returns task.votingStatus
   */
  async castVote(userId, taskId, vote) {
    userId = validation.checkId(userId, "userId");
    taskId = validation.checkId(taskId, "taskId");
    vote = validation.checkVote(vote, "vote");
    let kanbanCollection = await kanbans();
    const kanban = await kanbanCollection.findOne({
      tasks: { $elemMatch: { _id: new ObjectId(taskId) } },
    });
    if (kanban == undefined)
      throw "Error: kanban with that task does not exist";
    // iterate over users and check userId is valid
    let found = false;
    let userIndex;
    for (let i = 0; i < kanban.groupUsers.length; i++) {
      const obj = kanban.groupUsers[i];
      if (obj.userId === userId) {
        found = true;
        userIndex = i;
      }
    }
    if (!found) throw "Error: userId is not of this kanban";
    // user cannot vote on their own task
    let task;
    kanban.tasks.forEach((t) => {
      if (t._id.toString() == taskId) task = t;
    });
    if (task.assignment === userId)
      throw "Error: user cannot vote on their own task";
    if (task.status === 3) throw "Error: task is already completed";
    // get the task from taskId, go into votingstatus, find the key that matches userId and set the
    // value to cite
    task.votingStatus[userId] = vote;
    // checks to see if majority approved task
    let users = Object.keys(task.votingStatus);
    let acceptedVotes = 0;
    let rejectedVotes = 0;
    let noVotes = 0;
    users.forEach((user) => {
      vote = task.votingStatus[user];
      if (vote === 1) acceptedVotes++;
      else if (vote === 0) rejectedVotes++;
      else noVotes++;
    });
    
    // novotes is at least 1 because of the user whose task it is doesn't vote
    let draw = (noVotes === 1 && acceptedVotes === rejectedVotes);
    let num_to_accept = kanban.groupUsers.length/2 - 1;
    if (acceptedVotes > num_to_accept || draw) {
      task.status = 3;
      kanban.completedTasks += 1;
      // I changed this because it gave points to the user who casted the final vote, not the person whose task it is
      for (let i = 0; i < kanban.groupUsers.length; i++) {
        const user = kanban.groupUsers[i];
        if (user.userId === task.assignment) {
          user.points += 5;
        }
      }   
      // increments the completed task
      await userFxns.addCompletedTask(task.assignment);
      
    } else if(rejectedVotes > num_to_accept) {
      task.status = 0;
      // resets the votes again since it's being moved back to todo
      users.forEach((user) => {
        task.votingStatus[user] = -1;
      });
    }

    const updateInfo = {
      tasks: kanban.tasks,
      completedTasks: kanban.completedTasks,
      groupUsers: kanban.groupUsers,
    };
    kanbanCollection = await kanbans();
    const res = await kanbanCollection.findOneAndUpdate(
      { _id: new ObjectId(kanban._id) },
      { $set: updateInfo },
      { returnDocument: "after" }
    );
    if (res.lastErrorObject.n === 0) throw "Error: castVote failed";
    return task;
  },
  /**
   * This will be used to retrieve all tasks with certain status in Kanban.
   * @param {ObjectId} kanbanId
   * @param {Integer} status
   * @returns all tasks with certain status
   */
  async getSomeTasks(kanbanId, status) {
    kanbanId = validation.checkId(kanbanId, "kanbanId");
    status = validation.checkStatus(status, "status");
    const kanban = await kanbanFxns.getKanbanById(kanbanId);
    if (!kanban) throw "Error: kanban not found";
    let someTasks = [];
    const tasks = kanban.tasks;
    for (let x of tasks) {
      if (x.status === status) someTasks.push(x);
    }
    return someTasks;
  },
};

export default exportedMethods;

