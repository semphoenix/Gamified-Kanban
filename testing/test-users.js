import users from '../data/users.js'
import { get_seeded_db } from "./reference-db.js";
import { closeConnection } from "../config/mongoConnection.js"

const db = await get_seeded_db()

/* TESTED FUNCTIONS:
====================================
    getUserById(id) DONE
    getUsernameById(id) DONE
    createUser(username, pswd, age) DONE
    addKanbantoUser(userId, kanbanId) DONE
    addCompletedTask(userId) DONE
    getAllUserGroups(userId) TODO
    getNumRewards(userId) TODO
    getNumCompletedTasks(userId) TODO
*/

// console.log(db)

// ~~ TESTING getUserById(id) ~~
console.log("~~ TESTING getUsersById(id) ~~")

let patId = ""

try{
    patId = await users.getUserById(db.PATRICK._id.toString())
    console.log(patId)
    patId = patId._id.toString()
} catch(e){
    console.log(e)  
}

try{
    await users.getUserById("Incorrect String")
    console.log(patId)
} catch(e){
    console.log(e)  
}

try{
    await users.getUserById("")
    console.log(patId)
} catch(e){
    console.log(e)  
}

try{
    let failedIdCase = ""
    if (patId[0] === 'a'){failedIdCase='b' + patId.substring(1)}
    else {failedIdCase = 'a' + patId.substring(1)}
    await users.getUserById(failedIdCase)
} catch(e){
    console.log(e)  
}

// ~~ TESTING getUsernameById(id) ~~
console.log("\n~~ TESTING getUsernameById(id) ~~")

let patUsername = ""

try{
    patUsername = await users.getUsernameById(db.PATRICK._id.toString())
    console.log(patUsername)
} catch(e){
    console.log(e)  
}

try{
    await users.getUsernameById("Incorrect String")
} catch(e){
    console.log(e)  
}

try{
    await users.getUsernameById("")
} catch(e){
    console.log(e)  
}

try{
    let failedIdCase = ""
    if (patId[0] === 'a'){failedIdCase='b' + patId.substring(1)}
    else {failedIdCase='a' + patId.substring(1)}
    await users.getUsernameById(failedIdCase)
} catch(e){
    console.log(e)  
}

// ~~ TESTING createUser(username, pswd, age) ~~
console.log("\n~~ TESTING createUser(username, pswd, age) ~~")

let tinyTim = ""
let duplicateUser = ""

try{
    tinyTim = await users.createUser("TinyTimTurner", "valid!Pswd9", 6)
} catch(e){
    console.log(e)  
}

try{
    await users.createUser(1, "valid!Pswd9", 14)
} catch(e){
    console.log(e)  
}

try{
    await users.createUser("TinyTimTurner", 1, 14)
} catch(e){
    console.log(e)  
}

try{
    await users.createUser("", "valid!Pswd9", 14)
} catch(e){
    console.log(e)  
}

try{
    await users.createUser("TinyTimTurner", "invalidpswd", 14)
} catch(e){
    console.log(e)  
}

try{
    await users.createUser("TinyTimTurner", "ma6!bee", 14)
} catch(e){
    console.log(e)  
}

try{
    duplicateUser = await users.createUser("Ava1234", "valid!Pswd9", 35)
} catch(e){
    console.log(e)  
}

// ~~ TESTING addKanbantoUser(userId, kanbanId) ~~
console.log("\n~~ TESTING addKanbantoUser(userId, kanbanId) ~~")

let newWill = ""
let failedKanbanIdCase = ""
let failedUserIdCase = ""

try{
    // Will got lonenly
    newWill = await users.addKanbantoUser(db.WILLIAM._id.toString(), db.TEAM_VALOR._id.toString())
    console.log(newWill)
} catch(e){
    console.log(e)  
}

try{
    await users.addKanbantoUser(db.WILLIAM._id.toString(), "")
} catch(e){
    console.log(e)  
}

try{
    await users.addKanbantoUser("", db.TEAM_VALOR._id.toString())
} catch(e){
    console.log(e)  
}

