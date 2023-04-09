import {ObjectId} from 'mongodb';

const exportedMethods = {
  checkId(id, varName) {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== 'string') throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
  },

  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },
  /**
   * Checks if pswd is a valid input string, and that it comtains minimum eight characters, at least one letter and one number.
   * @param {String} strVal 
   * @param {String} varName 
   * @returns strVal.trim()
   */
  checkPassword(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    // Minimum eight characters, at least one  letter and one number and one special character
    let pwd_regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/; 
    // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
    let bval = pwd_regex.test(strVal);
    if (!bval) throw `Error: ${varName} password must contain minimum eight characters, at least one letter, one number, and one special character @$!%*#?&`;
    return strVal;
  },
  /**
   * Checks if age is an valid Integer number that's greater than or equal to 13.
   * @param {Integer} age 
   * @param {String} varName 
   * @returns age
   */
  checkAge(age, varName) {
    if (!age) throw `Error: You must supply a ${varName}!`;
    if (typeof age !== 'number' || Number.isNaN(age) || !Number.isInteger(age)) throw `Error: ${varName} must be an integer number!`;
    if (age < 13) throw `Error: ${varName} must be greater than 12!`;
    return age;
  },

  checkDifficulty(difficulty, varName) {
    if (difficulty===undefined) throw `Error: You must supply a ${varName}!`;
    if (typeof difficulty !== 'number' || Number.isNaN(difficulty) || !Number.isInteger(difficulty)) throw `Error: ${varName} must be an integer number!`;
    if (difficulty <1 || difficulty > 3) throw `Error: ${varName} must be 1=easy, 2=medium, 3=hard`;
    return difficulty;
  },

  checkStatus(status, varName) {
    if (status===undefined) throw `Error: You must supply a ${varName}!`;
    if (typeof status !== 'number' || Number.isNaN(status) || !Number.isInteger(status)) throw `Error: ${varName} must be an integer number!`;
    if (status <0 || status > 3) throw `Error: ${varName} must be to-do = 0, in-progress = 1, in-review = 2, completed = 3`;
    return status;
  },

  checkVote(vote, varName){
    if (vote===undefined) throw `Error: You must supply a ${varName}!`;
    if (typeof vote !== 'number' || Number.isNaN(vote) || !Number.isInteger(vote)) throw `Error: ${varName} must be an integer number!`;
    if (vote !==0 && vote !== 1) throw `Error: ${varName} must be to-do = 0, in-progress = 1, in-review = 2, completed = 3`;
    return vote;
  },

  checkStringArray(arr, varName) {
    //We will allow an empty array for this,
    //if it's not empty, we will make sure all tags are strings
    if (!arr || !Array.isArray(arr))
      throw `You must provide an array of ${varName}`;
    for (let i in arr) {
      if (typeof arr[i] !== 'string' || arr[i].trim().length === 0) {
        throw `One or more elements in ${varName} array is not a string or is an empty string`;
      }
      arr[i] = arr[i].trim();
    }

    return arr;
  }
};

export default exportedMethods;