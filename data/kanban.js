import {kanbans} from '../config/mongoCollections.js';
import userData from './users.js';
import {ObjectId} from 'mongodb';
import validation from '../validation.js';
var colors = ["red", "blue", "orange", "green", "purple"];
let exportedMethods = {
    /**
     * 
     * @param {ObjectId} kanbanId 
     * @returns kanban object
     */
    async getKanbanById(kanbanId) {
        kanbanId = validation.checkId(kanbanId, "kanbanId");
        const kanbanCollection = await kanbans();
        const kanban = await kanbanCollection.findOne({_id: new ObjectId(kanbanId)});
        if (!kanban) throw 'Error: kanban not found';
        return kanban;
      },
    /**
     * takes in the ownerId, and the desired groupName for kanban
     * @param {ObjectId} ownerId 
     * @param {string} groupName 
     * @returns kanban object
     */
    async createKanban(ownerId, groupName){
        ownerId = validation.checkId(ownerId, "ownerid");
        const ownerData  = await userData.getUserById(ownerId);
        const ownerUname = ownerData.username;
        if (ownerData.groups.length >= 5) throw 'Error: addKanband: owner is in 5 groups!'

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
            // available colors
            completedTasks: 0,
            tasks: []
        }
        const kanbanCollection = await kanbans();
        const newInsertInformation = await kanbanCollection.insertOne(newKanban);
        const newId = newInsertInformation.insertedId;
        await this.addUsertoKanban(ownerId, newId.toString(), groupName)
        return await this.getKanbanById(newId.toString());;
    }, 
    /**
     * This is what will be used to add a user to the kanban. User will call this fxn with the kanbanId to join.
     * @param {ObjectId} userId 
     * @param {ObjectId} kanbanId 
     * @returns kanban.groupUsers
     */
    async addUsertoKanban(userId, kanbanId) {
        userId = validation.checkId(userId, "userId");
        await userData.getUserById(userId);
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
        await userData.addKanbantoUser(userId, kanbanId);
        return kanban.groupUsers;
    },
     

    async getUserRewards(userId, kanbanId){
        TODO
    }, 

    async getUserPoints(userId, kanbanId) {

    }
};

export default exportedMethods;