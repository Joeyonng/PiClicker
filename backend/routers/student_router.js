const {
  getCurrentBackgroundColor
} = require("../database_functions/background_functions");

const {
  enterStudentCourseCode,
  setStudentOption,
  setStudentVote
} = require("../database_functions/student_functions");
const { Router } = require("express");

let studentRouter = new Router();

studentRouter.post("/enterStudentCourseCode", (req, res) => {
  let params = req.body;

  enterStudentCourseCode(params.studentID, params.courseCode)
    .then(data => {
      res.json({ success: true, ...data });
    })
    .catch(err => res.json({ success: false, err }));
});

studentRouter.post("/setStudentOption", (req, res) => {
  let params = req.body;

  setStudentOption(params.studentID, params.optionID)
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));
});

studentRouter.post("/setStudentVote", (req, res) => {
  let params = req.body;

  setStudentVote(params.studentID, params.vote)
    .then(() => {
      let backgroundColor = getCurrentBackgroundColor();
      res.json({ success: true, backgroundColor });
    })
    .catch(err => res.json({ success: false, err }));
});

module.exports = studentRouter;
