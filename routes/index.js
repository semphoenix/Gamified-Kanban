import userRoutes from './users.js';
import  kanbanRoutes from './kanban.js';

const constructorMethod = (app) => {
  app.use('/', userRoutes);
    // stuff for kanbans
  app.use('*', (req, res) => {
    res.redirect('/');
  });
};

export default constructorMethod;
