const {
  createStudentAccount,
  createInstructorAccount,
  login,
  editAccountCredentials
} = require("./backend-api");
const { testForError, testForSuccess, OVERRIDE_ERROR } = require("./tester");

const createStudentAccountTest = async () => {
  //MISSING USERNAME
  await testForError(
    createStudentAccount,
    { password: "ASD" },
    "ER_MISSING_PARAM",
    "MISSING USERNAME"
  );

  //MISSING PASSWORD
  await testForError(
    createStudentAccount,
    { username: "ASD" },
    "ER_MISSING_PARAM",
    "MISSING PASSWORD"
  );

  //CREATE
  await testForSuccess(
    createStudentAccount,
    {
      username: "defaultStudentAccount",
      password: "defaultStudentAccountPassword",
      PID: "123456789",
      fname: "Alexander",
      lname: "Dagman"
    },
    ["userID", "username"],
    "CREATE"
  );

  //CREATE DUPLICATE
  await testForError(
    createStudentAccount,
    {
      username: "defaultStudentAccount",
      password: "defaultStudentAccountPassword",
      PID: "123456789",
      fname: "Alexander",
      lname: "Dagman"
    },
    "ER_ENTRY_EXISTS",
    "CREATE DUPLICATE"
  );
};

const createInstructorAccountTest = async () => {
  await testForError(
    createInstructorAccount,
    { password: "ASD" },
    "ER_MISSING_PARAM",
    "MISSING USERNAME"
  );

  //MISSING PASSWORD
  await testForError(
    createInstructorAccount,
    { username: "ASD" },
    "ER_MISSING_PARAM",
    "MISSING PASSWORD"
  );

  //CREATE ALL
  await testForSuccess(
    createInstructorAccount,
    {
      username: "defaultInstructorAccount",
      password: "defaultInstructorAccountPassword",
      prefix: "Prof",
      fname: "Curt",
      lname: "Schurgers"
    },
    ["userID", "username"],
    "CREATE"
  );

  //CREATE ALL DUPLICATE
  await testForError(
    createInstructorAccount,
    {
      username: "defaultInstructorAccount",
      password: "defaultInstructorAccountPassword",
      prefix: "Prof",
      fname: "Curt",
      lname: "Schurgers"
    },
    "ER_ENTRY_EXISTS",
    "CREATE DUPLICATE"
  );
};

const loginTests = async () => {
  //NONEXISTENT USER
  await testForError(
    login,
    { username: "nonexistentUser", password: "" },
    "ER_INVALID_USERNAME",
    "NONEXISTENT USER"
  );

  //INCORRECT PASSWORD
  await testForError(
    login,
    { username: "defaultStudentAccount", password: "incorrectPassword" },
    "ER_INVALID_PASSWORD",
    "INCORRECT PASSWORD"
  );

  //LOGIN DEFAULT STUDENT
  await testForSuccess(
    login,
    {
      username: "defaultStudentAccount",
      password: "defaultStudentAccountPassword"
    },
    ["userID", "userType", "username", "PID", "fname", "lname"],
    "LOGIN DEFAULT STUDENT"
  );

  //LOGIN DEFAULT INSTRUCTOR
  await testForSuccess(
    login,
    {
      username: "defaultInstructorAccount",
      password: "defaultInstructorAccountPassword"
    },
    ["userID", "userType", "username", "prefix", "fname", "lname"],
    "LOGIN DEFAULT INSTRUCTOR"
  );
};

const editAccountTests = async () => {
  //MISSING USERID
  await testForError(
    editAccountCredentials,
    {
      newUsername: "defaultStudentAccountEdit",
      newPassword: "defaultStudentAccountPasswordEdit"
    },
    "ER_MISSING_PARAM",
    "MISSING USERID"
  );

  //MISSING USERNAME PASSWORD
  await testForError(
    editAccountCredentials,
    { userID: "2" },
    "ER_MISSING_PARAM",
    "MISSING USERNAME PASSWORD"
  );

  //INVALID USERID
  await testForError(
    editAccountCredentials,
    {
      userID: "-1",
      newUsername: "defaultStudentAccountEdit",
      newPassword: "defaultStudentAccountPasswordEdit"
    },
    "ER_INVALID_REFERENCE",
    "INVALID USERID",
    OVERRIDE_ERROR
  );

  //EDIT STUDENT ACCOUNT USERNAME
  await testForSuccess(
    editAccountCredentials,
    { userID: "2", newUsername: "defaultStudentAccountEdit" },
    [],
    "EDIT STUDENT USERNAME"
  );

  //EDIT STUDENT ACCOUNT PASSWORD
  await testForSuccess(
    editAccountCredentials,
    { userID: "2", newPassword: "defaultStudentAccountPasswordEdit" },
    [],
    "EDIT STUDENT PASSSWORD"
  );

  //EDIT STUDENT ACCOUNT ALL
  await testForSuccess(
    editAccountCredentials,
    {
      userID: "2",
      newUsername: "defaultStudentAccount",
      newPassword: "defaultStudentAccountPassword"
    },
    [],
    "EDIT STUDENT ALL"
  );

  //EDIT INSTRUCTOR DUPLICATE USERNAME
  await testForError(
    editAccountCredentials,
    { userID: "4", newUsername: "defaultStudentAccount" },
    "ER_ENTRY_EXISTS",
    "EDIT INSTRUCTOR DUPLICATE USERNAME"
  );
};

const runTests = async () => {
  await createStudentAccountTest();
  await createInstructorAccountTest();
  await loginTests();
  await editAccountTests();
  return Promise.resolve();
};

module.exports = runTests;
