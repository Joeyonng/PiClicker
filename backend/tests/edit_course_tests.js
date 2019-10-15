const { editCourse } = require("./backend-api");
const { testForError, testForSuccess } = require("./tester");

const editCourseTest = async () => {
  //EDIT
  await testForSuccess(
    editCourse,
    {
      courseID: "2",
      newCourseName: "edittedCourse",
      newQuarter: "WI",
      newYear: "2020",
      newCategories: [
        {
          categoryID: "1",
          categoryName: "edittedDefaultCategory",
          visible: "1",
          options: [{ optionID: "1", optionName: "edittedDefaultOption" }]
        },
        {
          categoryName: "invisibleCategory",
          visible: "0",
          options: [{ optionName: "invisibleCategoryOption" }]
        }
      ]
    },
    [],
    "EDIT"
  );
};

const runTests = async () => {
  await editCourseTest();
};

module.exports = runTests;
