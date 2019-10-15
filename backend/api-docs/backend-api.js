let axios = require("axios");
let baseURL = "http://localhost:8888";
const io = require("socket.io-client");
const socket = io(baseURL);

const DEBUG = true;

/**
 * Thrown when a required param is not given to the database.
 * @const
 */
const ER_MISSING_PARAM = "ER_MISSING_PARAM";

/**
 * Thrown when trying to create or update an entry in the database but an entry with the same unique identifiers already exists.
 * Unique identifiers include, username, categoryName for a specific courseID, optionName for a specific categoryID, courseName and quarter and year for a specific instructorID, etc.
 * @constant
 */
const ER_ENTRY_EXISTS = "ER_ENTRY_EXISTS";

/**
 * Thrown when trying to update or create an entry with a database with some refernce (an ID usually), but the ID does not exist.
 * @constant
 */
const ER_INVALID_REFERENCE = "ER_INVALID_REFERENCE";

/**
 * Thrown when trying to login in and the username does not exist.
 * @constant
 */
const ER_INVALID_USERNAME = "ER_INVALID_USERNAME";

/**
 * Thrown when trying to login in and the password does not match the username.
 * @constant
 */
const ER_INVALID_PASSWORD = "ER_INVALID_PASSWORD";

/**
 * Thrown when trying to active a poll without an active session.
 * @constant
 */
const ER_NO_ACTIVE_SESSION = "ER_NO_ACTIVE_SESSION";

/**
 * Thrown when trying to add a specified courseCode but it is not a 5 digit, alphanumeric string.
 * @constant
 */
const ER_INVALID_COURSECODE_FORMAT = "ER_INVALID_COURSECODE_FORMAT";

/**
 * Thrown when a student is trying to vote an a vote of more than length 1 is entered (like "AA" for example). This probably will never happen. Just there in case it does.
 * @constant
 */
const ER_INVALID_VOTE_FORMAT = "ER_INVALID_VOTE_FORMAT";

/**
 * Thrown when a student tries to enter a courseCode that doesn't exist.
 * @constant
 */
const ER_INVALID_COURSECODE = "ER_INVALID_COURSECODE";

/**
 * Thrown when a student is trying to vote but is missing the courseCode for that course.
 * @constant
 */
const ER_MISSING_COURSECODE = "ER_MISSING_COURSECODE";

/**
 * Thrown when a student tries to vote but is missing a category for the course. This will not be thrown if the student is missing a category where visible = false.
 * @constant
 */
const ER_MISSING_CATEGORY = "ER_MISSING_CATEGORY";

/**
 * Reset the database completely.
 *
 * This erases all data from the database including users, courses, categories, etc.
 * Don't use this except for testing purposes or unless you specifically want a clean wipe.
 * The only data that will remain in the database is an instructor account with default credentials. (username: a, password: a) To change this, go into reset_database.js in the database_functions folder and change the default credentials on line 14/15.
 * This account will always have userID=1 since it is created at the end of the resetDatabase function. This is done so that the instructor never has to create an account from a public, accessible location.
 * The default login should be changed with the editAccountCredentials function once the instructor signs in (Maybe).
 * This default account is the one where the "iClicker" course is created. This is the course that all iClicker information will be put in.
 *
 * @function
 * @return {Promise} Resolves with {}.
 */
const resetDatabase = async () => {
  return axios
    .post(baseURL + "/reset/resetDatabase")
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        Promise.resolve();
      } else {
        Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Attemps to add a new student account to the database.
 *
 * Will return the unique userID and username of the user that was created.
 *
 * @function
 * @param {String} username The username of the account.
 * @param {String} password The password of the account.
 * @param {String} [PID] The 9 digit PID of the account. Will be null if not provided.
 * @param {String} [fname] The first name of the student. Will be null if not provided.
 * @param {String} [lname] The last name of the student. Will be null if not provided.
 * @return {Promise} Resolves with {userID, username}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_ENTRY_EXISTS}}.
 */
