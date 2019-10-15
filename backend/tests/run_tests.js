const runResetDatabaseTest = require("./reset_database_tests");
const runAccountTests = require("./account_function_tests");
const runMainTests = require("./main_data_function_tests");
const runCategoryTests = require("./category_function_tests");
const runEditCourseTessts = require("./edit_course_tests");
const runCourseCodeTests = require("./course_code_function_tests");
const runActivityTests = require("./activity_function_tests");
const runStudentTests = require("./student_function_tests");
const runGetterTests = require("./getter_functions_tests");

async function runTests() {
  await runResetDatabaseTest();
  await runAccountTests();
  await runMainTests();
  await runCategoryTests();
  await runEditCourseTessts();
  await runCourseCodeTests();
  await runActivityTests();
  await runStudentTests();
  await runGetterTests();
}

runTests();
