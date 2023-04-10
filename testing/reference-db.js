import users from '../data/users.js';
import kanban from '../data/kanban.js';

export let get_seeded_db = async() => {
    let seeded_db = {}
    let userList = await users.getAllUsers()
    let kanbanList = await kanban.getAllKanbans()
    
    // Add seeded users
    seeded_db["PATRICK"] = userList[0]
    seeded_db["AIDEN"] = userList[1]
    seeded_db["CHARLOTTE"] = userList[2]
    seeded_db["SAMUEL"] = userList[3]

    seeded_db["EMMA"] = userList[4]
    seeded_db["LIAM"] = userList[5]
    seeded_db["AVA"] = userList[6]
    
    seeded_db["WILLIAM"] = userList[7]
    
    seeded_db["ASH"] = userList[8]

    // Add seeded kanbans
    seeded_db["TEAM_VALOR"] = kanbanList[0]
    seeded_db["TEAM_MYSTIC"] = kanbanList[1]
    seeded_db["TEAM_INSTINCT"] = kanbanList[2]

    // TODO: Add seeded tasks once tasks is completed
    return seeded_db
};