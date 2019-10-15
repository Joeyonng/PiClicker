const pool = require("./pool_creator");
const chalk = require("chalk");
const randomstring = require("randomstring");
const isEmpty = require("../isEmpty");

module.exports.setCodeForCourse = async (
  courseID,
  providedCourseCode = null
) => {
  if (isEmpty(courseID)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  let courseCode =
    providedCourseCode === null
      ? randomstring.generate({
          length: 5,
          capitalization: "uppercase"
        })
      : providedCourseCode.toUpperCase();

  if (courseCode.length !== 5) {
    return Promise.reject({ code: "ER_INVALID_COURSECODE_FORMAT" });
  }

  await pool
    .query(`REPLACE INTO course_codes (courseID, courseCode) VALUES (?, ?);`, [
      courseID,
      courseCode
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
    chalk.bgGreen.black(`Course Code Set For Course With ID ${courseID}`)
  );

  return Promise.resolve({ courseCode });
};

module.exports.deleteCodeForCourse = async courseID => {
  await pool
    .query(
      `DELETE FROM student_codes WHERE courseID=?;
       DELETE FROM course_codes WHERE courseID=?`,
      [courseID, courseID]
    )
    .catch(err => Promise.reject(err));

  console.log(
    chalk.bgGreen.black(`Course Code Deleted For Course With ID ${courseID}`)
  );

  return Promise.resolve();
};
