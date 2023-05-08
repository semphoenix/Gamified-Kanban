(function () {
    checkString = (strVal, varName) => {
      if (!strVal) throw `Error: You must supply a ${varName}!`;
      if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
      strVal = strVal.trim();
      if (strVal.length === 0)
        throw `Error: ${varName} cannot be an empty string or string with just spaces`;
      if (!isNaN(strVal))
        throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
      return strVal;
    }
  
    checkPassword = (strVal, varName) => {
      console.log(strVal);
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
    }

    comparePassword = (pswd1, pswd2) => {
      if(pswd1 !== pswd2)
        throw "Error: passwords must match";
    }
  
    checkAge = (age, varName) => {
      if (!age) throw `Error: You must supply a ${varName}!`;
      if (typeof age !== 'string' || age.trim() === "") 
        throw "Error: string";
      age = +age;
      if (Number.isNaN(age) || !Number.isInteger(age))
        throw `Error: ${varName} must be a number`;
      if (age < 13)
        throw 'Error: you are not old enough to access the application';
      return age;
    }
  
    checkDifficulty = (difficulty, varName) => {
      if (!difficulty) 
        throw `Error: You must supply a ${varName}!`;
      difficulty = difficulty.toLowerCase().trim();
      if (typeof difficulty !== 'string' || difficulty.trim() == "") 
        throw `Error: ${varName} must be a valid string!`;
      if (difficulty !== "1" && difficulty !== "2" && difficulty !== "3") 
        throw `Error: ${varName} must be either 1, 2, 3`;
      return difficulty;
    }
  
    checkStatus = (status, varName) => {
      if (status===undefined) throw `Error: You must supply a ${varName}!`;
      if (typeof status !== 'number' || Number.isNaN(status) || !Number.isInteger(status)) throw `Error: ${varName} must be an integer number!`;
      if (status <0 || status > 3) throw `Error: ${varName} must be to-do = 0, in-progress = 1, in-review = 2, completed = 3`;
      return status;
    }
  
    checkVote = (vote, varName) => {
      if (vote===undefined) throw `Error: You must supply a ${varName}!`;
      if (typeof vote !== 'number' || Number.isNaN(vote) || !Number.isInteger(vote)) throw `Error: ${varName} must be an integer number!`;
      if (vote !==0 && vote !== 1) throw `Error: ${varName} must be to-do = 0, in-progress = 1, in-review = 2, completed = 3`;
      return vote;
    }

    // accesses the tag for the server side errors


    const loginErrorDiv = document.getElementById("loginError");
    const loginForm = document.getElementById("loginForm");
  
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            let username = document.getElementById("username");
            let password = document.getElementById("password");
            event.preventDefault();
            loginErrorDiv.hidden = true;
            try {
              checkString(username.value, "username");
              checkPassword(password.value, "password");
              event.target.submit();
            } catch (e) {
              loginErrorDiv.innerHTML = `<ul class="error-list"><li>${e}</li></ul>`;
              loginErrorDiv.hidden = false;
            }
        });
    }
  
    const signupForm = document.getElementById("signupForm");
    const signupErrorDiv = document.getElementById("signupError");
    if (signupForm) {
      signupForm.addEventListener("submit", (event) => {
        const username = document.getElementById("username");
        const age = document.getElementById("age");
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirmPassword");
        event.preventDefault();
        signupErrorDiv.hidden = true;
        try {
          checkString(username.value, "username");
          checkAge(age.value, "age");
          checkPassword(password.value, "password");
          checkPassword(confirmPassword.value, "password");
          comparePassword(password.value, confirmPassword.value);
          event.target.submit();
        } catch(e) {
          signupErrorDiv.innerHTML = `<ul class="error-list"><li>${e}</li></ul>`;
          signupErrorDiv.hidden = false;
        }
      });
    }

    const taskForm = document.getElementById("create-task-form");
    const taskErrorDiv = document.getElementById("task-error");

    // button for rendering the taskForm
    const createTask = document.getElementById("task-button");
    
    // div which holds the task form
    const taskFormDiv = document.getElementById("create-new-task-block");
    createTask.addEventListener("click", (event) => {
      taskFormDiv.hidden = false;
    });

    // cancel button for closing the task form
    const cancelButton = document.getElementById("cancel-button");
    cancelButton.addEventListener("click", (event) => {
      taskFormDiv.hidden = true;
      taskErrorDiv.innerHTML = "";
    });

    if (taskForm) {
      taskForm.addEventListener("submit", (event) => {
        const name = document.getElementById("task-name");
        const difficulty = document.getElementById("task-difficulty");
        const description = document.getElementById("task-description");
        event.preventDefault();
        try {
          taskErrorDiv.hidden = true;
          checkString(name.value, "name");
          checkString(description.value, "description");
          checkDifficulty(difficulty.value, "difficulty");
          taskFormDiv.hidden = true;
          event.target.submit();
        } catch(e) {
          taskErrorDiv.innerHTML = `<ul class="error-list"><li>${e}</li></ul>`;
          taskErrorDiv.hidden = false;
        }
      });
    }
})();
  