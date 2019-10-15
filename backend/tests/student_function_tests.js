const {
  enterStudentCourseCode,
  setStudentOption,
  setStudentVote,
  deactivatePoll,
  activatePoll
} = require("./backend-api");
const { testForError, testForSuccess, OVERRIDE_ERROR } = require("./tester");

const enterStudentCourseCodeTest = async () => {
  //MISSING STUDENTID
  await testForError(
    enterStudentCourseCode,
    { courseCode: "12345" },
    "ER_MISSING_PARAM",
    "MISSING STUDENTID"
  );

  //MISSING COURSECODE
  await testForError(
    enterStudentCourseCode,
    { studentID: "2" },
    "ER_MISSING_PARAM",
    "MISSING COURSECODE"
  );

  //INVALID STUDENTID
  await testForError(
    enterStudentCourseCode,
    { studentID: "-1", courseCode: "12345" },
    "ER_INVALID_REFERENCE",
    "INVALID STUDENTID"
  );

  //INCORRECT COURSECODE
  await testForError(
    enterStudentCourseCode,
    { studentID: "2", courseCode: "54321" },
    "ER_INVALID_COURSECODE",
    "INCORRECT COURSECODE"
  );

  //ENTER
  await testForSuccess(
    enterStudentCourseCode,
    {
      studentID: "2",
      courseCode: "12345"
    },
    ["courseID"],
    "ENTER"
  );

  //ENTER DUPLICATE
  await testForError(
    enterStudentCourseCode,
    { studentID: "2", courseCode: "12345" },
    "ER_ENTRY_EXISTS",
    "ENTER DUPLICATE"
  );
};

const setStudentOptionTest = async () => {
  //MISSING STUDENTID
  await testForError(
    setStudentOption,
    { optionID: "1" },
    "ER_MISSING_PARAM",
    "MISSING STUDENTID"
  );

  //MISSING OPTIONID
  await testForError(
    setStudentOption,
    { studentID: "2" },
    "ER_MISSING_PARAM",
    "MISSING OPTIONID"
  );

  //INVALID STUDENTID
  await testForError(
    setStudentOption,
    { studentID: "-1", optionID: "1" },
    "ER_INVALID_REFERENCE",
    "INVALID STUDENTID"
  );

  //INVALID OPTIONID
  await testForError(
    setStudentOption,
    { studentID: "2", optionID: "-1" },
    "ER_INVALID_REFERENCE",
    "INVALID OPTIONID"
  );

  //SET
  await testForSuccess(
    setStudentOption,
    { studentID: "2", optionID: "1" },
    [],
    "SET"
  );
};

const setStudentVoteTest_beforeCode_beforeCategories = async () => {
  //VOTE BEFORE ENTER CODE
  await testForError(
    setStudentVote,
    { studentID: "2", vote: "A" },
    "ER_MISSING_COURSECODE",
    "VOTE BEFORE ENTER CODE"
  );
};

const setStudentVoteTest_afterCode_beforeCategories = async () => {
  //VOTE BEFORE ENTER CATEGORIES
  await testForError(
    setStudentVote,
    { studentID: "2", vote: "A" },
    "ER_MISSING_CATEGORY",
    "VOTE BEFORE ENTER CATEGORIES"
  );
};

const setStudentVoteTest_afterAll = async () => {
  //MISSING STUDENTID
  await testForError(
    setStudentVote,
    { vote: "A" },
    "ER_MISSING_PARAM",
    "MISSING STUDENT"
  );

  //MISSING VOTE
  await testForError(
    setStudentVote,
    { studentID: "2" },
    "ER_MISSING_PARAM",
    "MISSING VOTE"
  );

  //INVALID STUDENTID
  await testForError(
    setStudentVote,
    { studentID: "-1", vote: "A" },
    "ER_INVALID_REFERENCE",
    "INVALID STUDENTID",
    OVERRIDE_ERROR
  );

  //INVALID VOTE
  await testForError(
    setStudentVote,
    { studentID: "2", vote: "GG" },
    "ER_INVALID_VOTE_FORMAT",
    "INVALID VOTE"
  );

  await deactivatePoll();

  //NO POLL ACTIVE
  await testForError(
    setStudentVote,
    { studentID: "2", vote: "A" },
    "ER_NO_ACTIVE_POLL",
    "NO POLL ACTIVE"
  );

  await activatePoll({ pollID: "2" });

  //VOTE
  await testForSuccess(
    setStudentVote,
    { studentID: "2", vote: "A" },
    [],
    "VOTE"
  );
};

const runTests = async () => {
  await setStudentVoteTest_beforeCode_beforeCategories();
  await enterStudentCourseCodeTest();
  await setStudentVoteTest_afterCode_beforeCategories();
  await setStudentOptionTest();
  await setStudentVoteTest_afterAll();
};

module.exports = runTests;
