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
    // Minimum eight characters, at least one  letter and one number
    let pwd_regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; 
    // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
    let bval = pwd_regex.test(strVal);
    //if (!pwd_regex.test(strVal)) throw `Error: ${varName} password must contain minimum eight characters, at least one letter and one number`;
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