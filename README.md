# Gamified-Kanban

Welcome to the Gamified Kanban! The goal of this application is to create a collaborative workspace that incentivises users to complete tasks through a reward system, and hold users accountable for their work via a democratic voting system.

To get started, you will need to download all our code. 

There are a few dependencies, which can be installed with ```npm install```.
Then, there is an option to seed the database with ```npm run seed```. Make sure you have a database called GamifiedKanban, and that the connection string is mongodb://localhost:27017. There are two collections: users and kanbans. Our seed file creates several users and a few kanbans, each with multiple users and some demo tasks. There are three task statuses, indicating whether the task is todo, in progress, or in review. The seed file will generate tasks in all statuses. 
Finally, ```npm start``` will start our application on http://localhost:3000, which can be opened in any browser. 
