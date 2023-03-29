import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import validation from '../validation.js';

let exportedMethods = {

    async addUser(username, pswd, age, totalRewards, totalTasks, groups) {
        // username: string, cannot exist elsewhere in db

        // pwd: string, 8 characters

        // age > 13

        
    }



}