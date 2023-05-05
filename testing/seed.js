import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import users from "../data/users.js";
import kanban from "../data/kanban.js";
import tasks from "../data/tasks.js";

const db = await dbConnection();
await db.dropDatabase();

// Populate DB with Users
const PATRICK = await users.createUser("Patrick1234", "passWORd1234!", "passWORd1234!", 45);
const AIDEN = await users.createUser("Aiden6394", "passWORd1234!", "passWORd1234!", 13);
const CHARLOTTE = await users.createUser("Charlotte2345", "Pa$$w0rd5678","Pa$$w0rd5678", 27);
const SAMUEL = await users.createUser("Samuel4567", "P@ssw0rd9012", "P@ssw0rd9012",32);

const EMMA = await users.createUser("Emma5678", "password?123", "password?123",21);
const LIAM = await users.createUser("Liam3456", "pass?word456", "pass?word456",29);
const AVA = await users.createUser("Ava1234", "pas?sword789", "pas?sword789",35);

const WILLIAM = await users.createUser("William7890", "passw?ord012","passw?ord012", 42);

const ASH = await users.createUser("AshCatch'em", "g0@pik@chuu6", "g0@pik@chuu6",13);

// Populate DB with Kanbans
const TEAM_VALOR = await kanban.createKanban(
  PATRICK._id.toString(),
  "TEAM VALOR"
);
const TEAM_MYSTIC = await kanban.createKanban(
  EMMA._id.toString(),
  "TEAM MYSTIC"
);
const TEAM_INSTINCT = await kanban.createKanban(
  WILLIAM._id.toString(),
  "TEAM INSTICNT"
);

// Populate each Kanban with Users
await kanban.addUsertoKanban(AIDEN._id.toString(), TEAM_VALOR._id.toString());
await kanban.addUsertoKanban(
  CHARLOTTE._id.toString(),
  TEAM_VALOR._id.toString()
);
await kanban.addUsertoKanban(SAMUEL._id.toString(), TEAM_VALOR._id.toString());
await kanban.addUsertoKanban(ASH._id.toString(), TEAM_VALOR._id.toString());

await kanban.addUsertoKanban(LIAM._id.toString(), TEAM_MYSTIC._id.toString());
await kanban.addUsertoKanban(AVA._id.toString(), TEAM_MYSTIC._id.toString());
await kanban.addUsertoKanban(ASH._id.toString(), TEAM_MYSTIC._id.toString());

await kanban.addUsertoKanban(ASH._id.toString(), TEAM_INSTINCT._id.toString());

// Populate each Kanban with Tasks
const VALOR_GYM1 = await tasks.createTask(
  TEAM_VALOR._id.toString(),
  PATRICK._id.toString(),
  "Capture MillCreek",
  "Capture Millcreek Gym by 1:00pm",
  2,
  0
);
const VALOR_GYM2 = await tasks.createTask(
  TEAM_VALOR._id.toString(),
  ASH._id.toString(),
  "Capture Schmidts Woods",
  "Capture Millcreek Gym before close",
  3,
  0
);
const VALOR_GYM3 = await tasks.createTask(
  TEAM_VALOR._id.toString(),
  AIDEN._id.toString(),
  "Capture Marsh Trail",
  "Capture Millcreek Gym by 12pm",
  1,
  0
);

const MYSTIC_GYM1 = await tasks.createTask(
  TEAM_MYSTIC._id.toString(),
  EMMA._id.toString(),
  "Capture MillCreek",
  "Capture Millcreek Gym by 1:00pm",
  2,
  0
);
const MYSTIC_GYM2 = await tasks.createTask(
  TEAM_MYSTIC._id.toString(),
  LIAM._id.toString(),
  "Capture Schmidts Woods",
  "Capture Millcreek Gym before close",
  3,
  0
);
const MYSTIC_GYM3 = await tasks.createTask(
  TEAM_MYSTIC._id.toString(),
  AVA._id.toString(),
  "Capture Marsh Trail",
  "Capture Millcreek Gym by 12pm",
  1,
  0
);

const INSTINCT_GYM1 = await tasks.createTask(
  TEAM_INSTINCT._id.toString(),
  WILLIAM._id.toString(),
  "Capture MillCreek",
  "Capture Millcreek Gym by 1:00pm",
  2,
  0
);
const INSTICNT_GYM2 = await tasks.createTask(
  TEAM_INSTINCT._id.toString(),
  WILLIAM._id.toString(),
  "Capture Schmidts Woods",
  "Capture Millcreek Gym before close",
  3,
  0
);
const INSTICNT_GYM3 = await tasks.createTask(
  TEAM_INSTINCT._id.toString(),
  WILLIAM._id.toString(),
  "Capture Marsh Trail",
  "Capture Millcreek Gym by 12pm",
  1,
  0
);

await closeConnection();
console.log("Database Sucessfully Seeded!");
