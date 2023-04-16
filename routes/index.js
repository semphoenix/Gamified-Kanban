import userRoutes from "./users.js";
import kanbanRoutes from "./kanban.js";

const constructorMethod = (app) => {
  app.use("/", loginRoutes);
  app.use("/user", userRoutes);
  app.use("/kanban", kanbanRoutes);
  app.use("*", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });
};

export default constructorMethod;
