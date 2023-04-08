import {dbConnection, closeConnection} from './config/mongoConnection.js';
import users from './data/users.js';
import kanban from './data/kanban.js';
import * as tasks from './data/tasks.js';
const db = await dbConnection();
await db.dropDatabase();
// TESTING USERS.JS FXNS
const patrick = await users.createUser('Patrick1234', "passWORd1234!", 45);
const pid = patrick._id.toString();
let pat_test = await users.getUsernameById(pid);
console.log(pat_test);
//console.log(patrick);
// add a bunch of users

const aiden = await users.createUser('Aiden6394', 'passWORd1234!', 13);
const aid = aiden._id.toString();
const charlotte = await users.createUser('Charlotte2345', 'Pa$$w0rd5678', 27);
const cid = charlotte._id.toString();
const samuel = await users.createUser('Samuel4567', 'P@ssw0rd9012', 32);
const sid = samuel._id.toString();
const emma = await users.createUser('Emma5678', 'password?123', 21);
const eid = emma._id.toString();
const liam = await users.createUser('Liam3456', 'pass?word456', 29);
const lid = liam._id.toString();
const ava = await users.createUser('Ava1234', 'pas?sword789', 35);
const avid = ava._id.toString();
const william = await users.createUser('William7890', 'passw?ord012', 42);
const wid = william._id.toString();
// creating kanbans
const pats_kanban = await kanban.createKanban(pid,"Pat's kanban");
const pkid = pats_kanban._id.toString();
const chars_kanban = await kanban.createKanban(cid,"Char's kanban");
const chkid = chars_kanban._id.toString();
// adding to pat's kanban
await kanban.addUsertoKanban(aid, pkid);
// should throw bc kanbanId is not valid
try {
    await kanban.addUsertoKanban(aid, 'irwncoinv2e2e');
} catch (e){
    console.log(e);
};
await kanban.addUsertoKanban(sid, pkid);
await kanban.addUsertoKanban(lid, pkid);
await kanban.addUsertoKanban(cid, pkid);
// should throw bs kanban has 5 members
try {
    await kanban.addUsertoKanban(aid, pkid);
} catch (e){
    console.log(e);
};
// adding tasks to pat's kanban
let t1 = await tasks.createTask(pkid, aid, "task 1", "checking all this stuff", 1, 0);
let t1id = t1._id.toString();
let meow = await tasks.castVote(pkid, sid, t1id, 1);
await tasks.castVote(pkid, sid, t1id, 1);
await tasks.castVote(pkid, sid, t1id, 0);
let t2 = await tasks.createTask(pkid, sid, "task 2", "testing testing ", 2, 1);
let t2id = t2._id.toString();
await tasks.castVote(pkid, pid, t2id, 1);
await tasks.castVote(pkid, lid, t2id, 0);
//await tasks.castVote(pkid, sid, t2id, 1);

await closeConnection();