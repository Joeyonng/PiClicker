const {
  addCategoryToCourse,
  addOptionToCategory,
  deleteCategory,
  deleteOption
} = require("../database_functions/category_functions");
const { Router } = require("express");

let courseCategoryRouter = new Router();

// courseCategoryRouter.post("/addCategoryToCourse", (req, res) => {
//   let params = req.body;

//   addCategoryToCourse(params.courseID, params.categoryName)
//     .then(data => {
//       res.json({ success: true, ...data });
//     })
//     .catch(err => res.json({ success: false, err }));
// });

// courseCategoryRouter.post("/addOptionToCategory", (req, res) => {
//   let params = req.body;

//   addOptionToCategory(params.categoryID, params.optionName)
//     .then(data => {
//       res.json({ success: true, ...data });
//     })
//     .catch(err => res.json({ success: false, err }));
// });

// courseCategoryRouter.post("/deleteCategory", (req, res) => {
//   let params = req.body;

//   deleteCategory(params.categoryID)
//     .then(() => {
//       res.json({ success: true });
//     })
//     .catch(err => res.json({ success: false, err }));
// });

// courseCategoryRouter.post("/deleteOption", (req, res) => {
//   let params = req.body;

//   deleteOption(params.optionID)
//     .then(() => {
//       res.json({ success: true });
//     })
//     .catch(err => res.json({ success: false, err }));
// });

module.exports = courseCategoryRouter;
