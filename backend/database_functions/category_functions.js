const pool = require("./pool_creator");
const chalk = require("chalk");
const isEmpty = require("../isEmpty");

module.exports.addCategoryToCourse = async (
  courseID,
  categoryName,
  visible = true
) => {
  if (isEmpty(courseID) || isEmpty(categoryName)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  let result = await pool
    .query(
      `INSERT INTO categories (categoryName, courseID, visible) VALUES (?, ?, ?);
       SELECT categoryID FROM categories WHERE categoryName=? AND courseID=?`,
      [categoryName, courseID, visible, categoryName, courseID]
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

  let categoryID = result[0][1][0].categoryID;

  console.log(
    chalk.bgGreen.black(
      `Category With ID ${categoryID} Added For Course With ID ${courseID}`
    )
  );

  return Promise.resolve({ categoryID });
};

module.exports.addOptionToCategory = async (categoryID, optionName) => {
  if (isEmpty(categoryID) || isEmpty(optionName)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  console.log("AAA");

  let result = await pool
    .query(
      `INSERT INTO options (categoryID, optionName) VALUES (?, ?);
       SELECT optionID FROM options WHERE categoryID=? AND optionName=?`,
      [categoryID, optionName, categoryID, optionName]
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

  let optionID = result[0][1][0].optionID;

  console.log(
    chalk.bgGreen.black(
      `Option With ID ${optionID} Added For Category With ID ${categoryID}`
    )
  );

  return Promise.resolve({ optionID });
};

module.exports.editCategory = async (
  categoryID,
  newCategoryName,
  newVisibile = true
) => {
  if (isEmpty(categoryID) || isEmpty(newCategoryName) || isEmpty(newVisibile)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  await pool
    .query(
      `UPDATE categories SET categoryName=?, visible=? WHERE categoryID=?`,
      [newCategoryName, newVisibile, categoryID]
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

  console.log(chalk.bgGreen.black(`Category With ID ${categoryID} Editted `));

  return Promise.resolve();
};

module.exports.editOption = async (optionID, newOptionName) => {
  if (isEmpty(optionID) || isEmpty(newOptionName)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  await pool.query(`UPDATE options SET optionName=? WHERE optionID=?`, [
    newOptionName,
    optionID
  ]);

  console.log(chalk.bgGreen.black(`Option With ID ${optionID} Editted `));

  return Promise.resolve();
};

module.exports.deleteCategory = async categoryID => {
  if (isEmpty(categoryID)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  let response = await pool
    .query(`SELECT optionID FROM options WHERE categoryID=?`, [categoryID])
    .catch(err => Promise.reject(err));

  let options = response[0];
  for (let i = 0; i < options.length; i++) {
    await this.deleteOption(options[i].optionID).catch(err =>
      Promise.reject(err)
    );
  }

  await pool
    .query(`DELETE FROM categories WHERE categoryID=?`, [categoryID])
    .catch(err => Promise.reject(err));

  console.log(chalk.bgGreen.black(`Category Deleted With ID ${categoryID}`));

  return Promise.resolve();
};

module.exports.deleteOption = async optionID => {
  if (isEmpty(optionID)) {
    return Promise.reject({ code: "ER_MISSING_PARAM" });
  }

  await pool
    .query(
      `DELETE FROM student_options WHERE optionID=?;
      DELETE FROM options WHERE optionID=?`,
      [optionID, optionID]
    )
    .catch(err => Promise.reject(err));

  console.log(chalk.bgGreen.black(`Option Deleted With ID ${optionID}`));

  return Promise.resolve();
};
