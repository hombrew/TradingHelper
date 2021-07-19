const ApexLogsTransport = require("apex-logs-winston");
const winston = require("winston");
const {
  APEX_LOGS_URL,
  APEX_LOGS_AUTH_TOKEN,
  APEX_LOGS_PROJECT_ID,
} = require("../../config/constants");

class LogService {
  constructor(url, authToken, projectId) {
    const apex = new ApexLogsTransport({
      url,
      authToken,
      projectId,
    });

    const logger = winston.createLogger({
      levels: winston.config.syslog.levels,
      transports: [apex],
      defaultMeta: { program: "api", host: "api-01" },
    });

    Object.assign(this, logger);
  }
}

module.exports.LogService = new LogService(
  APEX_LOGS_URL,
  APEX_LOGS_AUTH_TOKEN,
  APEX_LOGS_PROJECT_ID
);
