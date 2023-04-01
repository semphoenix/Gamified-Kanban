import {dbConnection, closeConnection} from './config/mongoConnection.js';
import users from './data/users.js';
import kanban from './data/kanban.js';

const db = await dbConnection();
await db.dropDatabase();

const patrick = await users.addUser('Patrick1234', "passWORd1234!", 45);
const pid = patrick._id.toString();
const aiden = await users.addUser('Aiden6394', 'passWORd1234!', 13);
const aid = aiden._id.toString();
const charlotte = await users.addUser('Charlotte2345', 'Pa$$w0rd5678', 27);
const cid = charlotte._id.toString();
const samuel = await users.addUser('Samuel4567', 'P@ssw0rd9012', 32);
const sid = samuel._id.toString();
const emma = await users.addUser('Emma5678', 'password?123', 21);
const eid = emma._id.toString();
const liam = await users.addUser('Liam3456', 'pass?word456', 29);
const lid = liam._id.toString();
const ava = await users.addUser('Ava1234', 'pas?sword789', 35);
const avid = ava._id.toString();
const william = await users.addUser('William7890', 'passw?ord012', 42);
const wid = william._id.toString();

const pats_kanban = await kanban.addKanban(pid,"Pat's kanban");
const pkid = pats_kanban._id.toString();
await kanban.addUsertoKanban(aid, pkid);
await kanban.addUsertoKanban(sid, pkid);
await kanban.addUsertoKanban(eid, pkid);
await kanban.addUsertoKanban(lid, pkid);
// await kanban.addUsertoKanban(wid, pkid);

let t1 = await kanban.addTasktoKanban(pkid, aid, "task 1", "checking all this stuff", 1, 0);
let t1id = t1._id.toString();
await kanban.addVote(pkid, sid, t1id, 1);
await kanban.addVote(pkid, sid, t1id, 1);
await kanban.addVote(pkid, sid, t1id, 0);
let t2 = await kanban.addTasktoKanban(pkid, sid, "task 2", "testing testing ", 2, 1);
let t2id = t2._id.toString();
await kanban.addVote(pkid, pid, t2id, 1);
await kanban.addVote(pkid, lid, t2id, 0);
await kanban.addVote(pkid, sid, t2id, 1);

await closeConnection();