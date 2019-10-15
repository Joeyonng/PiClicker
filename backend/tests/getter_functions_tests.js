const {
  getCourses,
  getSessions,
  getPolls,
  getPollStudents,
  getActivityInfo
} = require("./backend-api");
const { testForError, testForSuccess, OVERRIDE_ERROR } = require("./tester");

const getCoursesTest = async () => {
  //MISSING INSTRUCTORID
  await testForError(
    getCourses,
    {},
    "ER_MISSING_PARAM",
    "MISSING INSTRUCTORID",
    OVERRIDE_ERROR
  );

  //INVALID INSTRUCTORID
  await testForError(
    getCourses,
    { instructorID: "-1" },
    "ER_MISSING_PARAM",
    "INVALID INSTRUCTORID",
    OVERRIDE_ERROR
  );

  //GET
  await testForSuccess(
    getCourses,
    { instructorID: "4" },
    [
      [
        "courses",
        "courseID",
        "courseCode",
        "quarter",
        "year",
        [
          "categories",
          "categoryID",
          "categoryName",
          "visible",
          ["options", "optionID", "optionName"]
        ],
        [
          "students",
          "studentID",
          ["categories", "categoryID", "categoryName", "optionID", "optionName"]
        ]
      ]
    ],
    "GET"
  );
};

const getSessionsTest = async () => {
  //MISSING COURSEID
  await testForError(
    getSessions,
    {},
    "ER_MISSING_PARAM",
    "MISSING COURSEID",
    OVERRIDE_ERROR
  );

  //INVALID COURSEID
  await testForError(
    getSessions,
    { courseID: "-1" },
    "ER_MISSING_PARAM",
    "INVALID COURSEID",
    OVERRIDE_ERROR
  );

  //GET
  await testForSuccess(
    getSessions,
    { courseID: "2" },
    [["sessions", "sessionID", "startTime", "courseID"]],
    "GET"
  );
};

const getPollsTest = async () => {
  //MISSING SESSIONID
  await testForError(
    getPolls,
    {},
    "ER_MISSING_PARAM",
    "MISSING SESSIONID",
    OVERRIDE_ERROR
  );

  //INVALID SESSIONID
  await testForError(
    getPolls,
    { sessionID: "-1" },
    "ER_MISSING_PARAM",
    "INVALID SESSIONID",
    OVERRIDE_ERROR
  );

  //GET
  await testForSuccess(
    getPolls,
    { sessionID: "2" },
    [["polls", "pollID", "startTime", "sessionID"]],
    "GET"
  );
};

const getPollStudentsTest = async () => {
  //MISSING POLLID
  await testForError(
    getPollStudents,
    {},
    "ER_MISSING_PARAM",
    "MISSING POLLID",
    OVERRIDE_ERROR
  );

  //INVALID POLLID
  await testForError(
    getPollStudents,
    { pollID: "-1" },
    "ER_MISSING_PARAM",
    "INVALID POLLID",
    OVERRIDE_ERROR
  );

  //GET
  await testForSuccess(
    getPollStudents,
    { pollID: "2" },
    [
      [
        "students",
        "studentID",
        "vote",
        ["categories", "categoryID", "categoryName", "optionID", "optionName"]
      ]
    ],
    "GET"
  );
};

const getActivityInfoTest = async () => {
  //GET
  await testForSuccess(
    getActivityInfo,
    {},
    [
      "pollID",
      "sessionID",
      "courseID",
      "courseName",
      [
        "categories",
        "categoryID",
        "categoryName",
        ["options", "optionID", "optionName"]
      ]
    ],
    "GET"
  );
};

const runTests = async () => {
  await getCoursesTest();
  await getSessionsTest();
  await getPollsTest();
  await getPollStudentsTest();
  await getActivityInfoTest();
};

module.exports = runTests;
