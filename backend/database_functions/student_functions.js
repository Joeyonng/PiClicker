const pool = require("./pool_creator");
const chalk = require("chalk");
const socket = require("./socket_creator");
const isEmpty = require("../isEmpty");

const shell = require("shelljs");
const {
  incrementIdempotencyByte,
  getIdempotencyByte
} = require("./vote_idempotency_functions");

const COMBINE = "COMBINE";
const REDUCE = "REDUCE";

module.exports.enterStudentCourseCode = async (studentID, courseCode) => {
  if (isEmpty(studentID) || isEmpty(courseCode)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  let response = await pool
    .query(`SELECT courseID FROM course_codes WHERE courseCode=?;`, [
      courseCode
    ])
    .catch(err => Promise.reject(err));

  let course = response[0][0];
  let courseCodeExists = course !== undefined;

  if (courseCodeExists) {
    await pool
      .query(`INSERT INTO student_codes (studentID, courseID) VALUES (?, ?)`, [
        studentID,
        course.courseID
      ])
      .catch(err => {
        if (err.code === "ER_DUP_ENTRY") {
          return Promise.reject({ code: "ER_ENTRY_EXISTS" });
        }
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
          return Promise.reject({ code: "ER_INVALID_REFERENCE" });
        }
        return Promise.reject(err);
      });

    console.log(
      chalk.bgGreen.black(
        `Student With ID ${studentID} Entered Code For Course ${course.courseID}`
      )
    );

    return Promise.resolve({ courseID: course.courseID });
  } else {
    return Promise.reject({ code: "ER_INVALID_COURSECODE" });
  }
};

module.exports.setStudentOption = async (studentID, optionID) => {
  if (isEmpty(studentID) || isEmpty(optionID)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  await pool
    .query(
      `SELECT @categoryID := categoryID FROM options WHERE optionID=?;
    REPLACE INTO student_options (studentID, categoryID, optionID) VALUES (?, @categoryID, ?);`,
      [optionID, studentID, optionID]
    )
    .catch(err => {
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return Promise.reject({ code: "ER_INVALID_REFERENCE" });
      }
      return Promise.reject(err);
    });

  console.log(
    chalk.bgGreen.black(
      `Student With ID ${studentID} Entered Category Option With ID ${optionID}`
    )
  );

  return Promise.resolve();
};

