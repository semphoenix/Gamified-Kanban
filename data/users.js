import { users } from "../config/mongoCollections.js";
import { kanbans } from "../config/mongoCollections.js";
import kanban_data from "./kanban.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";
import bcrypt from "bcrypt";
const saltrounds = 2;

let exportedMethods = {
  /**
   * preforms input validation and returns username
   * @param {ObjectId} id
   * @returns username
   */
  async getUserById(id) {
    id = validation.checkId(id, "userId");
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw "Error: User not found";
    return user;
  },
  /**
   * Takes in userId and returns username as a string
   * @param {ObjectId} id
   * @returns username
   */
  async getUsernameById(id) {
    id = validation.checkId(id, "getUsernameById userId");
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw "Error: User not found";
    return user.username.toString();
  },
  /**
   * Takes in username, pswd, age, and adds new user to userCollection.
   * @param {string} username
   * @param {string} pswd
   * @param {int} age
   * @returns user object
   */
  async createUser(username, pswd, confirmPwsd, age) {
    username = validation.checkString(username, "data/users addUser username");
    username = username.toLowerCase();
    pswd = validation.checkPassword(pswd, "data/users addUser pswd");
    if (pswd !== confirmPwsd) throw "Passwords do not match";
    age = validation.checkAge(age, "data/users addUser age");
    // check if username is unique
    const userCollection = await users();
    if (await userCollection.findOne({ username: username }))
      throw "data/users addUser username already exists";
    // hashes the password
    const hashedpswd = await bcrypt.hash(pswd, saltrounds);
    // init other params
    let newUser = {
      username: username,
      pswd: hashedpswd,
      age: age,
      totalRewards: 0,
      completedTasks: 0,
      groups: [],
    };
    const newInsertInformation = await userCollection.insertOne(newUser);
    if (!newInsertInformation.insertedId) throw "Insert failed!";
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
  async addKanbantoUser(userId, kanbanId) {
    userId = validation.checkId(userId, "addkanbantouser userId");
    kanbanId = validation.checkId(kanbanId, "addkanbantouser kanbanId");
    let user = await this.getUserById(userId);

    if (user.groups.includes(kanbanId))
      throw "Error: addKanbantoUser: user is already in kanban";
    let kanban = await kanban_data.getKanbanById(kanbanId);

    user.groups.push(kanbanId);
    const updateInfo = {
      groups: user.groups,
    };
    const userCollection = await users();
    const insertInfo = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateInfo },
      { returnDocument: "after" }
    );
    return user.groups;
  },
  /**
   * will increment the number of completedTasks for a user by 1.
   * @param {ObjectId} userId
   * @returns user.completedTasks
   */
  async addCompletedTask(userId) {
    let user = await this.getUserById(userId);
    user.completedTasks = user.completedTasks + 1;
    const updateInfo = {
      completedTasks: user.completedTasks,
    };
    const userCollection = await users();
    const insertInfo = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateInfo },
      { returnDocument: "after" }
    );
    return user.completedTasks;
  },
  /**
   *
   * @param {ObjectId} userId
   * @return array of kanban objects that user is in
   */
  async getAllUserGroups(userId) {
    let user = await this.getUserById(userId);
    const kanbanCollection = await kanbans();
    let kanbans_list = [];
    for (let i = 0; i < user.groups.length; i++) {
      let k = await kanbanCollection.findOne({
        _id: new ObjectId(user.groups[i]),
      });
      kanbans_list.push(k);
    }
    return kanbans_list;
  },

  async getNumRewards(userId) {
    let user = await this.getUserById(userId);
    return user.totalRewards;
  },

  async getNumCompletedTasks(userId) {
    let user = await this.getUserById(userId);
    return user.completedTasks;
  },
  /**
   * Cridential validation. will try and match username to a user. if it's a hit, it will check pswd is correct. if all good, will return user object
   * else, it will throw based on what's wrong with the input.
   * @param {string} username
   * @param {string} pswd
   */
  async getAttemptedCredentials(username, pswd) {
    username = validation.checkString(username, "username");
    username = username.toLowerCase();
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    if (!user)
      throw "Error in getAttemptedCredentials: no user with that username";
    const hashedpswd = user.pswd;
    const compareToSherlock = await bcrypt.compare(pswd, hashedpswd);
    if (!compareToSherlock)
      throw "Error in getAttemptedCredentials: pswd not correct!";
    return user;
  },

  /**
   * Called to get all users, primarily for testing seeded database.
   * @returns list(users)
   */
  async getAllUsers() {
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray();
    if (!userList) throw "Error: getAllKanbans: Kanban collection is empty!";

    userList = userList.map((element) => {
      element._id = element._id.toString();
      return element;
    });

    return userList;
  },
};

export default exportedMethods;
