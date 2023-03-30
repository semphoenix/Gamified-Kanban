import {dbConnection, closeConnection} from './config/mongoConnection.js';
import users from './data/users.js';
import kanban from './data/kanban.js';

const db = await dbConnection();
await db.dropDatabase();

const patrick = await users.addUser('Patrick1234', "passWORd1234!", 45);
const pid = patrick._id.toString();
const aiden = await users.addUser('Aiden6394', 'passWORd1234!', 13);
const aid = aiden._id.toString();
const pats_kanban = await kanban.addKanban(pid,"Pat's kanban");
const pkid = pats_kanban._id.toString();
await kanban.addUsertoKanban(aid, pkid);

await closeConnection();