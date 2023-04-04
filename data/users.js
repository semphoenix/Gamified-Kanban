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
    /**
     * Takes in userId and returns username as a string
     * @param {ObjectId} id 
     * @returns username
     */
    async getUsernameById(id) {
        id = validation.checkId(id);
        const userCollection = await users();
        const user = await userCollection.findOne({_id: new ObjectId(id)});
        if (!user) throw 'Error: User not found';
        return user.username.toString();
      },
    /**
     * Takes in username, pswd, age, and adds new user to userCollection.
     * @param {string} username 
     * @param {string} pswd 
     * @param {int} age 
     * @returns user object
     */
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
            completedTasks: 0,
            groups: []
        } 
        const newInsertInformation = await userCollection.insertOne(newUser);
        if (!newInsertInformation.insertedId) throw 'Insert failed!';
        return await this.getUserById(newInsertInformation.insertedId.toString());       
    },
    /**
     * NOTE CHANGE TO NOT TAKE IN GROUPNAME
     * assumes kanban is created. will only be called in kanban.js after it has been checked that the user is eligable
     * @param {ObjectId} userId 
     * @param {ObjectId} kanbanId 
     * @param {string} kanbanGroupName 
     * @returns user.groups
     */
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
    /**
     * will increment the numeber of completedTasks for a user by 1.
     * @param {ObjectId} userId 
     * @returns user.completedTasks
     */
    async addCompletedTask(userId){
        let user = await this.getUserById(userId);
        user.completedTasks = user.completedTasks + 1;
        const updateInfo = {
            completedTasks: user.completedTasks
        };
        const userCollection = await users();
        const insertInfo = await userCollection.findOneAndUpdate({_id: new ObjectId(userId)}, {$set: updateInfo}, {returnDocument: 'after'});
        return user.completedTasks;
    },

    async getAllUserGroups(userId){
        TODO
    }, 

    async getNumRewards(userId) {
        TODO
    }, 
    
    async getNumCompletedTasks(userId) {

    }, 
    /**
     * Cridential validation. will try and match username to a user. if it's a hit, it will check pswd is correct. if all good, will return user object
     * else, it will throw based on what's wrong with the input.
     * @param {string} username 
     * @param {string} pswd 
     */
    async getAttemptedCredentials(username, pswd){
        TODO
    }
};

export default exportedMethods;