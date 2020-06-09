const winston = require("winston");
require('winston-mongodb');
const config = require("config");

module.exports = function (err, req, res, next){
    const logger = winston.createLogger({
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ filename: 'error.log' }),
          new winston.transports.MongoDB({db: config.get("DB_URL")})
        ]
    });
    logger.error(err.message, err);
    res.status(500).send("Something Went Wrong ! Try Again...");
}