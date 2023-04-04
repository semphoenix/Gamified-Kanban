import {kanbans} from '../config/mongoCollections.js';
import userData from './users.js';
import {ObjectId} from 'mongodb';
import validation from '../validation.js';
var colors = ["red", "blue", "orange", "green", "purple"];
let exportedMethods = {
    async getKanbanById(kanbanId) {
        kanbanId = validation.checkId(kanbanId, "kanbanId");
        const kanbanCollection = await kanbans();
        const kanban = await kanbanCollection.findOne({_id: new ObjectId(kanbanId)});
        if (!kanban) throw 'Error: kanban not found';
        return kanban;
      },
    // what should i do for user colors?
    async addKanban(ownerId, groupName){
        ownerId = validation.checkId(ownerId, "ownerid");
        const ownerData  = await userData.getUserById(ownerId);
        const ownerUname = ownerData.username;
        if (ownerData.groups.length > 5) throw 'Error: addKanband: owner is in 5 groups!'

        groupName = validation.checkString(groupName, "groupName");
        let owner = {
            ownerId: ownerId,
            ownerUname: ownerUname
        }
        // assuming owner is one of group users
        let newKanban = {
            owner: owner,
            groupName: groupName,
            groupUsers: [],
            userColors: {},
            completedTasks: 0,
            tasks: []
        }
        const kanbanCollection = await kanbans();
        const newInsertInformation = await kanbanCollection.insertOne(newKanban);
        const newId = newInsertInformation.insertedId;
        await this.addUsertoKanban(ownerId, newId.toString(), groupName)
        return await this.getKanbanById(newId.toString());;
    }, 

    async addUsertoKanban(userId, kanbanId) {
        userId = validation.checkId(userId, "userId");
        kanbanId = validation.checkId(kanbanId, "kanbanId");
        let kanban = await this.getKanbanById(kanbanId);
        if (kanban.groupUsers.length > 4) throw 'Error: max 5 group members of kanban';
        let newUser = {
            _id: new ObjectId(),
            userId: userId,
            points: 0,
            rewards: []
        };
        let newColor = colors[kanban.groupUsers.length];
        kanban.userColors[userId] = newColor;
        kanban.groupUsers.push(newUser);
        const updateInfo = {
            groupUsers: kanban.groupUsers,
            userColors: kanban.userColors
        }
        let kanbanCollection = await kanbans();
        const insertInfo = await kanbanCollection.findOneAndUpdate({_id: new ObjectId(kanbanId)}, {$set: updateInfo}, {returnDocument: 'after'});
        // add kanban to user
        const groupName = kanban.groupName;
        await userData.addKanbantoUser(userId, kanbanId, groupName);
        return kanban.groupUsers;
    },

    async addTasktoKanban(kanbanId, userId, name, description, difficulty, status) {
        kanbanId = validation.checkId(kanbanId, "kanbanId");
        userId = validation.checkId(userId, "userId");
        name = validation.checkString(name, "name");
        description = validation.checkString(description, "description");
        difficulty = validation.checkDifficulty(difficulty, "difficulty");
        status = validation.checkStatus(status, "status");
        // voting status -- init each to 0
        let kanban = await this.getKanbanById(kanbanId);
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
            difficulty, difficulty,
            status:status,
            votingStatus: votingStatus
        }
        kanban.tasks.push(newTask);
        const updateInfo = {
            tasks: kanban.tasks
        }
        const kanbanCollection = await kanbans();
        const insertInfo = await kanbanCollection.findOneAndUpdate({_id: new ObjectId(kanbanId)}, {$set: updateInfo}, {returnDocument: 'after'});
        await userData.addTask(userId);
        return newTask;
    }, 

    async addVote(kanbanId, userId, taskId, vote){
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
        //console.log(task.votingStatus);
        const updateInfo = {
            tasks: kanban.tasks
        }
        kanbanCollection = await kanbans();
        const res = await kanbanCollection.findOneAndUpdate({_id: new ObjectId(kanbanId)}, {$set: updateInfo}, {returnDocument: 'after'});
        return task.votingStatus;
    }
};

export default exportedMethods;