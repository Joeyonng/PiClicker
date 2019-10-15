const {
  activateSession,
  activatePoll,
  deactivateSession,
  deactivatePoll
} = require("./backend-api");
const { testForError, testForSuccess } = require("./tester");

const activateSessionTest = async () => {
  //MISSING SESSIONID
  await testForError(
    activateSession,
    {},
    "ER_MISSING_PARAM",
    "MISSING SESSIONID"
  );

  //INVALID SESSIONID
  await testForError(
    activateSession,
    { sessionID: "-1" },
    "ER_INVALID_REFERENCE",
    "INVALID SESSIONID"
  );

  //ACTIVATE
  await testForSuccess(activateSession, { sessionID: "2" }, [], "ACTIVATE");
};

const activatePollTest = async () => {
  //MISSING POLLID
  await testForError(activatePoll, {}, "ER_MISSING_PARAM", "MISSING POLLID");

  //INVALID POLLID
  await testForError(
    activatePoll,
    { pollID: "-1" },
    "ER_INVALID_REFERENCE",
    "INVALID POLLID"
  );

  await deactivateSession();
  //NO SESSION ACTIVE
  await testForError(
    activatePoll,
    { pollID: "2" },
    "ER_NO_ACTIVE_SESSION",
    "NO SESSION ACTIVE"
  );

  await activateSession({ sessionID: "2" });

  //ACTIVATE
  await testForSuccess(activatePoll, { pollID: "2" }, [], "ACTIVATE");
};

const deactivateSessionTest = async () => {
  //DEACTIVATE
  await testForSuccess(deactivateSession, {}, [], "DEACTIVATE");

  await activateSession({ sessionID: "2" });
};

const deactivatePollTest = async () => {
  //DEACTIVATE
  await testForSuccess(deactivatePoll, {}, [], "DEACTIVATE");

  await activatePoll({ pollID: "2" });
};

const runTests = async () => {
  await activateSessionTest();
  await activatePollTest();
  await deactivateSessionTest();
  await deactivatePollTest();
};

module.exports = runTests;
