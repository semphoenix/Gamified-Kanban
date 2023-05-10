import { kanbans } from "../config/mongoCollections.js";
import { users } from "../config/mongoCollections.js";
import userData from "./users.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";
var colors = ["red", "blue", "orange", "green", "purple"];
let allRewards = {
  profileRewards: [1, 2, 3, 4, 5],
  borderRewards: ["red", "blue", "orange", "green"],
  colorRewards: [0.2, 0.4, 0.6, 0.8],
};

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

    let tasks = kanban.tasks;
    tasks.map((task) => {
      task.votingStatus[userId] = -1; // allows new user to vote on tasks
    });

    let newUser = {
      _id: new ObjectId(),
      userId: userId,
      points: 0,
      rewards: {
        profileRewards: [0],
        borderRewards: ["black"],
        colorRewards: [0.5],
      },
      selectedReward: {
        profileReward: 0,
        borderReward: "black",
        colorReward: 0.5,
      },
    };
    let availColors = kanban.availColors;
    let newColor = availColors.slice(0, 1);
    availColors = availColors.slice(1, availColors.length);
    kanban.userColors[userId] = newColor[0];
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
   * This is what will be used to retrieve a list of kanbans
   * @param [{ObjectId}] kanbanIds
   * @returns list of kanbans
   */

  async getAllKanbans(kanbanIds) {
    kanbanIds = kanbanIds.map((kanbanId) =>
      validation.checkId(kanbanId, "kanbanId")
    );
    const allKanbans = await Promise.all(
      kanbanIds.map(async (kanbanId) => {
        const kanban = await this.getKanbanById(kanbanId);
        return kanban;
      })
    );
    return allKanbans;
  },

  /**
   * This is what will be used to simulate a pull for the user.
   * @param {ObjectId} userId
   * @param {ObjectId} kanbanId
   * @returns updated user
   */

  async playGame(userId, kanbanId) {
    userId = validation.checkId(userId, "userId");
    kanbanId = validation.checkId(kanbanId, "kanbanId");
    let points = await this.getUserPoints(userId, kanbanId);
    let rewards = await this.getUserRewards(userId, kanbanId);
    if (points < 3) throw "Error: Not enough points!";

    let rewardType =
      Object.keys(allRewards)[
        Math.floor(Math.random() * Object.keys(allRewards).length)
      ];
    if (allRewards[rewardType].length === rewards[rewardType].length - 1)
      throw "Already recieved all rewards of this type!";

    let reward;
    while (true) {
      let rewardIndex = Math.floor(
        Math.random() * allRewards[rewardType].length
      );
      reward = allRewards[rewardType][rewardIndex];
      if (!rewards[rewardType].includes(reward)) break;
    }

    rewards[rewardType].push(reward);

    points = points - 3; //How many points is each pull worth?

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
    let userCollection = await users();
    const user = await userCollection.findOne({
      _id: new ObjectId(userId),
    });
    const insertInfoUser = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          totalRewards: user.totalRewards + 1,
        },
      },
      { returnDocument: "after" }
    );
    let rewardStatement = `${rewardType}: ${reward}`;
    return rewardStatement;
  },
  async updateSelectedUserRewards(
    userId,
    kanbanId,
    rewardType,
    selectReward,
    reward
  ) {
    userId = validation.checkId(userId, "userId");
    kanbanId = validation.checkId(kanbanId, "kanbanId");
    rewardType = validation.checkString(rewardType, "rewardType");
    console.log(rewardType);
    reward = validation.checkStringV2(reward, "reward");
    console.log(reward);

    if (
      rewardType !== "profileRewards" &&
      rewardType !== "borderRewards" &&
      rewardType !== "colorRewards"
    ) {
      throw "Error: Invalid rewardType";
    }
    if (
      selectReward !== "profileReward" &&
      selectReward !== "borderReward" &&
      selectReward !== "colorReward"
    ) {
      throw "Error: Invalid selectReward";
    }

    const validRewards = allRewards[rewardType];
    if (rewardType === "profileRewards") {
      reward = parseInt(reward);
      if (!validRewards || (!validRewards.includes(reward) && reward !== 0)) {
        throw "Error: Invalid reward";
      }
    } else if (rewardType === "colorReward") {
      reward = parseInt(reward);
      if (!validRewards || (!validRewards.includes(reward) && reward !== 0.5)) {
        throw "Error: Invalid reward";
      }
    } else {
      if (
        !validRewards ||
        (!validRewards.includes(reward) && reward !== "black")
      ) {
        throw "Error: Invalid reward";
      }
    }
    let kanbanCollection = await kanbans();
    const insertInfo = await kanbanCollection.findOneAndUpdate(
      { _id: new ObjectId(kanbanId), "groupUsers.userId": userId },
      { $set: { [`groupUsers.$.selectedReward.${selectReward}`]: reward } },
      { returnDocument: "after" }
    );
    return await this.getUserinKanban(userId, kanbanId);
  },
};

export default exportedMethods;
