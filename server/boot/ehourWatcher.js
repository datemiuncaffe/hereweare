var MySQLEvents = require('mysql-events');
var logger = require('./../lib/logger');

var conProps = {
  host : '192.168.88.158',
  user : 'centos',
  password : ''
};

module.exports = function(app) {
  logger.info("event");
  var eventWatcher = MySQLEvents(conProps);

  var watcher = eventWatcher.add(
    //'ehour.table.field.value',
    'ehour',
    function (oldRow, newRow) {
      logger.info("ehour event ...");
       //row inserted
      if (oldRow === null) {
        //insert code goes here
      }

       //row deleted
      if (newRow === null) {
        //delete code goes here
      }

       //row updated
      if (oldRow !== null && newRow !== null) {
        //update code goes here
      }
    }
    //'match this string or regex'
  );

  logger.info("event: ");
};
