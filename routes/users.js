const router = Router();
import { Router } from "express";
import { userFxns } from "../data/index.js";
import { kanbanFxns } from "../data/index.js";
import validation from "../validation.js";
import session from "express-session";

router
  .route("/privateUser")
  .get(async (req, res) => {
    try {
      // Check the cookie for user info
      if (!req.session.user)
        throw "Route: privateUser ~ User does not have authenticated cookie!";
      req.session.user._id = validation.checkId(
        req.session.user._id,
        "User Id"
      );
      const user = await userFxns.getUserById(req.session.user._id);

      // Make sure user is part of a group
      if (user.groups.length === 0){
        return res.status(500).render("error", {error: "Route: privateUser ~ User should be part of a group before getting here!", buttonTitle: "Back to Accounts", link:"/user/createKanban"})
      }
      // Check the cookie for SelectedKanbanId & default to first group if not found
      if (!req.session.selectedKanbanId)
        req.session.selectedKanbanId = user.groups[0];
      req.session.selectedKanbanId = validation.checkId(
        req.session.selectedKanbanId,
        "Kanban Id"
      );
      // Get Kanban information using group & session id
      const kanbans = await kanbanFxns.getAllKanbans(user.groups);
      const selectedKanban = await kanbanFxns.getKanbanById(
        req.session.selectedKanbanId
      );
      const selectedKanbanUserProfile = await kanbanFxns.getUserinKanban(
        req.session.user._id,
        req.session.selectedKanbanId
      );
      console.log(selectedKanbanUserProfile.rewards);
      res.render("profile", {
        title: "Profile Page",
        groups: kanbans,
        currentKanban: selectedKanban,
        user: user.username,
        userId: user._id,
        prizes: selectedKanbanUserProfile.rewards,
        selectedReward: selectedKanbanUserProfile.selectedReward,
      });
    } catch (e) {
      res.status(500).render("error", { title: "Error Page", error: e });
    }
  })
  // Used to change the selectedKanbanId & reset the page
  .post(async (req, res) => {
    try {
      let content = req.body;
      content.chooseGroup = validation.checkId(content.chooseGroup);
      req.session.selectedKanbanId = content.chooseGroup;
      return res.redirect("/user/privateUser");
    } catch (e) {
      res.status(400).render("error", {
        title: "Error Page",
        error: e,
        buttonTitle: "Back to accounts page",
        link: "/user/accountsPage",
      });
    }
  });

router.route("/privateUser/selectPicture").post(async (req, res) => {
  try {
    let content = req.body;
    content.choosePicture = validation.checkStringV2(
      content.choosePicture,
      "Picture"
    );
    let updatedInfo = await kanbanFxns.updateSelectedUserRewards(
      req.session.user._id,
      req.session.selectedKanbanId,
      "profileRewards",
      "profileReward",
      content.choosePicture
    );
    return res.redirect("/user/privateUser");
  } catch (e) {
    console.log(e);
    res.status(400).render("error", {
      title: "Error Page",
      error: e,
      buttonTitle: "Back to accounts page",
      link: "/user/accountsPage",
    });
  }
});
router.route("/privateUser/selectBorder").post(async (req, res) => {
  try {
    let content = req.body;
    content.chooseBorder = validation.checkStringV2(
      content.chooseBorder,
      "Border"
    );
    let updatedInfo = await kanbanFxns.updateSelectedUserRewards(
      req.session.user._id,
      req.session.selectedKanbanId,
      "borderRewards",
      "borderReward",
      content.chooseBorder
    );
    return res.redirect("/user/privateUser");
  } catch (e) {
    res.status(400).render("error", {
      title: "Error Page",
      error: e,
      buttonTitle: "Back to accounts page",
      link: "/user/accountsPage",
    });
  }
});
router.route("/privateUser/selectColor").post(async (req, res) => {
  try {
    let content = req.body;
    content.chooseColor = validation.checkStringV2(
      content.chooseColor,
      "Color"
    );
    let updatedInfo = await kanbanFxns.updateSelectedUserRewards(
      req.session.user._id,
      req.session.selectedKanbanId,
      "colorRewards",
      "colorReward",
      content.chooseColor
    );
    return res.redirect("/user/privateUser");
  } catch (e) {
    res.status(400).render("error", {
      title: "Error Page",
      error: e,
      buttonTitle: "Back to accounts page",
      link: "/user/accountsPage",
    });
  }
});
router
  .route("/accountsPage")
  .get(async (req, res) => {
    try{  
      if(!req.session.selectedKanbanId) throw "No kanban in cookie. Please join or create a kanban!"
      validation.checkId(req.session.selectedKanbanId, "Current Kanban")
      validation.checkQuantity(req.session.user.completedTasks, "Total Task Count")
      validation.checkQuantity(req.session.user.totalRewards, "Total Reward Count")
      return res.render("accounts", {
        title: "Accounts Page",
        totalCompletedTasks: req.session.user.completedTasks, 
        totalRewards: req.session.user.totalRewards
      })
    } catch(e){
      return res.status(400).render("error", {
        title: "Accounts Page",
        error: e, 
        totalCompletedTasks: req.session.user.completedTasks, 
        totalRewards: req.session.user.totalRewards
      })
    }
  })

router
  .route("/createKanban")
  .get(async (req, res) => {
    try {
      if (!req.session.user)
        throw "Router: /createKanban ~ User param not attached to session cookie!";
      if (!req.session.selectedKanbanId){
        if(req.session.user.groups.length === 0) throw "Router: /createKanban ~ You need to join a group! Join a group or create your own"
        req.session.selectedKanbanId = req.session.user.groups[0]
      }
      req.session.selectedKanbanId = validation.checkId(req.session.selectedKanbanId, "Selected Kanban Id")
      req.session.user._id = validation.checkId(req.session.user._id, "User Id");
    } catch (e) {
      return res.status(400).render("error", { title: "Error Page", error: e });
    }

    try {
      const user = await userFxns.getUserById(req.session.user._id); //Not used
      res.render("createKanban", {
        title: "Create/Join Group Page",
        userId: req.session.user._id,
        username: user.username,
      }); //Change this to render when we have pages
    } catch (e) {
      res.status(500).render("error", { title: "Error Page", error: e });
    }
  });
export default router;
