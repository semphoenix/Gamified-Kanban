import userRoutes from "./users.js";
import kanbanRoutes from "./kanban.js";
import loginRoutes from "./login.js";
import taskRoutes from "./task.js"

const constructorMethod = (app) => {
  app.use("/", loginRoutes);
  app.use("/user", userRoutes);
  app.use("/kanban", kanbanRoutes);
  app.use("/task", taskRoutes);
  app.use("*", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });
};

export default constructorMethod;
