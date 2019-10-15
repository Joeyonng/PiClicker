const { resetDatabase } = require("../database_functions/reset_database");
const { Router } = require("express");

let resetDatabaseRouter = new Router();

resetDatabaseRouter.post("/resetDatabase", (req, res) => {
  resetDatabase()
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));
});

module.exports = resetDatabaseRouter;
