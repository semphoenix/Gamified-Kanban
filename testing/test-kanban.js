import kanbans from '../data/kanbans.js'
import { get_seeded_db } from "./reference-db.js";
import { closeConnection } from "../config/mongoConnection.js"

const db = await get_seeded_db()

/* TESTED FUNCTIONS:
====================================
    getKanbanById(kanbanId) DONE
    createKanban(ownerId, groupName) TODO
    addUsertoKanban(userId, kanbanId) TODO
    getUserRewards(userId, kanbanId) TODO
    addUserPoints(userId, kanbanId) TODO
    getAllKanbans() TODO
*/

// ~~ TESTING getKanbanById(kanbanId) ~~
console.log("~~ TESTING getKanbanById(kanbanId) ~~")

let mysticId = ""
let failedIdCase = ""

try{
    mysticId = await kanbans.getKanbanById(db.TEAM_MYSTIC._id.toString())
    console.log(mysticId)
    mysticId = mysticId._id.toString()
} catch(e){
    console.log(e)  
}

try{
    await kanbans.getKanbanById("Incorrect String")
} catch(e){
    console.log(e)  
}

try{
    await kanbans.getKanbanById("")
} catch(e){
    console.log(e)  
}

try{
    if (mysticId[0] === 'a'){failedIdCase='b' + mysticId.substring(1)}
    else {failedIdCase = 'a' + mysticId.substring(1)}
    await kanbans.getKanbanById(failedIdCase)
} catch(e){
    console.log(e)  
}

// ~~ TESTING createKanban(ownerId, groupName) ~~
console.log("~~ TESTING createKanban(ownerId, groupName) ~~")

let eliteFour = ""
let failedUserIdCase = ""

try{
    eliteFour = await kanbans.createKanban(db.ASH._id.toString(), "EliteFour")
    console.log(eliteFour)
} catch(e){
    console.log(e)  
}

try{
    eliteFour = await kanbans.getKanbanById(db.ASH._id.toString(), "")
    console.log(eliteFour)
} catch(e){
    console.log(e)  
}

try{
    // Duplicate team
    eliteFour = await kanbans.getKanbanById(db.ASH._id.toString(), "EliteFour")
    console.log(eliteFour)
} catch(e){
    console.log(e)  
}

try{
    failedUserIdCase = db.ASH._id.toString()
    if (failedUserIdCase[0] === 'a'){failedUserIdCase='b' + failedUserIdCase.substring(1)}
    else {failedUserIdCase = 'a' + failedUserIdCase.substring(1)}
    await kanbans.getKanbanById(failedUserIdCase, "Gym Leaders")
} catch(e){
    console.log(e)  
}

