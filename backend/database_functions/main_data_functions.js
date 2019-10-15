const pool = require("./pool_creator");
const chalk = require("chalk");
const {
  deactivatePoll,
  deactivateSession
} = require("./activity_changer_functions");
const {
  addCategoryToCourse,
  addOptionToCategory,
  editCategory,
  editOption,
  deleteCategory
} = require("./category_functions");
const { deleteCodeForCourse } = require("./course_code_functions");
const isEmpty = require("../isEmpty");

module.exports.createCourse = async (
  instructorID,
  courseName,
  quarter = _getCurrentQuarter(),
  year = new Date().getFullYear(),
  categories = []
) => {
  if (isEmpty(instructorID) || isEmpty(courseName)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  let response = await pool
    .query(
      `INSERT INTO courses (instructorID, courseName, quarter, year) VALUES (?, ?, ?, ?);
     SELECT courseID FROM courses WHERE courseName=? AND quarter=? AND year=?`,
      [instructorID, courseName, quarter, year, courseName, quarter, year]
    )
    .catch(err => {
      if (err.code === "ER_DUP_ENTRY") {
        return Promise.reject({ code: "ER_ENTRY_EXISTS" });
      }
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return Promise.reject({ code: "ER_INVALID_REFERENCE" });
      }
      return Promise.reject(err);
    });

  let courseID = response[0][1][0].courseID;

  //How do I handle errors in this but not an error in creating the course?;
  for (let i = 0; i < categories.length; i++) {
    let { categoryID } = await addCategoryToCourse(
      courseID,
      categories[i].categoryName,
      categories[i].visible
    ).catch(err => Promise.reject(err));
    for (let j = 0; j < categories[i].options.length; j++) {
      await addOptionToCategory(
        categoryID,
        categories[i].options[j].optionName
      ).catch(err => Promise.reject(err));
    }
  }

  console.log(chalk.bgGreen.black(`Course Created With ID ${courseID}`));

  return Promise.resolve({ courseID });
};

module.exports.createSession = async courseID => {
  if (isEmpty(courseID)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  let startTime = Date.now();

  let response = await pool
    .query(
      `INSERT INTO sessions (startTime, courseID) VALUES (?, ?);
       SELECT sessionID FROM sessions ORDER BY sessionID DESC LIMIT 1`,
      [startTime, courseID]
    )
    .catch(err => {
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return Promise.reject({ code: "ER_INVALID_REFERENCE" });
      }
      return Promise.reject(err);
    });

  let sessionID = response[0][1][0].sessionID;

  console.log(chalk.bgGreen.black(`Session Created With ID ${sessionID}`));

  return Promise.resolve({ sessionID, startTime });
};

module.exports.createPoll = async sessionID => {
  if (isEmpty(sessionID)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  let startTime = Date.now();

  let response = await pool
    .query(
      `INSERT INTO polls (startTime, sessionID) VALUES (?, ?);
       SELECT pollID FROM polls ORDER BY pollID DESC LIMIT 1`,
      [startTime, sessionID]
    )
    .catch(err => {
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return Promise.reject({ code: "ER_INVALID_REFERENCE" });
      }
      return Promise.reject(err);
    });

  let pollID = response[0][1][0].pollID;

  console.log(chalk.bgGreen.black(`Poll Created With ID ${pollID}`));

  return Promise.resolve({ pollID, startTime });
};

