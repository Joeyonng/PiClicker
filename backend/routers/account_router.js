const {
  createStudentAccount,
  createInstructorAccount,
  login,
  editAccountCredentials
} = require("../database_functions/account_functions");
const { Router } = require("express");

let accountRouter = new Router();

accountRouter.post("/createStudentAccount", (req, res) => {
  let params = req.body;

  createStudentAccount(
    params.username,
    params.password,
    params.PID,
    params.fname,
    params.lname
  )
    .then(data => {
      res.json({ success: true, ...data });
    })
    .catch(err => res.json({ success: false, err }));
});

accountRouter.post("/createInstructorAccount", (req, res) => {
  let params = req.body;

  createInstructorAccount(
    params.username,
    params.password,
    params.prefix,
    params.fname,
    params.lname
  )
    .then(data => {
      res.json({ success: true, ...data });
    })
    .catch(err => res.json({ success: false, err }));
});

accountRouter.post("/login", (req, res) => {
  let params = req.body;

  login(params.username, params.password)
    .then(data => {
      res.json({ success: true, ...data });
    })
    .catch(err => res.json({ success: false, err }));
});

accountRouter.post("/editAccountCredentials", (req, res) => {
  let params = req.body;

  editAccountCredentials(params.userID, params.newUsername, params.newPassword)
    .then(data => {
      res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));
});

module.exports = accountRouter;