module.exports.setStudentVote = async (studentID, vote) => {
  if (isEmpty(studentID) || isEmpty(vote)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  let response = await pool
    .query(
      `SELECT active_poll.pollID, courses.courseID FROM active_poll
        LEFT JOIN polls ON active_poll.pollID=polls.pollID
        LEFT JOIN sessions ON polls.sessionID=sessions.sessionID
        LEFT JOIN courses ON courses.courseID=sessions.courseID;`
    )
    .catch(err => Promise.reject(err));

  let activePollInfo = response[0][0];
  let pollActive = activePollInfo !== undefined;

  if (!pollActive) {
    return Promise.reject({ code: "ER_NO_ACTIVE_POLL" });
  }

  let courseID = activePollInfo.courseID;

  response = await pool
    .query(
      `SELECT student_codes.studentID FROM course_codes
        LEFT JOIN student_codes ON course_codes.courseID=student_codes.courseID AND student_codes.studentID=?
        WHERE course_codes.courseID=?`,
      [studentID, courseID]
    )
    .catch(err => Promise.reject(err));

  let courseHasCode = response[0].length > 0;

  if (courseHasCode) {
    let studentIsEnrolled = response[0][0].studentID;
    if (!studentIsEnrolled) {
      return Promise.reject({ code: "ER_MISSING_COURSECODE" });
    }
  }

  response = await pool
    .query(
      `SELECT categories.categoryID, student_options.studentID FROM categories
        LEFT JOIN student_options ON categories.categoryID=student_options.categoryID AND student_options.studentID=?
        WHERE categories.courseID=? AND categories.visible=1`,
      [studentID, courseID]
    )
    .catch(err => Promise.reject(err));

  let categories = response[0];

  for (let i = 0; i < categories.length; i++) {
    if (categories[i].studentID === null) {
      return Promise.reject({
        code: `ER_MISSING_CATEGORY`,
        categoryID: categories[i].categoryID
      });
    }
  }

  //THIS IS FOR TESTING. REMOVE FOR PRODUCTION.

  response = await pool
    .query(`SELECT PID FROM students WHERE studentID=?`, [studentID])
    .catch(err => Promise.reject(err));

  let studentPID = response[0][0].PID.slice(0, 6);
  console.log(studentPID);
  let idempotencyByte = getIdempotencyByte();
  incrementIdempotencyByte();
  shell.exec(
    `python3 /Users/alexdagman/Desktop/iclicker-app/backend/python/send_response.py ${studentPID} ${vote} ${idempotencyByte}`,
    { async: true }
  );

  //END OF TESTING.

  await pool
    .query(
      `REPLACE INTO poll_votes (studentID, pollID, vote) VALUES (?, ?, ?)`,
      [studentID, activePollInfo.pollID, vote]
    )
    .catch(err => {
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return Promise.reject({ code: "ER_INVALID_REFERENCE" });
      }
      if (err.code === "ER_DATA_TOO_LONG") {
        return Promise.reject({ code: "ER_INVALID_VOTE_FORMAT" });
      }
      return Promise.reject(err);
    });

  response = await pool
    .query(
      `SELECT poll_votes.studentID, poll_votes.vote, poll_votes.pollID, categories.categoryID, categories.categoryName, student_options.optionID, options.optionName FROM poll_votes
        LEFT JOIN polls ON poll_votes.pollID=polls.pollID
        LEFT JOIN sessions ON polls.sessionID=sessions.sessionID
        LEFT JOIN courses ON courses.courseID=sessions.courseID
        LEFT JOIN categories ON courses.courseID=categories.courseID AND categories.visible=1
        LEFT JOIN student_options ON categories.categoryID=student_options.categoryID AND poll_votes.studentID=student_options.studentID
        LEFT JOIN options ON student_options.optionID=options.optionID AND student_options.categoryID=options.categoryID
        WHERE poll_votes.pollID=? AND poll_votes.studentID=?`,
      [activePollInfo.pollID, studentID]
    )
    .catch(err => Promise.reject(err));

  let keys = [
    { op: COMBINE, title: "students", key: "studentID" },
    { op: REDUCE, key: "vote" },
    { op: REDUCE, key: "pollID" },
    { op: COMBINE, title: "categories", key: "categoryID" },
    { op: REDUCE, key: "categoryName" },
    { op: REDUCE, key: "optionID" },
    { op: REDUCE, key: "optionName" }
  ];

  let studentVoteInfo = formatArrayByKeySchema(keys, response[0]);

  socket.emit("voteLogged", studentVoteInfo);

  console.log(
    chalk.bgGreen.black(`Student With ID ${studentID} Voted Answer ${vote}`)
  );

  return Promise.resolve();
};

function formatArrayByKeySchema(keys, array) {
  if (keys.length === 0) {
    return null;
  }

  let currentKey = keys[0];

  let result = separateByKey(currentKey, array);

  for (let i = 0; i < result.length; i++) {
    let nextData = formatArrayByKeySchema(keys.slice(1), result[i].data);
    delete result[i].data;

    Object.assign(result[i], nextData);
  }

  if (currentKey.op === COMBINE) {
    result = { [currentKey.title]: result };
  }
  if (currentKey.op === REDUCE) {
    result = result[0];
  }

  return result;
}

function separateByKey(key, array) {
  let unseparated = {};

  let separated = Array.from(
    new Set(
      array.map(object => {
        let value = object[key.key];

        delete object[key.key];
        if (unseparated[value] === undefined) {
          unseparated[value] = [];
        }

        unseparated[value].push(object);

        return value;
      })
    )
  );

  if (key.op === COMBINE) {
    if (separated.length === 1 && separated[0] === null) {
      return [];
    }
  }

  return separated.map(value => ({
    [key.key]: value,
    data: unseparated[value]
  }));
}
