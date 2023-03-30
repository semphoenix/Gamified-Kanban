import {kanbans} from '../config/mongoCollections.js';
import userData from './users.js';
import {ObjectId} from 'mongodb';
import validation from '../validation.js';

let exportedMethods = {
    async getKanbanById(id) {
        id = validation.checkId(id);
        const kanbanCollection = await kanbans();
        const kanban = await kanbanCollection.findOne({_id: new ObjectId(id)});
        if (!kanban) throw 'Error: kanban not found';
        return kanban;
      },
    // what should i do for user colors?
    async addKanban(ownerId, groupName){
        ownerId = validation.checkId(ownerId);
        const ownerData  = await userData.getUserById(ownerId);
        const ownerUname = ownerData.username;
        if (ownerData.groups.length > 4) throw 'Error: addKanband: owner is in 5 groups!'

        groupName = validation.checkString(groupName);
        let owner = {
            ownerId: ownerId,
            ownerUname: ownerUname
        }
        let ownerasuser = {
            userId: ownerId,
            points: 0,
            rewards: []
        }
        // assuming owner is one of group users
        let newKanban = {
            owner: owner,
            groupName: groupName,
            groupUsers: [ownerasuser],
            userColors: {},
            completedTasks: 0,
            tasks: []
        }
        const kanbanCollection = await kanbans();
        const newInsertInformation = await kanbanCollection.insertOne(newKanban);
        const newId = newInsertInformation.insertedId;
        return await this.getKanbanById(newInsertInformation.insertedId.toString());;
    }, 

    async addUsertoKanban(userId, kanbanId) {
        userId = validation.checkId(userId);
        kanbanId = validation.checkId(kanbanId);
        let kanban = await this.getKanbanById(kanbanId);
        if (kanban.groupUsers.length > 4) throw 'Error: max 5 group members of kanban';
        let newUser = {
            userId: userId,
            points: 0,
            rewards: []
        };
        kanban.groupUsers.push(newUser);
        const updateInfo = {
            groupUsers: kanban.groupUsers
        }
        let kanbanCollection = await kanbans();
        const insertInfo = await kanbanCollection.findOneAndUpdate({_id: new ObjectId(kanbanId)}, {$set: updateInfo}, {returnDocument: 'after'});
        return kanban.groupUsers;
    }
};

export default exportedMethods;