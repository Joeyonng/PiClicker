const pool = require("./pool_creator");
const chalk = require("chalk");
const socket = require("./socket_creator");
const isEmpty = require("../isEmpty");

const { incrementBackgroundColorIndex } = require("./background_functions");

module.exports.activateSession = async sessionID => {
  if (isEmpty(sessionID)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  await this.deactivateSession().catch(err => console.log(err));

  let response = await pool
    .query(
      `INSERT INTO active_session (sessionID) VALUES (?);
        SELECT courseID from sessions WHERE sessionID=?`,
      [sessionID, sessionID]
    )
    .catch(err => {
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return Promise.reject({ code: "ER_INVALID_REFERENCE" });
      }
      return Promise.reject(err);
    });

  let courseID = response[0][1][0].courseID;

  console.log(chalk.bgGreen.black(`Session With ID ${sessionID} Activated!`));
  socket.emit("sessionActivated", { sessionID, courseID });

  return Promise.resolve();
};

module.exports.deactivateSession = async () => {
  await this.deactivatePoll().catch(err => Promise.reject(err));

  await pool
    .query(`DELETE FROM active_session;`)
    .catch(err => Promise.reject(err));

  console.log(chalk.bgGreen.black(`Session Deactivated!`));
  socket.emit("sessionDeactivated");

  return Promise.resolve();
};

module.exports.activatePoll = async pollID => {
  if (isEmpty(pollID)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  let response = await pool
    .query(`SELECT * FROM active_session;`)
    .catch(err => Promise.reject(err));

  if (response[0].length === 0) {
    return Promise.reject({ code: "ER_NO_ACTIVE_SESSION" });
  }

  response = await pool
    .query(`SELECT sessionID FROM polls WHERE pollID=?`, [pollID])
    .catch(err => Promise.reject(err));

  let sessionExists = response[0].length > 0;
  if (!sessionExists) {
    return Promise.reject({ code: "ER_INVALID_REFERENCE" });
  }

  let sessionID = response[0][0].sessionID;

  await this.deactivatePoll().catch(err => Promise.reject(err));

  await pool
    .query(`INSERT INTO active_poll (pollID, sessionID) VALUES (?, ?);`, [
      pollID,
      sessionID
    ])
    .catch(err => Promise.reject(err));

  console.log(chalk.bgGreen.black(`Poll With ID ${pollID} Activated!`));
  incrementBackgroundColorIndex();
  socket.emit("pollActivated", { pollID });

  return Promise.resolve();
};

module.exports.deactivatePoll = async () => {
  await pool
    .query(`DELETE FROM active_poll;`)
    .catch(err => Promise.reject(err));

  console.log(chalk.bgGreen.black(`Poll Deactivated!`));
  socket.emit("pollDeactivated");

  return Promise.resolve();
};
