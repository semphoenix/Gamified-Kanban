import userRoutes from "./users.js";
import kanbanRoutes from "./kanban.js";

const constructorMethod = (app) => {
  app.use("/", userRoutes);
  app.use("/", kanbanRoutes);
  app.use("*", (req, res) => {
    res.redirect("/");
  });
};

export default constructorMethod;
