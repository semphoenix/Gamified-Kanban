import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import validation from '../validation.js';

let exportedMethods = {
    /**
     * preforms input validation and returns username
     * @param {ObjectId} id 
     * @returns username
     */
    async getUserById(id) {
        id = validation.checkId(id, "userId");
        const userCollection = await users();
        const user = await userCollection.findOne({_id: new ObjectId(id)});
        if (!user) throw 'Error: User not found';
        return user;
      },

    async getUsernameById(id) {
        id = validation.checkId(id);
        const userCollection = await users();
        const user = await userCollection.findOne({_id: new ObjectId(id)});
        if (!user) throw 'Error: User not found';
        return user.username;
      },

    async addUser(username, pswd, age) {
        username = validation.checkString(username,"data/users addUser username");
        pswd = validation.checkPassword(pswd,"data/users addUser pswd");
        age = validation.checkAge(age,"data/users addUser age");
        // check if username is unique
        const userCollection = await users();
        if (await userCollection.findOne( { username: username })) throw 'data/users addUser username already exists';
        // init other params
        let newUser = {
            username: username,
            pswd: pswd,
            age: age,
            totalRewards: 0,
            totalTasks: 0,
            groups: []
        } 
        const newInsertInformation = await userCollection.insertOne(newUser);
        if (!newInsertInformation.insertedId) throw 'Insert failed!';
        return await this.getUserById(newInsertInformation.insertedId.toString());       
    },

    async addKanbantoUser(userId, kanbanId, kanbanGroupName) {
        userId = validation.checkId(userId);
        kanbanId = validation.checkId(kanbanId);
        kanbanGroupName = validation.checkString(kanbanGroupName);
        const newGroup = {
            groupId: kanbanId,
            groupName: kanbanGroupName
        }
        let user = await this.getUserById(userId);
        user.groups.push(newGroup);
        const updateInfo = {
            groups: user.groups
        }
        const userCollection = await users();
        const insertInfo = await userCollection.findOneAndUpdate({_id: new ObjectId(userId)}, {$set: updateInfo}, {returnDocument: 'after'});
        return user.groups;
    }, 

    async addTask(userId){
        let user = await this.getUserById(userId);
        user.totalTasks = user.totalTasks + 1;
        const updateInfo = {
            totalTasks: user.totalTasks
        };
        const userCollection = await users();
        const insertInfo = await userCollection.findOneAndUpdate({_id: new ObjectId(userId)}, {$set: updateInfo}, {returnDocument: 'after'});
        return user.totalTasks;
    }

};

export default exportedMethods;