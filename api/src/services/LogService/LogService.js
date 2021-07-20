const ApexLogsTransport = require("apex-logs-winston");
const winston = require("winston");
const {
  APEX_LOGS_URL,
  APEX_LOGS_AUTH_TOKEN,
  APEX_LOGS_PROJECT_ID,
} = require("../../config/constants");

const apex = new ApexLogsTransport({
  url: APEX_LOGS_URL,
  authToken: APEX_LOGS_AUTH_TOKEN,
  projectId: APEX_LOGS_PROJECT_ID,
});

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [apex],
  defaultMeta: { program: "api", host: "api-01" },
});

module.exports.LogService = logger;