const createStudentAccount = async (username, password, PID, fname, lname) => {
  return axios
    .post(baseURL + "/account/createStudentAccount", {
      username,
      password,
      PID,
      fname,
      lname
    })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Attempts to add a new instructor account to the database.
 *
 * Will return the unique userID and username of the user the that was created.
 *
 * @function
 * @param {String} username The username of the account.
 * @param {String} password The password of the account.
 * @param {String} [prefix] The prefix of the instructor. e.g. 'Prof', 'Dr', etc. Don't think this is ever necessary. Just a thought. Will be null if not provided.
 * @param {String} [fname] The first name of the instructor. Will be null if not provided.
 * @param {String} [lname] The last name of the instructor. Will be null if not proivided.
 * @return {Promise} Resolves with {userID, username}. Rejects with Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_ENTRY_EXISTS}}.
 */
const createInstructorAccount = async (
  username,
  password,
  prefix,
  fname,
  lname
) => {
  return axios
    .post(baseURL + "/account/createInstructorAccount", {
      username,
      password,
      prefix,
      fname,
      lname
    })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    });
};

/**
 * Attempts to login user by checking if user credentials are valid.
 *
 * Will return the unique userID, userType, username, and user details listed below of the logged in user.
 * The userType is either 'instructor' for instructor or 'student' for student.
 *
 * @function
 * @param {String} username The username of the account.
 * @param {String} password The password of the account.
 * @return {Promise} Resolves with {userID, userType, username, fname, lname, PID/prefix}. If the userType is 'instructor', it returns prefix. If the userType is 'student', it returns PID. Rejects with {code: {@link ER_INVALID_USERNAME} | {@link ER_INVALID_PASSWORD}}.
 */
const login = async (username, password) => {
  return axios
    .post(baseURL + "/account/login", { username, password })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * This will change the credentials of the user corresponding to the userID provided.
 *
 * If only one is provided, only it will be changed.
 * One parameter must be provided. Either the username or password must be provided or it will throw an error.
 *
 * @function
 * @param {String} [newUsername]  The new username of the account. Leaving this empty will leave the current username unchanged.
 * @param {String} [newPassword]  The new password of the account. Leaving this empty will leave the current password unchanged.
 * @param {Number} userID The userID of the user whose credentials are being changed.
 * @return {Promise} Resolves with {userID}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_ENTRY_EXISTS} | {@link ER_INVALID_REFERENCE}}.
 */
const editAccountCredentials = async (newUsername, newPassword, userID) => {
  return axios
    .post(baseURL + "/account/editAccountCredentials", {
      newUsername,
      newPassword,
      userID
    })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Attempts to add a new course to the database with the corresponding parameters.
 *
 * Returns the unique courseID for the created course.
 * The database has a unique key constraint on the name, quarter, year, and instructorID.
 * This means a professor can only have one ECE 15 in Fall of 2019 for example.
 * Not sure if this is desired behavior, I just don't forsee anyone needing to have duplicate classes.
 * Also an instructor wouldn't be able to tell the difference between courses if they're identical.
 *
 * @function
 * @param {Number} instructorID The numerical ID of the instructor to whom the course belonds.
 * @param {String} courseName The course name of the course (ECE 15, CSE 11, etc).
 * @param {String} [quarter] A two digit code corresponding to the quarter during which the course takes place. Options: "FA", "WI", "SP", "S1", "S2". This will default to the current quarter (hard coded) if not provided.
 * @param {Number} [year] The year during which the course takes place. Should be in 4 digit format YYYY. This will default to the current year if not procided.
 * @param {Array} [categories] An array of objects of the form {categoryName, visible: true | false, options: [ {optionName} ]}
 * @return {Promise} Resolves with {courseID}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_ENTRY_EXISTS} | {@link ER_INVALID_REFERENCE}}.
 */
const createCourse = async (
  instructorID,
  courseName,
  quarter,
  year,
  categories
) => {
  return axios
    .post(baseURL + "/main/createCourse", {
      instructorID,
      courseName,
      quarter,
      year,
      categories
    })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Creates a new session corresponding to the courseID.
 *
 * Returns the unique sessionID for the created session.
 *
 * @function
 * @param {Number} courseID The courseID of the course for which this session is created.
 * @return {Promise} Resolves with {sessionID}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_INVALID_REFERENCE}}.
 */
