const {
  activateSession,
  activatePoll,
  deactivateSession,
  deactivatePoll
} = require("../database_functions/activity_changer_functions");
const { Router } = require("express");

let activityChangerRouter = new Router();

activityChangerRouter.post("/activateSession", (req, res) => {
  let params = req.body;

  activateSession(params.sessionID)
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));
});

activityChangerRouter.post("/deactivateSession", (req, res) => {
  deactivateSession()
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));
});

activityChangerRouter.post("/activatePoll", (req, res) => {
  let params = req.body;

  activatePoll(params.pollID)
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));
});

activityChangerRouter.post("/deactivatePoll", (req, res) => {
  deactivatePoll()
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));
});

module.exports = activityChangerRouter;
