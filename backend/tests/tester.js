const chalk = require("chalk");
const isEmpty = require("../isEmpty");

const SUPPRESS_WARNINGS = true;

if (SUPPRESS_WARNINGS) {
  console.log(chalk.bgRed("WARNINGS SUPPRESSED"));
}

const testForError = async (
  funcToTest,
  params,
  errCode,
  testTitle,
  override = false
) => {
  await funcToTest(params)
    .then(data => {
      return Promise.reject({ code: "ER_UNEXPECTED_SUCCESS", data: data });
    })
    .catch(err => {
      if (err.code === errCode) {
        logSuccess(funcToTest.name, testTitle);
        return;
      }
      if (override) {
        logWarning(
          funcToTest.name,
          testTitle,
          "This Error Has Been Manually Overridden. OVERRIDING SHOULD NOT BE A PERMANENT SOLUTION TO PASSING THE TEST.",
          err
        );
      } else {
        logError(funcToTest.name, testTitle, err);
      }
      return;
    });
};

const testForSuccess = async (
  funcToTest,
  params,
  paramsToCheck,
  testTitle,
  override = false
) => {
  await funcToTest(params)
    .then(data => {
      if (paramsToCheck.length > 0 && isEmpty(data)) {
        return Promise.reject(data);
      }
      if (!matchesProps(data, paramsToCheck)) {
        return Promise.reject(data);
      }
      logSuccess(funcToTest.name, testTitle);
    })
    .catch(err => {
      if (override) {
        logWarning(
          funcToTest.name,
          testTitle,
          "This Error Has Been Manually Overridden Because It Is Not A Problem. OVERRIDING SHOULD NOT BE A PERMANENT SOLUTION TO PASSING THE TEST.",
          err
        );
      } else {
        logError(funcToTest.name, testTitle, err);
      }
    });
};

const matchesProps = (object, props) => {
  for (let i = 0; i < props.length; i++) {
    if (Array.isArray(props[i])) {
      const newProps = props[i];
      const key = newProps.shift();
      if (isEmpty(object[key])) {
        console.log(`Failed At Key: '${key}'`);
        return false;
      }
      if (Array.isArray(object[key]) && object[key].length === 0) {
        console.log(`Empty Array Warning At Key: ${key}`);
        return true;
      }
      if (!matchesProps(object[key][0], newProps)) {
        return false;
      }
    } else {
      if (isEmpty(object[props[i]])) {
        console.log(`Failed At Key: '${props[i]}'`);
        return false;
      }
    }
  }

  return true;
};

const logSuccess = (funcName, testTitle) => {
  console.log(chalk.bgGreen.black(`${funcName} ${testTitle} Test Succeeded.`));
};

const logWarning = (funcName, testTitle, message, error) => {
  if (!SUPPRESS_WARNINGS) {
    console.log(
      chalk.bgYellow.black(
        `${funcName} ${testTitle} Test Warning. Message: ${message} Error Code: ${error.code}`
      )
    );
  }
};

const logError = (funcName, testTitle, dataReceived) => {
  console.log(
    chalk.bgRed.white(
      `${funcName} ${testTitle} Test Failed. Data Received: ${dataReceived}. JSON: ${JSON.stringify(
        dataReceived
      )}`
    )
  );
};

module.exports = {
  testForError,
  testForSuccess,
  OVERRIDE_ERROR: true
};