try{
    await users.addKanbantoUser("testString", db.TEAM_VALOR._id.toString())
} catch(e){
    console.log(e)  
}

try{
    await users.addKanbantoUser(db.WILLIAM._id.toString(), "testString")
} catch(e){
    console.log(e)  
}

try{
    failedUserIdCase = db.EMMA._id.toString()
    if (failedUserIdCase[0] === 'a'){failedUserIdCase='b' + failedUserIdCase.substring(1)}
    else {failedUserIdCase='a' + failedUserIdCase.substring(1)}
    await users.addKanbantoUser(failedUserIdCase, db.TEAM_VALOR._id.toString())
} catch(e){
    console.log(e)  
}

try{
    failedKanbanIdCase = db.TEAM_VALOR._id.toString()
    if (failedKanbanIdCase[0] === 'a'){failedKanbanIdCase='b' + failedKanbanIdCase.substring(1)}
    else {failedKanbanIdCase='a' + failedKanbanIdCase.substring(1)}
    await users.addKanbantoUser(db.WILLIAM._id.toString(), failedKanbanIdCase)
} catch(e){
    console.log(e)  
}

// ~~ TESTING addCompletedTask (userId) ~~
console.log("\n~~ TESTING addCompletedTask (userId) ~~")

let numberCompleted = 0

try{
    numberCompleted = db.ASH.completedTasks
    if(numberCompleted + 1 === await users.addCompletedTask(db.ASH._id.toString())) {console.log("Aiden successfully completes a task!")} 
    else{console.log("Task DID NOT register as completed!")}
} catch(e){
    console.log(e)
}

try{
    numberCompleted = await users.addCompletedTask(failedUserIdCase)
} catch(e){
    console.log(e)
}

try{
    numberCompleted = await users.addCompletedTask("")
} catch(e){
    console.log(e)
}

try{
    numberCompleted = await users.addCompletedTask(1)
} catch(e){
    console.log(e)
}

// ~~ TESTING getAllUserGroups (userId)
console.log("\n~~ TESTING getAllUserGroups (userId) ~~")

let ashGroups = []

try{
    ashGroups = await users.getAllUserGroups(db.ASH._id.toString())
    console.log(ashGroups) 
} catch(e){
    console.log(e)
}

try{
    await users.getAllUserGroups(failedUserIdCase)
} catch(e){
    console.log(e)
}

try{
    await users.getAllUserGroups("failedUserIdCase")
} catch(e){
    console.log(e)
}

try{
    await users.getAllUserGroups("")
} catch(e){
    console.log(e)
}

try{
    await users.getAllUserGroups(1)
} catch(e){
    console.log(e)
}

// ~~ TESTING getNumRewards(userId)
console.log("\n~~ TESTING getNumRewards (userId) ~~")

let numRewards = 0

try{
    numRewards = await users.getNumRewards(db.ASH._id.toString())
    console.log(numRewards)
} catch(e){
    console.log(e)
} 

try{
    await users.getNumRewards("")
} catch(e){
    console.log(e)
}

try{
    await users.getNumRewards("Failed String")
} catch(e){
    console.log(e)
}

try{
    await users.getNumRewards(1)
} catch(e){
    console.log(e)
}

try{
    await users.getNumRewards(failedUserIdCase)
} catch(e){
    console.log(e)
}

// ~~ TESTING getNumCompletedTasks(userId)
console.log("\n~~ TESTING getNumCompletedTasks (userId) ~~")

let numCompletedTasks = 0

try{
    numCompletedTasks = await users.getNumCompletedTasks(db.ASH._id.toString())
    console.log(numCompletedTasks)
} catch(e){
    console.log(e)
} 

try{
    await users.getNumCompletedTasks("")
} catch(e){
    console.log(e)
}

try{
    await users.getNumCompletedTasks("Failed String")
} catch(e){
    console.log(e)
}


try{
    await users.getNumCompletedTasks(1)
} catch(e){
    console.log(e)
}

try{
    await users.getNumCompletedTasks(failedUserIdCase)
} catch(e){
    console.log(e)
}

closeConnection()