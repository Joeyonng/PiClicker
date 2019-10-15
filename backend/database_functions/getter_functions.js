const pool = require("./pool_creator");
const chalk = require("chalk");

const COMBINE = "COMBINE";
const REDUCE = "REDUCE";

module.exports.getCoursesByInstructorID = async instructorID => {
  let response = await pool
    .query(
      `SELECT courses.courseID, courses.courseName, courses.quarter, courses.year, course_codes.courseCode
       FROM courses
       LEFT JOIN course_codes ON courses.courseID=course_codes.courseID
       WHERE courses.instructorID=?
       ORDER BY courses.courseID DESC;
  `,
      [instructorID]
    )
    .catch(err => Promise.reject(err));

  let courses = response[0];

  for (let [index, course] of courses.entries()) {
    let result;
    result = await getCategoriesByCourseID(courses[index].courseID);
    courses[index].categories = result.categories;
    result = await getStudentsByCourseID(courses[index].courseID);
    courses[index].students = result.students;
  }

  return Promise.resolve({ courses });
};

module.exports.getSessionsByCourseID = async courseID => {
  let response = await pool
    .query(
      `SELECT sessions.courseID, sessions.sessionID, sessions.startTime, active_session.active FROM sessions
        LEFT JOIN active_session ON sessions.sessionID=active_session.sessionID
        WHERE sessions.courseID=?
        ORDER BY sessions.sessionID DESC`,
      [courseID]
    )
    .catch(err => Promise.reject(err));

  let sessions = response[0];

  console.log(
    chalk.bgGreen.black(`Sessions Retrieved For Course With ID ${courseID}`)
  );

  return Promise.resolve({ sessions });
};

module.exports.getPollsBySessionID = async sessionID => {
  let response = await pool
    .query(
      `SELECT polls.sessionID, polls.pollID, polls.startTime, active_poll.active FROM polls
          LEFT JOIN active_poll ON polls.pollID=active_poll.pollID
          WHERE polls.sessionID=?
          ORDER BY polls.pollID DESC`,
      [sessionID]
    )
    .catch(err => Promise.reject(err));

  let polls = response[0];

  console.log(
    chalk.bgGreen.black(`Polls Retrieved For Session With ID ${sessionID}`)
  );

  return Promise.resolve({ polls });
};

module.exports.getPollStudentsByPollID = async pollID => {
  let response = await pool
    .query(
      `SELECT poll_votes.studentID, poll_votes.vote, poll_votes.pollID,
      categories.categoryID, categories.categoryName, options.optionID, options.optionName
      FROM poll_votes
    LEFT JOIN polls ON poll_votes.pollID=polls.pollID
    LEFT JOIN sessions ON polls.sessionID=sessions.sessionID
    LEFT JOIN courses ON courses.courseID=sessions.courseID
    LEFT JOIN categories ON courses.courseID=categories.courseID
    LEFT JOIN options ON categories.categoryID=options.optionID
    LEFT JOIN student_options ON categories.categoryID=student_options.categoryID AND options.optionID=student_options.optionID AND poll_votes.studentID=student_options.studentID
    WHERE poll_votes.pollID=?`,
      [pollID]
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

  let result = formatArrayByKeySchema(keys, response[0]);
  let students = result.students;

  console.log(chalk.bgGreen.black(`Info Retrieved For Poll With ID ${pollID}`));

  return Promise.resolve({ students });
};

module.exports.getActivityInfo = async () => {
  let response = await pool
    .query(`SELECT pollID FROM active_poll`)
    .catch(err => Promise.reject(err));

  let pollID = response[0].length > 0 ? response[0][0].pollID : null;

  response = await pool
    .query(
      `SELECT sessions.sessionID, courses.courseID, courses.courseName FROM active_session
            LEFT JOIN sessions ON active_session.sessionID=sessions.sessionID
            LEFT JOIN courses ON sessions.courseID=courses.courseID`
    )
    .catch(err => Promise.reject(err));

  let sessionActive = response[0].length > 0;
  let sessionID = null;
  let courseID = null;
  let courseName = null;
  let categories = [];

  if (sessionActive) {
    sessionID = response[0][0].sessionID;
    courseID = response[0][0].courseID;
    courseName = response[0][0].courseName;
    let tempCategories = await getCategoriesByCourseID(courseID).catch(err =>
      Promise.reject(err)
    ); //I cant do await get...(courseID).categories so I have to make a temp object.
    categories = tempCategories.categories;
  }

  console.log(chalk.bgGreen.black(`Activity Information Retrieved`));

  return Promise.resolve({
    sessionID,
    pollID,
    courseID,
    courseName,
    categories
  });
};

const getCategoriesByCourseID = async courseID => {
  let response = await pool
    .query(
      `SELECT categories.categoryID, categories.categoryName, categories.visible, options.optionID, options.optionName FROM categories
     LEFT JOIN options ON categories.categoryID=options.categoryID
     WHERE courseID=${courseID}`
    )
    .catch(err => Promise.reject(err));

  let keys = [
    { op: COMBINE, title: "categories", key: "categoryID" },
    { op: REDUCE, key: "categoryName" },
    { op: REDUCE, key: "visible" },
    { op: COMBINE, title: "options", key: "optionID" },
    { op: REDUCE, key: "optionName" }
  ];

  let result = formatArrayByKeySchema(keys, response[0]);
  let categories = result.categories;

  console.log(
    chalk.bgGreen.black(`Categories Retrieved For Course With ID ${courseID}`)
  );

  return Promise.resolve({ categories });
};

const getStudentsByCourseID = async courseID => {
  let response = await pool
    .query(
      `SELECT categories.categoryID, categories.categoryName, options.optionID, options.optionName, poll_votes.studentID
       FROM courses
       INNER JOIN sessions ON courses.courseID=sessions.courseID
       INNER JOIN polls ON sessions.sessionID=polls.sessionID
       INNER JOIN poll_votes ON polls.pollID=poll_votes.pollID
       LEFT JOIN categories ON courses.courseID=categories.courseID
       LEFT JOIN student_options ON categories.categoryID=student_options.categoryID
       LEFT JOIN options ON student_options.optionID=options.optionID
       WHERE courses.courseID=?`,
      [courseID]
    )
    .catch(err => Promise.reject(err));

  let keys = [
    { op: COMBINE, key: "studentID", title: "students" },
    { op: COMBINE, key: "categoryID", title: "categories" },
    { op: REDUCE, key: "categoryName" },
    { op: REDUCE, key: "optionID" },
    { op: REDUCE, key: "optionName" }
  ];

  let result = formatArrayByKeySchema(keys, response[0]);
  let students = result.students;

  return Promise.resolve({ students });
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
