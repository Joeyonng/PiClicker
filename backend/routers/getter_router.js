const {
  getCoursesByInstructorID,
  getSessionsByCourseID,
  getPollsBySessionID,
  getPollStudentsByPollID,
  getActivityInfo
} = require("../database_functions/getter_functions");
const { Router } = require("express");

let getterRouter = new Router();

getterRouter.post("/getCoursesByInstructorID", (req, res) => {
  let params = req.body;

  getCoursesByInstructorID(params.instructorID)
    .then(data => {
      res.json({ success: true, ...data });
    })
    .catch(err => res.json({ success: false, err }));
});

getterRouter.post("/getSessionsByCourseID", (req, res) => {
  let params = req.body;

  getSessionsByCourseID(params.courseID)
    .then(data => {
      res.json({ success: true, ...data });
    })
    .catch(err => res.json({ success: false, err }));
});

getterRouter.post("/getPollsBySessionID", (req, res) => {
  let params = req.body;

  getPollsBySessionID(params.sessionID)
    .then(data => {
      res.json({ success: true, ...data });
    })
    .catch(err => res.json({ success: false, err }));
});

getterRouter.post("/getPollStudentsByPollID", (req, res) => {
  let params = req.body;

  getPollStudentsByPollID(params.pollID)
    .then(data => {
      res.json({ success: true, ...data });
    })
    .catch(err => res.json({ success: false, err }));
});

getterRouter.post("/getActivityInfo", (req, res) => {
  getActivityInfo()
    .then(data => {
      res.json({
        success: true,
        ...data
      });
    })
    .catch(err => res.json({ success: false, err }));
});

module.exports = getterRouter;
