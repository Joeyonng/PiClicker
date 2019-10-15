const chalk = require("chalk");
const { database } = require("../creds");
const { createInstructorAccount } = require("./account_functions");
const mysql = require("mysql2/promise");

module.exports.resetDatabase = async () => {
  let conn = await mysql.createConnection({
    host: "localhost",
    user: "remote",
    password: "qwerty",
    multipleStatements: true
  });

  let defaultAdminID = "a";
  let defaultAdminPass = "a";

  await conn
    .query(
      `DROP DATABASE IF EXISTS ${database};
       CREATE DATABASE ${database};
       USE ${database};
       CREATE TABLE users (userID INT NOT NULL AUTO_INCREMENT, username VARCHAR(32) NOT NULL UNIQUE, password CHAR(60) NOT NULL, userType VARCHAR(10), PRIMARY KEY (userID));
       CREATE TABLE instructors (instructorID INT NOT NULL, prefix VARCHAR(6), fname VARCHAR(30), lname VARCHAR(30), PRIMARY KEY(instructorID), FOREIGN KEY (instructorID) REFERENCES users(userID));
       CREATE TABLE students (studentID INT NOT NULL, PID VARCHAR(9), fname VARCHAR(30), lname VARCHAR(30), PRIMARY KEY(studentID), FOREIGN KEY (studentID) REFERENCES users(userID));
       CREATE TABLE courses (courseID INT NOT NULL AUTO_INCREMENT, courseName VARCHAR(20) NOT NULL, quarter CHAR(2) NOT NULL, year SMALLINT NOT NULL, instructorID INT NOT NULL, PRIMARY KEY (courseID), UNIQUE unique_course (courseName, quarter, year, instructorID), FOREIGN KEY (instructorID) REFERENCES instructors(instructorID));
       CREATE TABLE sessions (sessionID INT NOT NULL AUTO_INCREMENT, startTime BIGINT NOT NULL, courseID INT NOT NULL, PRIMARY KEY (sessionID), FOREIGN KEY (courseID) REFERENCES courses(courseID));
       CREATE TABLE polls (pollID INT NOT NULL AUTO_INCREMENT, startTime BIGINT NOT NULL, sessionID INT NOT NULL, PRIMARY KEY (pollID), FOREIGN KEY (sessionID) REFERENCES sessions(sessionID));
       CREATE TABLE course_codes (courseID INT NOT NULL UNIQUE, courseCode CHAR(5) NOT NULL UNIQUE, PRIMARY KEY (courseID), FOREIGN KEY (courseID) REFERENCES courses(courseID));
       CREATE TABLE student_codes (_id INT NOT NULL AUTO_INCREMENT, studentID INT NOT NULL, courseID INT NOT NULL, PRIMARY KEY (_id), FOREIGN KEY (studentID) REFERENCES students(studentID), FOREIGN KEY (courseID) REFERENCES courses(courseID), UNIQUE unique_student_course (studentID, courseID));
       CREATE TABLE categories (categoryID INT NOT NULL AUTO_INCREMENT, categoryName VARCHAR(32), courseID INT NOT NULL, visible BOOLEAN NOT NULL DEFAULT TRUE, PRIMARY KEY (categoryID), FOREIGN KEY (courseID) REFERENCES courses(courseID), UNIQUE unique_course_category (categoryName, courseID));
       CREATE TABLE options (optionID INT NOT NULL AUTO_INCREMENT, categoryID INT NOT NULL, optionName VARCHAR(32) NOT NULL, PRIMARY KEY (optionID), FOREIGN KEY (categoryID) REFERENCES categories(categoryID), UNIQUE unique_category_option (categoryID, optionName));
       CREATE TABLE student_options (_id INT NOT NULL AUTO_INCREMENT, studentID INT NOT NULL, categoryID INT NOT NULL, optionID INT NOT NULL, PRIMARY KEY (_id), FOREIGN KEY (studentID) REFERENCES students(studentID), FOREIGN KEY (categoryID) REFERENCES categories(categoryID), FOREIGN KEY (optionID) REFERENCES options(optionID), UNIQUE unique_student_category (studentID, categoryID));
       CREATE TABLE poll_votes (_id INT NOT NULL AUTO_INCREMENT, studentID INT NOT NULL, pollID INT NOT NULL, vote CHAR(1) NOT NULL, PRIMARY KEY (_id), FOREIGN KEY (studentID) REFERENCES students(studentID), FOREIGN KEY (pollID) REFERENCES polls(pollID), UNIQUE unique_poll_vote (studentID, pollID));
       CREATE TABLE active_session (sessionID INT NOT NULL, active BOOL DEFAULT TRUE, FOREIGN KEY (sessionID) REFERENCES sessions(sessionID));
       CREATE TABLE active_poll (pollID INT NOT NULL, sessionID INT NOT NULL, active BOOL DEFAULT TRUE, FOREIGN KEY (pollID) REFERENCES polls(pollID), FOREIGN KEY (sessionID) REFERENCES active_session(sessionID));`
    )
    .catch(err => Promise.reject(err));

  await createInstructorAccount(defaultAdminID, defaultAdminPass).catch(err =>
    Promise.reject(err)
  );

  console.log(chalk.bgGreen.black("Database Reset"));
  return Promise.resolve();
};
