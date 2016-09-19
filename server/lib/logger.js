var winston = require('winston');

var logdir = '/var/log/hereweare';
var logpath = logdir + '/hereweare.log';
var exceptionslogpath = logdir + '/hereweare-exceptions.log';

var console = new (winston.transports.Console)({
	json: false,
	timestamp: true
});
var logfile = new (winston.transports.File)({
	filename: logpath,
	json: false
});
var exceptionsfile = new winston.transports.File({
	filename: exceptionslogpath,
	json: false
});

var loggerProps = {
  transports: [
    //console,
    logfile
  ],
  exceptionHandlers: [
    //console,
    exceptionsfile
  ],
  exitOnError: false
};

var logger = new (winston.Logger)(loggerProps);

module.exports = logger;
