const { resetDatabase } = require("./backend-api");
const { testForError, testForSuccess } = require("./tester");

const resetDatabaseTest = async () => {
  await testForSuccess(resetDatabase, undefined, [], "RESET DATABASE");
};

const runTests = async () => {
  await resetDatabaseTest();
};

module.exports = runTests;
