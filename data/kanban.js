import { kanbans } from "../config/mongoCollections.js";
import userData from "./users.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";
var colors = ["red", "blue", "orange", "green", "purple"];
var allRewards = ["reward 1", "reward 2", "reward 3", "reward 4"]; // Place holder
let exportedMethods = {
  /**
   *
   * @param {ObjectId} kanbanId
   * @returns kanban object
   */
  async getKanbanById(kanbanId) {
    kanbanId = validation.checkId(kanbanId, "kanbanId");
    const kanbanCollection = await kanbans();
    const kanban = await kanbanCollection.findOne({
      _id: new ObjectId(kanbanId),
    });
    if (!kanban) throw "Error: kanban not found";
    return kanban;
  },
  /**
   * takes in the ownerId, and the desired groupName for kanban
   * @param {ObjectId} ownerId
   * @param {string} groupName
   * @returns kanban object
   */
  async createKanban(ownerId, groupName) {
    ownerId = validation.checkId(ownerId, "ownerid");
    const ownerData = await userData.getUserById(ownerId);
    const ownerUname = ownerData.username;
    if (ownerData.groups.length >= 5)
      throw "Error: addKanband: owner is in 5 groups!";

    groupName = validation.checkString(groupName, "groupName");
    let owner = {
      ownerId: ownerId,
      ownerUname: ownerUname,
    };
    // assuming owner is one of group users
    let newKanban = {
      owner: owner,
      groupName: groupName,
      groupUsers: [],
      userColors: {},
      availColors: colors,
      completedTasks: 0,
      tasks: [],
    };
    const kanbanCollection = await kanbans();
    const newInsertInformation = await kanbanCollection.insertOne(newKanban);
    const newId = newInsertInformation.insertedId;
    await this.addUsertoKanban(ownerId, newId.toString());
    return await this.getKanbanById(newId.toString());
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
    if (kanban.groupUsers.length >= 5)
      throw "Error: max 5 group members of kanban";
    let usersInKanban = kanban.groupUsers.map(function (obj) {
      return obj.userId;
    });
    if (usersInKanban.includes(userId))
      throw "Error: addKanbantoUser: user is already in kanban";
    let newUser = {
      _id: new ObjectId(),
      userId: userId,
      points: 0,
      rewards: [],
    };
    let availColors = kanban.availColors;
    let newColor = availColors.slice(0, 1);
    availColors = availColors.slice(1, availColors.length);
    kanban.userColors[userId] = newColor;
    kanban.groupUsers.push(newUser);
    const updateInfo = {
      groupUsers: kanban.groupUsers,
      userColors: kanban.userColors,
      availColors: availColors,
    };
    let kanbanCollection = await kanbans();
    const insertInfo = await kanbanCollection.findOneAndUpdate(
      { _id: new ObjectId(kanbanId) },
      { $set: updateInfo },
      { returnDocument: "after" }
    );
    await userData.addKanbantoUser(userId, kanbanId);
    const updatedKanban = await this.getKanbanById(kanbanId);
    return updatedKanban;
  },
  /**
   * This is what will be used retrieve user's data
   * @param {ObjectId} userId
   * @param {ObjectId} kanbanId
   * @returns user
   */
  async getUserinKanban(userId, kanbanId) {
    kanbanId = validation.checkId(kanbanId, "kanbanId");
    const kanban = await this.getKanbanById(kanbanId);
    if (!kanban) throw "Error: kanban not found";
    userId = validation.checkId(userId, "userId");
    const groupUsers = kanban.groupUsers;
    let returnedUser;
    for (let user of groupUsers) {
      if (user.userId == userId) returnedUser = user;
    }
    if (!returnedUser) throw "Error: No user with that id in kanban";
    return returnedUser;
  },
  /**
   * This is what will be used retrieve all user's rewards.
   * @param {ObjectId} userId
   * @param {ObjectId} kanbanId
   * @returns user's rewards
   */
  async getUserRewards(userId, kanbanId) {
    let user = await this.getUserinKanban(userId, kanbanId);
    let userRewards = user.rewards;
    return userRewards;
  },
  /**
   * This is what will be used to retrieve user's points
   * @param {ObjectId} userId
   * @param {ObjectId} kanbanId
   * @returns user's points
   */
  async getUserPoints(userId, kanbanId) {
    let user = await this.getUserinKanban(userId, kanbanId);
    let userPoints = user.points;
    return userPoints;
  },
  /**
   * This is what will be used to simulate a pull for the user.
   * @param {ObjectId} userId
   * @param {ObjectId} kanbanId
   * @returns updated user
   */
  async playGame(userId, kanbanId) {
    let points = await this.getUserPoints(userId, kanbanId);
    let rewards = await this.getUserRewards(userId, kanbanId);
    if (points < 3) throw "Error: Not enough points!";
    if (rewards.length === allRewards.length)
      throw "Error: You have recieved all rewards!";
    while (true) {
      let randoNum = Math.floor(Math.random() * allRewards.length);
      if (!rewards.includes(allRewards[randoNum])) {
        rewards.push(allRewards[randoNum]);
        break;
      }
    }
    points = points - 3; // Place holder for now. How many points is each pull worth?
    let kanbanCollection = await kanbans();
    const insertInfo = await kanbanCollection.findOneAndUpdate(
      { _id: new ObjectId(kanbanId), "groupUsers.userId": userId },
      {
        $set: {
          "groupUsers.$.rewards": rewards,
          "groupUsers.$.points": points,
        },
      },
      { returnDocument: "after" }
    );
    return await this.getUserinKanban(userId, kanbanId);
  },
};

export default exportedMethods;
