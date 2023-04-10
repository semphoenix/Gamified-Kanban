import { get_seeded_db } from "./reference-db";
// Testing 


const pid = patrick._id.toString();
let pat_test = await users.getUsernameById(pid);
console.log(pat_test);
//console.log(patrick);
// add a bunch of users


const aid = aiden._id.toString();

const cid = charlotte._id.toString();
const sid = samuel._id.toString();
const eid = emma._id.toString();
const lid = liam._id.toString();
const avid = ava._id.toString();
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