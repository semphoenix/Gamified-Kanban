import { Router } from 'express';
const router = Router();
import { taskFxns } from "../data/index.js";
import validation from "../validation.js";

router.route('/:kanbanId').post(async (req, res) => { // for adding a task
    let kanbanId = req.params.kanbanId;
    let { userId, name, description, difficulty, status } = req.body;
    try {
        kanbanId = validation.checkId(kanbanId, "kanbanId");
        userId = validation.checkId(userId, "userId");
        name = validation.checkString(name, "name");
        description = validation.checkString(description, "description");
        difficulty = validation.checkDifficulty(difficulty, "difficulty");
        status = validation.checkStatus(status, "status");
    } catch (e) {
        return res.status(400).json({error: e});
    }

    try {
        const newTask = await taskFxns.createTask(kanbanId, userId, name, description, difficulty, status);
        res.status(200).json(newTask);
    } catch (e) {
        res.status(404).json({error: e});
    }
});

//casting a vote
router.route("/vote/:taskId").put(async (req, res) => { 
    // for casting a vote
    let taskId = req.params.taskId;
    let { userId, vote } = req.body;
    try {
        vote = validation.checkVote(vote, "vote");
        userId = validation.checkId(userId, "userId");
        taskId = validation.checkId(taskId, "taskId");
    } catch (e) {
        return res.status(400).json({error: e});
    }

    try {
        const votingStatus = await taskFxns.castVote(userId, taskId, vote);
        // checks to see if the voting status was updated
        res.status(200).json(votingStatus);
    } catch (e) {
        res.status(404).json({error: e})
    }
});

//changing status
router.route("/changeStatus/:taskId").put(async (req, res) => { 
    // for changing status
    let taskId = req.params.taskId;
    let { newStatus } = req.body;
    try {
        taskId = validation.checkId(taskId, "taskId");
        newStatus = validation.checkStatus(newStatus, "status");
    } catch (e) {
        return res.status(400).json({error: e});
    }

    try {
        const task = await taskFxns.changeStatus(taskId, newStatus);
        res.status(200).json(task);
    } catch (e) {
        res.status(404).json({error: e})
    }
});

export default router;