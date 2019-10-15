module.exports = function(variable) {
  if (Array.isArray(variable)) {
    return false;
  }
  if (
    variable === undefined ||
    variable === null ||
    !(variable.toString().length > 0)
  ) {
    return true;
  }
  return false;
};