const createSession = async courseID => {
  return axios
    .post(baseURL + "/main/createSession", { courseID })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Creates a new poll corresponding to the sessionID.
 *
 * Returns the unique pollID for the created poll.
 *
 * @function
 * @param {Number} sessionID The sessionID of the session for which the poll is created.
 * @return {Promise} Resolves with {pollID}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_INVALID_REFERENCE}}.
 */
const createPoll = async sessionID => {
  return axios
    .post(baseURL + "/main/createPoll", { sessionID })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Edits the course by replacing all current information with the provided new information.
 *
 * @function
 * @param {Number} courseID The courseID of the course to be renamed.
 * @param {String} newCourseName The new courseName to replace the existing one with.
 * @param {String} newQuarter The new quarter to replace the existing one with.
 * @param {String} newYear The new year to replace the existing one with.
 * @param {Object} newCategories The new categories to replace the existing ones with. Should be in the format {categoryID, categoryName, visible, options: [{optionID, optionName}]}. If you are creating a new category/option, do not include a categoryID/optionID. This is how I create a new category. I check if the categoryID/optionID is defined. If it is, I update. If not, I create a new entry.
 * @return {Promise} Resolves with {}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_ENTRY_EXISTS} | {@link ER_INVALID_REFERENCE}}.
 */
