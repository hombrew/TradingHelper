const alertsFile = require("./alerts");
const authFile = require("./auth");
const navigationFile = require("./navigation");

module.exports = {
  ...alertsFile,
  ...authFile,
  ...navigationFile,
};
