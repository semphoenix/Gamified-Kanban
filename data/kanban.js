import {kanban} from '../config/mongoCollections.js';
import userData from './users.js';
import {ObjectId} from 'mongodb';
import validation from '../validation.js';

let exportedMethods = {
    // what should i do for user colors?
    async addKanban(ownerId, groupName){
        ownerId = validation.checkId(ownerId);
        const ownerData  = await userData.getUserById(ownerId);
        const ownerUname = ownerData.username;
        if (ownerData.groups.length > 4) throw 'Error: addKanband: owner is in 5 groups!'

        groupName = validation.checkString(groupName);
        let owner = {
            ownerid: ownerId,
            owneruname: ownerUname
        }
        // assuming owner is one of group users
        let newKanban = {
            owner: owner,
            groupName: groupName,
            groupUsers: [owner],
            userColors: {},
            completedTasks: 0,
            tasks: []
        }
        const kanbanCollection = await kanban();
        const newInsertInformation = await kanbanCollection.insertOne(newKanban);
        const newId = newInsertInformation.insertedId;
        return await this.getPostById(newId.toString());
    }, 

    async addUsertoKanban(userId, kanbanId) {
        
    }
};

export default exportedMethods;