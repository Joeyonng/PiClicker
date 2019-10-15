const {
  setCodeForCourse,
  deleteCodeForCourse
} = require("../database_functions/course_code_functions");
const { Router } = require("express");

let courseCodeRouter = new Router();

courseCodeRouter.post("/setCodeForCourse", (req, res) => {
  let params = req.body;

  setCodeForCourse(params.courseID, params.courseCode)
    .then(data => {
      res.json({ success: true, ...data });
    })
    .catch(err => res.json({ success: false, err }));
});

courseCodeRouter.post("/deleteCodeForCourse", (req, res) => {
  let params = req.body;

  deleteCodeForCourse(params.courseID)
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));
});

module.exports = courseCodeRouter;
