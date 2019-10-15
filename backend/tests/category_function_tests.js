const {
  addCategoryToCourse,
  addOptionToCategory
} = require("./backend-api.js");
const { testForError, testForSuccess } = require("./tester");

const addCategoryToCourseTest = async () => {
  //MISSING COURSEID
  await testForError(
    addCategoryToCourse,
    { courseName: "defaultCategory" },
    "ER_MISSING_PARAM",
    "MISSING COURSEID"
  );

  //MISSING CATEGORYNAME
  await testForError(
    addCategoryToCourse,
    { courseID: "2" },
    "ER_MISSING_PARAM",
    "MISSING CATEGORYNAME"
  );

  //INVALID COURSEID
  await testForError(
    addCategoryToCourse,
    { courseID: "-1", categoryName: "defaultCategory" },
    "ER_INVALID_REFERENCE",
    "INVALID COURSEID"
  );

  //CREATE
  await testForSuccess(
    addCategoryToCourse,
    { courseID: "2", categoryName: "defaultCategory" },
    ["categoryID"],
    "CREATE"
  );

  //CREATE DUPLICATE
  await testForError(
    addCategoryToCourse,
    { courseID: "2", categoryName: "defaultCategory" },
    "ER_ENTRY_EXISTS",
    "CREATE DUPLICATE"
  );
};

const addOptionToCategoryTest = async () => {
  //MISSING CATEGORYID
  await testForError(
    addOptionToCategory,
    { optionName: "defaultOption" },
    "ER_MISSING_PARAM",
    "MISSING CATEGORYID"
  );

  //MISSING OPTIONNAME
  await testForError(
    addOptionToCategory,
    { categoryID: "2" },
    "ER_MISSING_PARAM",
    "MISSING OPTIONNAME"
  );

  //INVALID CATEGORYID
  await testForError(
    addOptionToCategory,
    { categoryID: "-1", optionName: "defaultOption" },
    "ER_INVALID_REFERENCE",
    "INVALID CATEGORYID"
  );

  //CREATE
  await testForSuccess(
    addOptionToCategory,
    { categoryID: "2", optionName: "defaultOption" },
    ["optionID"],
    "CREATE"
  );

  //CREATE DUPLICATE
  await testForError(
    addOptionToCategory,
    { categoryID: "2", optionName: "defaultOption" },
    "ER_ENTRY_EXISTS",
    "CREATE DUPLICATE"
  );
};

const runTests = async () => {
  // await addCategoryToCourseTest();
  // await addOptionToCategoryTest();
};

module.exports = runTests;