const editCourse = async (
  courseID,
  newCourseName,
  newQuarter,
  newYear,
  newCategories
) => {
  return axios
    .post(baseURL + "/main/editCourse", {
      courseID,
      newCourseName,
      newQuarter,
      newYear,
      newCategories
    })
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * This deletes all course, session, poll, category, and course code information.
 *
 * This deletes all poll answers, polls, sessions, course categories, student category responses, course codes, and student course code entires related to the course and the course itself.
 * It also deactivates the active poll and session if the poll/session is related to the course to be deleted.
 * If you provide a courseID that does not exist, it still succeeds, but does not affect the database.
 *
 * @function
 * @param {Number} courseID The courseID for which to delete all information.
 * @return {Promise} Resolves with {}. Rejects with {code: {@link ER_MISSING_PARAM}}.
 */
const deleteCourse = async courseID => {
  return axios
    .post(baseURL + "/main/deleteCourse", { courseID })
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * This deletes all session and poll information.
 *
 * This deletes all poll answers and polls related to the session.
 * It also deactivates the active poll and session if the poll/session is related to the session to be deleted. It also deletes the session itself.
 * If you provide a sessionID that does not exist, it still succeeds, but does not affect the database.
 *
 * @function
 * @param {Number} sessionID The sessionID for which to delete all session and poll information.
 * @return {Promise} Resolves with {}. Rejects with {code: {@link ER_MISSING_PARAM}}.
 */
const deleteSession = async sessionID => {
  return axios
    .post(baseURL + "/main/deleteSession", { sessionID })
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * This deletes all poll information.
 *
 * This deletes all poll answers related to the poll.
 * It also deactivates the active poll if the poll is the one to be deleted. It also deletes the poll itself.
 * If you provide a pollID that does not exist, it still succeeds, but does not affect the database.
 *
 * @function
 * @param {Number} pollID The pollID for which to delete all poll information.
 * @return {Promise} Resolves with {}. Rejects with {code: {@link ER_MISSING_PARAM}}.
 */
const deletePoll = async pollID => {
  return axios
    .post(baseURL + "/main/deletePoll", { pollID })
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Gets courses corresponding to instructorID.
 *
 * This returns all the courses corresponding with the instructorID provided when creating courses.
 * The courses come in an array of objects.
 * Each course objects has course info, category info, and student info.
 * If there are no categories/no students, the categories/students property will just be an empty array.
 * If you provide an instructorID that doesn't exist/no instructorID, it will return an empty array of courses.
 *
 * @function
 * @param {Number} instructorID The instructorID for which to request courses.
 * @return {Promise} Resolves with {courses: [{courseID, courseName, quarter, year, courseCode, categories: [{categoryID, categoryName, options: [{optionID, optionName}]}], students: [{studentID, categories: [{categoryID, categoryName, optionID, optionName}]}]}]}.
 */
const getCourses = async instructorID => {
  return axios
    .post(baseURL + "/getters/getCoursesByInstructorID", { instructorID })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Gets sessions corresponding to courseID.
 *
 * This returns all the sessions that correspond to a given courseID.
 * This returns whether or not the session is active (0 for false, 1 for true).
 * If you provide a courseID that doesn't exist/no courseID, it will just return an empty sessions array.
 *
 * @function
 * @param {Number} courseID The courseID for which to request sessions.
 * @return {Promise} Resolves with {sessions: [{sessionID, startTime, courseID, active}]}.
 */
const getSessions = async courseID => {
  return axios
    .post(baseURL + "/getters/getSessionsByCourseID", { courseID })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Gets polls corresponding to a given sessionID.
 *
 * This returns all the polls that correspond to a given sessionID.
 * This also returns whether or not the poll is active (0 for false, 1 for true)
 * If you provide a sessionID that doesn't exist/no sessionID, it will just return an empty polls array.
 *
 * @function
 * @param {Number} sessionID The sessionID for which to request polls.
 * @return {Promise} Resolves with {polls: [{pollID, startTime, sessionID, active}]}.
 */
const getPolls = async sessionID => {
  return axios
    .post(baseURL + "/getters/getPollsBySessionID", { sessionID })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Gets poll students and their votes corresponding to a given pollID.
 *
 * This returns all the studentIDs and votes for a specific pollID along with their category selections.
 * If you provide a pollID that doesn't exist/no pollID, it will just return an empty students array.
 *
 * @function
 * @param {Number} pollID The pollID for which to request info.
 * @return {Promise} Resolves with {students: [{studentID, vote, categories: [{categoryID, categoryName, optionID, optionName}]}]}.
 */
const getPollStudents = async pollID => {
  return axios
    .post(baseURL + "/getters/getPollStudentsByPollID", { pollID })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Gets the current active course/session/poll info.
 *
 * Returns the ID if active and null if inactive.
 * This also returns information about the course in which the session is active.
 *
 * @function
 * @return {Promise} Resolves with {sessionID, pollID, courseID, courseName, categories: [{categoryID, categoryName, options: {optionID, option}}]}.
 */

const getActivityInfo = async () => {
  return axios
    .post(baseURL + "/getters/getActivityInfo")
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Unsets previous active session and sets the sessionID as current active session.
 *
 * Only one session can be active at a time. If a session is already active and this method is called, it will deactivate the previous session before activating the new one.
 *
 * @function
 * @param {Number} sessionID The sessionID of the session to be activated.
 * @return {Promise} Resolves with {}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_INVALID_REFERENCE}}.
 */
const activateSession = async sessionID => {
  return axios
    .post(baseURL + "/activity/activateSession", { sessionID })
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Deactivates current active session.
 *
 * It is not necessary to call this method if trying to activate a session while another session is active. This is only used to make sure no sessions are active.
 *
 * @function
 * @return {Promise} Resolves with {}.
 */
const deactivateSession = async () => {
  return axios
    .post(baseURL + "/activity/deactivateSession")
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Unsets previous active poll and sets the pollID as current active poll.
 *
 * Only one poll can be active at a time. If a poll is already active and this method is called, it will deactivate the previous poll before activating the new one.
 *
 * @function
 * @param {Number} pollID The pollID of the poll to be activated.
 * @return {Promise} Resolves with {}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_INVALID_REFERENCE} | {@link ER_NO_ACTIVE_SESSION}}.
 */
const activatePoll = async pollID => {
  return axios
    .post(baseURL + "/activity/activatePoll", { pollID })
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Deactivates current active poll.
 *
 * It is not necessary to call this method if trying to activate a poll while another poll is active. This is only used to make sure no polls are active.
 *
 * @function
 * @return {Promise} Resolves with {}.
 */
const deactivatePoll = async () => {
  return axios
    .post(baseURL + "/activity/deactivatePoll")
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * This sets a course code for a specific courseID.
 *
 * This both sets and changes the course code. There are not separate 'add course code' and 'change course code' functions.
 * If a course code is not provided, a 5 letter alphanumeric string will be chosen at random and returned.
 * In the backend, .toUppercase() is called on the couse code so it doesn't matter whether the letters are uppercase or lowercase, they will all end up uppercase in the end.
 * I am not sure how much you plan to use this function, the professor didn't seem to need it, but it's there in any case.
 * Adding a course code just prevents a student from voting until they enter the course code. Not using one allows anyone connected to vote.
 * Changing the course code also will not affect any students who have already entered the code.
 *
 * @function
 * @param {Number} courseID The courseID for which to set/change a course code.
 * @param {String} [courseCode] A 5 letter string that is the desired course code. If not supplied, a random 5 letter alphanumeric string will be chosen instead.
 * @return {Promise} Resolves with {courseCode}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_INVALID_REFERENCE} | {@link ER_INVALID_COURSECODE_FORMAT}}.
 */
const setCodeForCourse = async (courseID, courseCode = undefined) => {
  return axios
    .post(baseURL + "/codes/setCodeForCourse", { courseID, courseCode })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * This removes a course code from a course.
 *
 * If you accidentally set a course code for a course, this will delete it.
 * This will also delete any students that are 'enrolled' in the course by course code.
 * So if there are students enrolled and you delete the course code, they will have to reenter the code if you make a new one.
 * If you try to delete a courseCode for a courseID that either doesn't exist or doesn't have a courseCode, it will still succeed but it won't affect the database.
 *
 * @function
 * @param {Number} courseID The courseID for which to remove a course code.
 * @return {Promise} Resolves with {}.
 */

const deleteCodeForCourse = async courseID => {
  return axios
    .post(baseURL + "/codes/deleteCodeForCourse", { courseID })
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

// /**
//  * This adds a category to a course for students to select from.
//  *
//  * This returns the unique categoryID for the newly created category.
//  * You must also add options with the addOptionToCategory function for students to be able to select an option.
//  *
//  * @function
//  * @param {Number} courseID The courseID for which to add a category.
//  * @param {String} categoryName The name of the category. For example: "Transfer Status" or "Experience".
//  * @return {Promise} Resolves with {categoryID}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_INVALID_REFERENCE}}.
//  */

// const addCategoryToCourse = async (courseID, categoryName) => {
//   return axios
//     .post(baseURL + "/categories/addCategoryToCourse", {
//       courseID,
//       categoryName
//     })
//     .then(response => {
//       _logResponse(response.data);
//       let data = Object.assign({}, response.data);
//       delete data.success;
//       if (response.data.success) {
//         return Promise.resolve({
//           ...data
//         });
//       } else {
//         return Promise.reject(response.data.err);
//       }
//     })
//     .catch(err => Promise.reject(err));
// };

// /**
//  * This adds an option to a category for students to select.
//  *
//  * This returns the unique optionID for the newly created option.
//  *
//  * @function
//  * @param {Number} categoryID The categoryID for which to add an option.
//  * @param {String} optionName The name of the option. For example: "Transfer" or "Non Transfer".
//  * @return {Promise} Resolves with {optionID}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_INVALID_REFERENCE}}.
//  */

// const addOptionToCategory = async (categoryID, optionName) => {
//   return axios
//     .post(baseURL + "/categories/addOptionToCategory", {
//       categoryID,
//       optionName: optionName
//     })
//     .then(response => {
//       _logResponse(response.data);
//       let data = Object.assign({}, response.data);
//       delete data.success;
//       if (response.data.success) {
//         return Promise.resolve({
//           ...data
//         });
//       } else {
//         return Promise.reject(response.data.err);
//       }
//     })
//     .catch(err => Promise.reject(err));
// };

/**
 * This deletes a category from the database.
 *
 * This will also delete any options under the category as well as any student selections in the category.
 * If you delete a category then create it again, students will have to reenter their information.
 *
 * @function
 * @param {Number} categoryID The categoryID to delete
 * @return {Promise} Resolves with {}. Rejects with {err: {code: String}}.
 */

/**
 * Attempts to add student to a course by course code in database.
 *
 * If a course is protected by a course code, a student must join the course using this method before being able to vote in that course's polls.
 * This is not to add a student into a course that does not require a course code.
 * This returns the courseID that the course code corresponds to if the join is successful.
 *
 * @function
 * @param {Number} studentID The studentID to add to course.
 * @param {String} courseCode The course code corresponding with the course to join.
 * @return {Promise} Resolves with {courseID}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_INVALID_REFERENCE} | {@link ER_INVALID_COURSECODE} | {@link ER_ENTRY_EXISTS}}.
 */
const enterStudentCourseCode = async (studentID, courseCode) => {
  return axios
    .post(baseURL + "/student/enterStudentCourseCode", {
      studentID,
      courseCode
    })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * This sets an optionID for a student category options.
 *
 * The optionIDs correspond to category options such as "Transfer" or "Non Transfer".
 * A student may not have multiple options selected per category.
 * So if a category such as "Transfer Status" has options "Transfer" with optionID=1 and "Non Transfer" with optionID=2, a student can't select both 1 and 2, it will just replace the existing selection in that category.
 *
 * @function
 * @param {Number} studentID The studentID to add to a category.
 * @param {Number} optionID The optionID to set as the value for a category for a student.
 * @return {Promise} Resolves with {}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_INVALID_REFERENCE}}.
 */

const setStudentOption = async (studentID, optionID) => {
  return axios
    .post(baseURL + "/student/setStudentOption", { studentID, optionID })
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Attempts to update the student's vote to provided vote in database for current active poll.
 *
 * This method returns a background color that is determined by the server. The color comes in the form '#FFFFFF'.
 * It should be set as the background color of the screen after a student submits a vote.
 * This is something the professor wanted. The professor uses this to see if all students have voted.
 * The student's vote will not log if the course has a course code and the student hasn't entered it.
 * It will also not log the student's vote if there is a category for the course corresponding to the active poll that the student does not have an option for.
 *
 * @function
 * @param {Number} studentID The studentID corresponding to the student who's vote should be updated.
 * @param {String} vote The one letter vote to set - "A", "B", "C", "D", "E".
 * @return {Promise} Resolves with {backgroundColor}. Rejects with {code: {@link ER_MISSING_PARAM} | {@link ER_INVALID_REFERENCE} | {@link ER_MISSING_COURSECODE} | {@link ER_MISSING_CATEGORY} | {@link ER_INVALID_VOTE_FORMAT}}.
 */
const setStudentVote = async (studentID, vote) => {
  return axios
    .post(baseURL + "/student/setStudentVote", { studentID, vote })
    .then(response => {
      _logResponse(response.data);
      let data = Object.assign({}, response.data);
      delete data.success;
      if (response.data.success) {
        return Promise.resolve({
          ...data
        });
      } else {
        return Promise.reject(response.data.err);
      }
    })
    .catch(err => Promise.reject(err));
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Changes RPi's access point credentials.
 *
 * Calling this method will disconnect everybody from the WiFi network because it is restarting the access point to change credentials.
 *
 * @function
 * @param {String} SSID The SSID to change to.
 * @param {String} password The password to change to.
 * @return {Promise} Resolves with {}. Rejects with {err: {code: String}}.
 */
const changeAPCreds = async (SSID, password) => {
  return axios
    .post(baseURL + "/piclickerUSB/changeAPCreds", { SSID, password })
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Changes the RPi's access point channel.
 *
 * Calling this method will disconnect everybody from the WiFi network because it is restarting the access point to change channel.
 * This should be used to change 'frequency'. On the frontend, you can alias AA as 1, AB as 2, etc.
 *
 * @function
 * @param {Number} channel The channel to change to.
 * @return {Promise} Resolves with {}. Rejects with {err: {code: String}}.
 */
const changeAPChannel = async channel => {
  return axios
    .post(baseURL + "/piclickerUSB/changeAPChannel", { channel })
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Opens custom poll viewing window on connected computer.
 *
 * This method tries to open the custom poll viewing window.
 * This will resolve if the network request was successful even if there is an error somewhere in displaying the window.
 * The open window script is an async python script so we have no way of knowing if that was successful. We do know that it called the python script if this method resolves.
 *
 * @function
 * @return {Promise} Resolves with {}. Rejects with {err: {code: String}}.
 */
const openPollWindow = async () => {
  return axios
    .post(baseURL + "/piclickerUSB/openPiClickerWindow")
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Closes custom poll viewing window on connected computer.
 *
 * This method tries to close the custom poll viewing window.
 * This will resolve if the network request was successful even if there is an error somewhere in closing the window.
 * The close window script is an async python script so we have no way of knowing if that was successful. We do know that it called the python script if this method resolves.
 *
 * @function
 * @return {Promise} Resolves with {}. Rejects with {err: {code: String}}.
 */
const closePollWindow = async () => {
  return axios
    .post(baseURL + "/piclickerUSB/closePiClickerWindow")
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * This method takes a screenshot from the custom Java program.
 *
 * This will resolve if the request is successfully received. We do not know if the python script succeeded.
 * Even if the network request is successful, the python program may fail if the Pi is in HID mode instead of ether.
 *
 * @function
 * @return {Promise} Resolves with {}. Rejects with {err: {code: String}}.
 */

const takeScreenshot = async () => {
  return axios
    .post(baseURL + "/piclickerUSB/takePiClickerScreenshot")
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * This method switches the Pi to HID mode.
 *
 * @function
 * @return {Promise} Resolves with {}. Rejects with {err: {code: String}}.
 */

const switchToHID = async () => {
  return axios
    .post(baseURL + "/piclickerUSB/switchToHID")
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * This method switches the Pi to HID mode.
 *
 * @function
 * @return {Promise} Resolves with {}. Rejects with {err: {code: String}}.
 */

const switchToGEther = async () => {
  return axios
    .post(baseURL + "/piclickerUSB/switchToGEther")
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Performs a clean shutdown of the RPi.
 *
 * The instructor should wait 5-10 seconds until unpluggint the RPi from power. You can display that as a message.
 *
 * @function
 * @return {Promise} Resolves with {}. Rejects with {err: {code: String}}.
 */
const shutdown = async () => {
  return axios
    .post(baseURL + "/piclickerUSB/shutdown")
    .then(response => {
      _logResponse(response.data);
      if (response.data.success) {
        return Promise.resolve();
      }
    })
    .catch(err => Promise.reject(err));
};

/**
 * Binds a particular callback to be executed when a session is activated.
 *
 * To later be able to unbind this callback, it must be passed in as a variable instead of a regular function expression. See unbindListenerToActivateSession description for more info.
 *
 * @function
 * @param {Function} callback A callback function that accepts a data parameter to be executed when a session is activated. The data comes in the form {sessionID: Number, courseID: Number} where sessionID is the active sessionID and the courseID is it's courseID.
 */

const bindListenerToActivatedSession = callback => {
  socket.on("sessionActivated", callback);
};

/**
 * Binds a particular callback to be executed when a session is deactivated.
 *
 * To later be able to unbind this callback, it must be passed in as a variable instead of a regular function expression. See unbindListenerToActivateSession description for more info.
 *
 * @function
 * @param {Function} callback A callback function that accepts no parameters to be executed when a session is deactivated.
 */

const bindListenerToDeactivatedSession = callback => {
  socket.on("sessionDeactivated", callback);
};

/**
 * Binds a particular callback to be executed when a poll is activated.
 *
 * To later be able to unbind this callback, it must be passed in as a variable instead of a regular function expression. See unbindListenerToActivateSession description for more info.
 *
 * @function
 * @param {Function} callback A callback function that accepts a data parameter to be executed when a poll is activated. The data comes in the form {pollID: Number} where pollID is the active pollID.
 */

const bindListenerToActivatedPoll = callback => {
  socket.on("pollActivated", callback);
};

/**
 * Binds a particular callback to be executed when a poll is deactivated.
 *
 * To later be able to unbind this callback, it must be passed in as a variable instead of a regular function expression. See unbindListenerToActivateSession description for more info.
 *
 * @function
 * @param {Function} callback A callback function that accepts no parameters to be executed when a poll is deactivated.
 */

const bindListenerToDeactivatedPoll = callback => {
  socket.on("pollDeactivated", callback);
};

/**
 * Binds a particular callback to be executed when a vote has been logged.
 *
 * To later be able to unbind this callback, it must be passed in as a variable instead of a regular function expression. See unbindListenerToActivateSession description for more info.
 *
 * @function
 * @param {Function} callback A callback function that accepts a data parameter to be executed when a vote is logged. The data comes in the form {studentID: Number, answer: String, pollID: Number, categories: [{categoryID: Number, options: [{optionID: Number}]}]}.
 */

const bindListenerToVoteLogged = callback => {
  socket.on("voteLogged", callback);
};

/**
 * Unbinds a particular callback from being executed when a session is activated.
 *
 * If no callback is provided it will unbind all listeners.
 * To unbind a particular callback, the callback must be stores in a variable and passed in.
 * For example: calling bindListener(() => console.log("Listening")) and then calling unbindListener(() => console.log("Listening")) will not actually unbind anything.
 * To successfully unbind a listener, you must do this: const handler = () => console.log("Listening"); bindListener(handler); unbindListener(handler).
 *
 * @function
 * @param {Function} [callback] The callback function to unbind.
 */

const unbindListenerToActivatedSession = (callback = null) => {
  if (callback === null) {
    socket.off("sessionActivated");
  } else {
    socket.off("sessionActivated", callback);
  }
};

/**
 * Unbinds a particular callback from being executed when a session is deactivated.
 *
 * If no callback is provided it will unbind all listeners.
 * To unbind a particular callback, the callback must be stores in a variable and passed in. See unbindListenerToActivateSession description for more info.
 *
 * @function
 * @param {Function} [callback] The callback function to unbind.
 */

const unbindListenerToDeactivatedSession = (callback = null) => {
  if (callback === null) {
    socket.off("sessionDeactivated");
  } else {
    socket.off("sessionDeactivated", callback);
  }
};

/**
 * Unbinds a particular callback from being executed when a poll is activated.
 *
 * If no callback is provided it will unbind all listeners.
 * To unbind a particular callback, the callback must be stores in a variable and passed in. See unbindListenerToActivateSession description for more info.
 *
 * @function
 * @param {Function} [callback] The callback function to unbind.
 */

const unbindListenerToActivatedPoll = (callback = null) => {
  if (callback === null) {
    socket.off("pollActivated");
  } else {
    socket.off("pollActivated", callback);
  }
};

/**
 * Unbinds a particular callback from being executed when a poll is deactivated.
 *
 * If no callback is provided it will unbind all listeners.
 * To unbind a particular callback, the callback must be stores in a variable and passed in. See unbindListenerToActivateSession description for more info.
 *
 * @function
 * @param {Function} [callback] The callback function to unbind.
 */

const unbindListenerToDeactivatedPoll = (callback = null) => {
  if (callback === null) {
    socket.off("pollDeactivated");
  } else {
    socket.off("pollDeactivated", callback);
  }
};

/**
 * Unbinds a particular callback from being executed when a vote has been logged.
 *
 * If no callback is provided it will unbind all listeners.
 * To unbind a particular callback, the callback must be stores in a variable and passed in. See unbindListenerToActivateSession description for more info.
 *
 * @function
 * @param {Function} callback A callback function to unbind.
 */

const unbindListenerToVoteLogged = (callback = null) => {
  if (callback === null) {
    socket.off("voteLogged");
  } else {
    socket.on("voteLogged", callback);
  }
};

function _logResponse(response) {
  if (DEBUG) {
    console.log(response);
  }
}

export default {
  resetDatabase,
  createStudentAccount,
  createInstructorAccount,
  login,
  editAccountCredentials,

  createCourse,
  createSession,
  createPoll,
  editCourse,
  deleteCourse,
  deleteSession,
  deletePoll,

  getCourses,
  getSessions,
  getPolls,
  getPollStudents,
  getActivityInfo,

  activateSession,
  deactivateSession,
  activatePoll,
  deactivatePoll,

  setCodeForCourse,
  deleteCodeForCourse,

  // addCategoryToCourse,
  // addOptionToCategory,

  enterStudentCourseCode,
  setStudentOption,
  setStudentVote,

  changeAPCreds,
  changeAPChannel,
  shutdown,
  openPollWindow,
  closePollWindow,

  bindListenerToActivatedSession,
  bindListenerToDeactivatedSession,
  bindListenerToActivatedPoll,
  bindListenerToDeactivatedPoll,
  bindListenerToVoteLogged,
  unbindListenerToActivatedSession,
  unbindListenerToDeactivatedSession,
  unbindListenerToActivatedPoll,
  unbindListenerToDeactivatedPoll,
  unbindListenerToVoteLogged
};
