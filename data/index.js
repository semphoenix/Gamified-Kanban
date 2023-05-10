import kanbanDataFunctions from "./kanban.js";
import userDataFunctions from "./users.js";
import tasksDataFunctions from "./tasks.js";

console.log(kanbanDataFunctions)
console.log(userDataFunctions)
console.log(tasksDataFunctions)

export const userFxns = userDataFunctions;
export const kanbanFxns = kanbanDataFunctions;
export const taskFxns = tasksDataFunctions;