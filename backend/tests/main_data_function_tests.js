const {
  createCourse,
  createSession,
  createPoll,
  deleteCourse,
  deleteSession,
  deletePoll
} = require("./backend-api.js");
const { testForError, testForSuccess, OVERRIDE_ERROR } = require("./tester");

const createCourseTest = async () => {
  //MISSING COURSENAME
  await testForError(
    createCourse,
    { instructorID: "4" },
    "ER_MISSING_PARAM",
    "MISSING COURSENAME"
  );

  //MISSING INSTRUCTORID
  await testForError(
    createCourse,
    { courseName: "defaultCourse" },
    "ER_MISSING_PARAM",
    "MISSING INSTRUCTORID"
  );

  //INVALID INSTRUCTORID
  await testForError(
    createCourse,
    { instructorID: "-1", courseName: "defaultCourse" },
    "ER_INVALID_REFERENCE",
    "INVALID INSTRUCTORID"
  );

  //CREATE ALL
  await testForSuccess(
    createCourse,
    {
      instructorID: "4",
      courseName: "defaultCourse",
      quarter: "FA",
      year: "2019",
      categories: [
        {
          categoryName: "categoryToBeEditted",
          visible: false,
          options: [{ optionName: "optionToBeEditted" }]
        }
      ]
    },
    ["courseID"],
    "CREATE ALL"
  );

  //CREATE ALL DUPLICATE
  await testForError(
    createCourse,
    {
      instructorID: "4",
      courseName: "defaultCourse",
      quarter: "FA",
      year: "2019"
    },
    "ER_ENTRY_EXISTS",
    "CREATE ALL DUPLICATE"
  );
};

const createSessionTest = async () => {
  //MISSING COURSEID
  await testForError(createSession, {}, "ER_MISSING_PARAM", "MISSING COURSEID");

  //INVALID COURSEID
  await testForError(
    createSession,
    { courseID: "-1" },
    "ER_INVALID_REFERENCE",
    "INVALID COURSEID"
  );

  //CREATE
  await testForSuccess(
    createSession,
    { courseID: "2" },
    ["sessionID"],
    "CREATE"
  );
};

const createPollTest = async () => {
  //MISSING SESSIONID
  await testForError(createPoll, {}, "ER_MISSING_PARAM", "MISSING SESSIONID");

  //INVALID SESSIONID
  await testForError(
    createPoll,
    { sessionID: "-1" },
    "ER_INVALID_REFERENCE",
    "INVALID SESSIONID"
  );

  //CREATE
  await testForSuccess(createPoll, { sessionID: "2" }, ["pollID"], "CREATE");
};

const deleteCourseTest = async () => {
  let { courseID } = await createCourse({
    instructorID: "4",
    courseName: "ToDelete"
  });

  //MISSING COURSEID
  await testForError(
    deleteCourse,
    {},
    "ER_MISSING_PARAM",
    "MISSING COURSEID",
    OVERRIDE_ERROR
  );

  //INVALID COURSEID
  await testForError(
    deleteCourse,
    { courseID: "-1" },
    "ER_INVALID_REFERENCE",
    "INVALID COURSEID",
    OVERRIDE_ERROR
  );

  //DELETE
  await testForSuccess(deleteCourse, { courseID: courseID }, [], "DELETE");
};

const deleteSessionTest = async () => {
  let { sessionID } = await createSession({ courseID: "2" });

  //MISSING SESSIONID
  await testForError(
    deleteSession,
    {},
    "ER_MISSING_PARAM",
    "MISSING SESSIONID",
    OVERRIDE_ERROR
  );

  //INVALID SESSIONID
  await testForError(
    deleteSession,
    { sessionID: "-1" },
    "ER_INVALID_REFERENCE",
    "INVALID SESSIONID",
    OVERRIDE_ERROR
  );

  //DELETE
  await testForSuccess(deleteSession, { sessionID: sessionID }, [], "DELETE");
};

const deletePollTest = async () => {
  let { pollID } = await createPoll({ sessionID: "2" });

  //MISSING POLLID
  await testForError(
    deletePoll,
    {},
    "ER_MISSING_PARAM",
    "MISSING POLLID",
    OVERRIDE_ERROR
  );

  //INVALID POLLID
  await testForError(
    deletePoll,
    { pollID: "-1" },
    "ER_INVALID_REFERENCE",
    "INVALID POLLID",
    OVERRIDE_ERROR
  );

  //DELETE
  await testForSuccess(deletePoll, { pollID: pollID }, [], "DELETE");
};

const runTests = async () => {
  await createCourseTest();
  await createSessionTest();
  await createPollTest();
  await deleteCourseTest();
  await deleteSessionTest();
  await deletePollTest();
};

module.exports = runTests;
