const {
  createCourse,
  createSession,
  createPoll,
  editCourse,
  deleteCourse,
  deleteSession,
  deletePoll
} = require("../database_functions/main_data_functions");
const { Router } = require("express");

let mainDataRouter = new Router();

mainDataRouter.post("/createCourse", (req, res) => {
  let params = req.body;

  createCourse(
    params.instructorID,
    params.courseName,
    params.quarter,
    params.year,
    params.categories
  )
    .then(data => {
      res.json({ success: true, ...data });
    })
    .catch(err => res.json({ success: false, err }));
});

mainDataRouter.post("/createSession", (req, res) => {
  let params = req.body;

  createSession(params.courseID)
    .then(data => {
      res.json({ success: true, ...data });
    })
    .catch(err => res.json({ success: false, err }));
});

mainDataRouter.post("/createPoll", (req, res) => {
  let params = req.body;

  createPoll(params.sessionID)
    .then(data => {
      res.json({ success: true, ...data });
    })
    .catch(err => res.json({ success: false, err }));
});

mainDataRouter.post("/editCourse", (req, res) => {
  let params = req.body;

  editCourse(
    params.courseID,
    params.newCourseName,
    params.newQuarter,
    params.newYear,
    params.newCategories
  )
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));
});

mainDataRouter.post("/deleteCourse", (req, res) => {
  let params = req.body;

  deleteCourse(params.courseID)
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));
});

mainDataRouter.post("/deleteSession", (req, res) => {
  let params = req.body;

  deleteSession(params.sessionID)
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));
});

mainDataRouter.post("/deletePoll", (req, res) => {
  let params = req.body;

  deletePoll(params.pollID)
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));
});

module.exports = mainDataRouter;
