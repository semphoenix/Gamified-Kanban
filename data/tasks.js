import kanbanFxns from './kanban.js';
import validation from '../validation.js';
import {kanbans} from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
 /**
     * Info for creating a task
     * @param {ObjectId} kanbanId: represents id of Kanban
     * @param {ObjectId} userId: represents id of User
     * @param {string} name: title of task 
     * @param {string} description: description of task
     * @param {int} difficulty: value 
     * @param {int} status 
     * @returns task object
     */
export const createTask = async(kanbanId, userId, name, description, difficulty, status) => {
    kanbanId = validation.checkId(kanbanId, "kanbanId");
    userId = validation.checkId(userId, "userId");
    name = validation.checkString(name, "name");
    description = validation.checkString(description, "description");
    difficulty = validation.checkDifficulty(difficulty, "difficulty");
    status = validation.checkStatus(status, "status");
    // voting status -- init each to 0
    let kanban = await kanbanFxns.getKanbanById(kanbanId);
    const votingStatus = kanban.groupUsers.reduce((uid, obj) => {
        Object.keys(obj).forEach(key => {
          if (key === 'userId') uid[obj[key]] = 0;
        });
        return uid;
      }, {});

    // any limit on number of tasks per kanban or per users?
    const newTask = {
        _id: new ObjectId(),
        assignment: userId,
        name: name,
        description: description,
        difficulty: difficulty,
        status:status,
        votingStatus: votingStatus
    }
    kanban.tasks.push(newTask);
    const updateInfo = {
        tasks: kanban.tasks
    }
    const kanbanCollection = await kanbans();
    const insertInfo = await kanbanCollection.findOneAndUpdate({_id: new ObjectId(kanbanId)}, {$set: updateInfo}, {returnDocument: 'after'});
    if (insertInfo.lastErrorObject.n === 0) throw 'Error: createTask failed';
    return newTask;
};
/**
 * @param {ObjectId} taskId
 * @returns task object
 */
export const getTask = async(taskId) => {
    let kanbanCollection = await kanbans();
    const kanban = await kanbanCollection.findOne({tasks: {$elemMatch: {_id: new ObjectId(taskId)}}});
    if (!kanban) throw 'album get: album id does not exist';
    let task;
    kanban.tasks.forEach((t) => {
        if (t._id==taskId) task = t;
    })
    return task;
};
/**
 * @param {ObjectId} kanbanId
 * @returns kankan tasks as strings
 */
export const getAllTasks = async(kanbanId) => {
    let kanban = await kanbanFxns.getKanbanById(kanbanId);
    if (kanban === null) throw 'Error getAllTasks: No kanban with that id';
    kanban.tasks = kanban.tasks.map((t) => {
      t._id = t._id.toString();
      return e;
    })
    return kanban.tasks;
};

export const getCompletedTasks = async(kanbanId) => {
    TODO
};

/**
 * lets userId vote on a task for a given kanbanId. can change vote. only 0 or 1.
 * @param {ObjectId} kanbanId 
 * @param {ObjectId} userId 
 * @param {ObjectId} taskId 
 * @param {int} vote 
 * @returns task.votingStatus
 */
export const castVote = async(kanbanId, userId, taskId, vote) => {
    kanbanId = validation.checkId(kanbanId, "kanbanId");
    userId = validation.checkId(userId, "userId");
    taskId = validation.checkId(taskId, "taskId");
    vote = validation.checkVote(vote, "vote");
    let kanbanCollection = await kanbans();
    const kanban = await kanbanCollection.findOne({tasks: {$elemMatch: {_id: new ObjectId(taskId)}}});
    if (kanban==undefined) throw 'Error: kanban with that task does not exist';
    // iterate over users and check userId is valid
    let found = false;
    for (let i = 0; i < kanban.groupUsers.length; i++) {
        const obj = kanban.groupUsers[i];
        if (obj.userId === userId) found=true;
    }
    if (!found) throw 'Error: userId is not of this kanban'
    // user cannot vote on their own task 
    let task;
    kanban.tasks.forEach((t) => {
      if (t._id==taskId) task = t;
    });
    if (task.assignment== userId) throw 'Error: user cannot vote on their own task';
    // get the task from taskId, go into votingstatus, find the key that matches userId and set the 
    // value to cite    
    task.votingStatus[userId] = vote;
    const updateInfo = {
        tasks: kanban.tasks
    }
    kanbanCollection = await kanbans();
    const res = await kanbanCollection.findOneAndUpdate({_id: new ObjectId(kanbanId)}, {$set: updateInfo}, {returnDocument: 'after'});
    if (res.lastErrorObject.n === 0) throw 'Error: castVote failed';
    return task.votingStatus;
};