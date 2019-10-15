const pool = require("./pool_creator");
const bcrypt = require("bcrypt");
const chalk = require("chalk");
const isEmpty = require("../isEmpty");

module.exports.createStudentAccount = async (
  username,
  password,
  PID = null,
  fname = null,
  lname = null
) => {
  if (isEmpty(username) || isEmpty(password)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  console.log(PID, fname, lname);

  let hashed_password = await bcrypt
    .hash(password, 5)
    .catch(err => Promise.reject(err));

  let response = await pool
    .query(
      `INSERT INTO users (username, password, userType) VALUES (?, ?, 'student');
       SELECT @studentID := userID AS studentID FROM users WHERE username=?;
       INSERT INTO students (studentID, PID, fname, lname) VALUES (@studentID, ?, ?, ?)`,
      [username, hashed_password, username, PID, fname, lname]
    )
    .catch(err => {
      if (err.code === "ER_DUP_ENTRY") {
        return Promise.reject({ code: "ER_ENTRY_EXISTS" });
      }
      return Promise.reject(err);
    });

  let studentID = response[0][1][0].studentID;

  console.log(
    chalk.bgGreen.black(`Student Account Created With ID ${studentID}`)
  );

  return Promise.resolve({ userID: studentID, username });
};

module.exports.createInstructorAccount = async (
  username,
  password,
  prefix = null,
  fname = null,
  lname = null
) => {
  if (isEmpty(username) || isEmpty(password)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }
  let hashed_password = await bcrypt
    .hash(password, 5)
    .catch(err => Promise.reject(err));

  let response = await pool
    .query(
      `INSERT INTO users (username, password, userType) VALUES (?, ?, 'instructor');
       SELECT @instructorID := userID AS instructorID FROM users WHERE username=?;
       INSERT INTO instructors (instructorID, prefix, fname, lname) VALUES (@instructorID, ?, ?, ?);`,
      [username, hashed_password, username, prefix, fname, lname]
    )
    .catch(err => {
      if (err.code === "ER_DUP_ENTRY") {
        return Promise.reject({ code: "ER_ENTRY_EXISTS" });
      }
      return Promise.reject(err);
    });

  let instructorID = response[0][1][0].instructorID;

  console.log(
    chalk.bgGreen.black(`Instructor Account Created With ID ${instructorID}`)
  );

  return Promise.resolve({ userID: instructorID, username });
};

module.exports.login = async (username, password) => {
  let response = await pool
    .query(
      `SELECT userID, userType, username, password FROM users WHERE username=?`,
      [username]
    )
    .catch(err => Promise.reject(err));

  let user = response[0][0];

  let usernameExists = user !== undefined;

  if (!usernameExists) {
    return Promise.reject({ code: "ER_INVALID_USERNAME" });
  }

  let passwordMatches = await bcrypt
    .compare(password, user.password)
    .catch(err => Promise.reject(err));

  if (!passwordMatches) {
    return Promise.reject({ code: "ER_INVALID_PASSWORD" });
  }

  let details;

  if (user.userType === "instructor") {
    response = await pool.query(
      `SELECT prefix, fname, lname FROM instructors WHERE instructorID=?`,
      [user.userID]
    );

    details = response[0][0];
  }
  if (user.userType === "student") {
    response = await pool.query(
      `SELECT PID, fname, lname FROM students WHERE studentID=?`,
      [user.userID]
    );

    details = response[0][0];
  }

  user = Object.assign({}, user, details);
  delete user.password;

  console.log(
    chalk.bgGreen.black(
      `${
        user.userType === "instructor" ? "Instructor" : "Student"
      } Logged In With ID ${user.userID}`
    )
  );

  return Promise.resolve(user);
};

module.exports.editAccountCredentials = async (
  userID,
  newUsername = null,
  newPassword = null
) => {
  if (isEmpty(userID) || (isEmpty(newUsername) && isEmpty(newPassword))) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  let query = `UPDATE users SET`;
  let queryParams = [];
  if (newUsername !== null) {
    query += ` username=?${!isEmpty(newPassword) ? `,` : ""}`;
    queryParams.push(newUsername);
  }
  if (newPassword !== null) {
    query += ` password=?`;

    let hashedNewPassword = await bcrypt
      .hash(newPassword, 5)
      .catch(err => Promise.reject(err));

    queryParams.push(hashedNewPassword);
  }
  query += ` WHERE userID=${userID}`;

  await pool.query(query, queryParams).catch(err => {
    if (err.code === "ER_DUP_ENTRY") {
      return Promise.reject({ code: "ER_ENTRY_EXISTS" });
    }
    return Promise.reject(err);
  });

  console.log(
    chalk.bgGreen.black(`Account Credentials Edited With ID ${userID}`)
  );

  return Promise.resolve();
};
