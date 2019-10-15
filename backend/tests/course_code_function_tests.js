const { setCodeForCourse, deleteCodeForCourse } = require("./backend-api");
const { testForError, testForSuccess, OVERRIDE_ERROR } = require("./tester");

const setCodeForCourseTest_1 = async () => {
  //   let { courseID } = await createCourse({
  //     instructorID: "4",
  //     courseName: "codeTest"
  //   });

  //MISSING COURSEID
  await testForError(
    setCodeForCourse,
    { courseCode: "12345" },
    "ER_MISSING_PARAM",
    "MISSING COURSEID"
  );

  //INVALID COURSEID
  await testForError(
    setCodeForCourse,
    { courseID: "-1", courseCode: "12345" },
    "ER_INVALID_REFERENCE",
    "INVALID COURSEID"
  );

  //INVALID COURSECODE
  await testForError(
    setCodeForCourse,
    { courseID: "2", courseCode: "123" },
    "ER_INVALID_COURSECODE_FORMAT",
    "INVALID COURSECODE"
  );

  //SET
  await testForSuccess(
    setCodeForCourse,
    { courseID: "2" },
    ["courseCode"],
    "SET"
  );

  //SET ALL
  await testForSuccess(
    setCodeForCourse,
    { courseID: "2", courseCode: "12345" },
    ["courseCode"],
    "SET ALL"
  );
};
const deleteCodeForCourseTest = async () => {
  //MISSING COURSEID
  await testForError(
    deleteCodeForCourse,
    {},
    "ER_MISSING_PARAM",
    "MISSING COURSEID",
    OVERRIDE_ERROR
  );

  //INVALID COURSEID
  await testForError(
    deleteCodeForCourse,
    { courseID: "-1" },
    "ER_INVALID_REFERENCE",
    "INVALID COURSEID",
    OVERRIDE_ERROR
  );

  //DELETE
  await testForSuccess(deleteCodeForCourse, { courseID: "2" }, [], "DELETE");

  await setCodeForCourse({ courseID: "2", courseCode: "12345" });
};

const runTests = async () => {
  await setCodeForCourseTest_1();
  await deleteCodeForCourseTest();
};

module.exports = runTests;