module.exports.editCourse = async (
  courseID,
  newCourseName,
  newQuarter,
  newYear,
  newCategories
) => {
  await pool.query(
    `UPDATE courses SET courseName=?, quarter=?, year=? WHERE courseID=?`,
    [newCourseName, newQuarter, newYear, courseID]
  );

  for (let i = 0; i < newCategories.length; i++) {
    let category = newCategories[i];

    if (category.categoryID !== undefined) {
      await editCategory(
        category.categoryID,
        category.categoryName,
        category.visible
      ).catch(err => Promise.reject(err));
    } else {
      let { categoryID } = await addCategoryToCourse(
        courseID,
        category.categoryName,
        category.visible
      ).catch(err => Promise.reject(err));
      category.categoryID = categoryID;
    }

    for (let j = 0; j < category.options.length; j++) {
      let option = category.options[j];
      if (option.optionID !== undefined) {
        await editOption(option.optionID, option.optionName).catch(err =>
          Promise.reject(err)
        );
      } else {
        await addOptionToCategory(category.categoryID, option.optionName).catch(
          err => Promise.reject(err)
        );
      }
    }
  }

  Promise.resolve();
};

module.exports.deleteCourse = async courseID => {
  await deleteCodeForCourse(courseID).catch(err => Promise.reject(err));

  let response = await pool
    .query(
      `SELECT categoryID FROM categories WHERE courseID=?;
    SELECT sessionID FROM sessions WHERE courseID=?;`,
      [courseID, courseID]
    )
    .catch(err => Promise.reject(err));

  let categories = response[0][0];

  for (let i = 0; i < categories.length; i++) {
    await deleteCategory(categories[i].categoryID).catch(err =>
      Promise.reject(err)
    );
  }

  let sessions = response[0][1];

  for (let i = 0; i < sessions.length; i++) {
    await this.deleteSession(sessions[i].sessionID).catch(err =>
      Promise.reject(err)
    );
  }

  await pool
    .query(`DELETE FROM courses WHERE courseID=?`, [courseID])
    .catch(err => Promise.reject(err));

  console.log(chalk.bgGreen.black(`Course Deleted With ID ${courseID}`));

  return Promise.resolve();
};

module.exports.deleteSession = async sessionID => {
  let response = await pool
    .query(`SELECT pollID FROM polls WHERE sessionID=?`, [sessionID])
    .catch(err => Promise.reject(err));

  let polls = response[0];

  for (let i = 0; i < polls.length; i++) {
    await this.deletePoll(polls[i].pollID).catch(err => Promise.reject(err));
  }

  response = await pool
    .query(`SELECT sessionID FROM active_session WHERE sessionID=?;`, [
      sessionID
    ])
    .catch(err => Promise.reject(err));

  let sessionIsActive = response[0].length > 0;

  if (sessionIsActive) {
    await deactivateSession().catch(err => Promise.reject(err));
  }

  await pool.query(`DELETE FROM sessions WHERE sessionID=?`, [sessionID]);

  console.log(chalk.bgGreen.black(`Session Deleted With ID ${sessionID}`));

  return Promise.resolve();
};

module.exports.deletePoll = async pollID => {
  let response = await pool
    .query(`SELECT pollID FROM active_poll WHERE pollID=?;`, [pollID])
    .catch(err => Promise.reject(err));

  let pollIsActive = response[0].length > 0;

  if (pollIsActive) {
    deactivatePoll();
  }

  await pool
    .query(
      `DELETE FROM poll_votes WHERE pollID=?;
      DELETE FROM polls WHERE pollID=?`,
      [pollID, pollID]
    )
    .catch(err => Promise.reject(err));

  console.log(chalk.bgGreen.black(`Poll Deleted With ID ${pollID}`));

  return Promise.resolve();
};

function _getCurrentQuarter() {
  let date = new Date();
  let year = date.getFullYear();

  const endWI = new Date(`03/31/${year}`);
  const endSP = new Date(`06/15/${year}`);
  const endS1 = new Date(`07/31/${year}`);
  const endS2 = new Date(`09/15/${year}`);
  const endFA = new Date(`12/31/${year}`);

  if (date <= endWI) {
    return "WI";
  }
  if (date <= endSP) {
    return "SP";
  }
  if (date <= endS1) {
    return "S1";
  }
  if (date <= endS2) {
    return "S2";
  }
  if (date <= endFA) {
    return "FA";
  }
}
