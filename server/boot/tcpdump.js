
//var pcap = require('./node_pcap/build/Release/pcap_binding');
//var pcap = require('node_pcap/build/Release/pcap_binding');

var logger = require('./../lib/logger');
logger.info('process: ' +
  JSON.stringify(process.env, null, '\t'));
//var pcap = require(process.env.NODE_PATH +
//  '/node_pcap/build/Release/pcap_binding');
var pcap = require('/home/federico/Documents/ehour/projects/node_pcap/build/Release/pcap_binding');

var tcp_tracker = new pcap.TCPTracker();
var pcap_session = pcap.createSession('en0', "ip proto \\tcp");

module.exports = function(app) {

  tcp_tracker.on('session', function (session) {
    logger.info("Start of session between " +
      session.src_name + " and " + session.dst_name);
    session.on('end', function (session) {
        logger.info("End of TCP session between " +
        session.src_name + " and " + session.dst_name);
    });
  });

  pcap_session.on('packet', function (raw_packet) {
    var packet = pcap.decode.packet(raw_packet);
    tcp_tracker.track_packet(packet);
  });

};
