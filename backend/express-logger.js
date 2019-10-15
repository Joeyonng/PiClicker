const chalk = require("chalk");

const SUPPRESS_REQUEST_LOG = true;

module.exports.logRequest = (req, res, next) => {
  if (!SUPPRESS_REQUEST_LOG) {
    console.log(
      chalk.bgCyan(
        `Request Received At ${req.baseUrl}${req.url} ${
          Object.keys(req.body).length === 0
            ? `Without Data`
            : `With Data ${JSON.stringify(req.body)}`
        }`
      )
    );
  }

  next();
};
