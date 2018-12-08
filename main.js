const argv = require('yargs').argv;
const repl = require('repl');
const net = require('net');

var serviceName = argv.serviceName;
var ipAddress = argv.ipAddress;
var port = argv.port || 4998;
var relayPort = argv.relayPort || '1';
var client;
var reconnectTimeout;
var doNotReconnect;
var retrying;

/* Command Line Interface */

repl.start({ prompt: '> ', eval: evaulateCliCommands });
function evaulateCliCommands(command, context, filename, callback) {
  send(command);
  callback(null, 'OK');
}

function log(message) {
  console.log(serviceName + ': ' + message);
}

/* Create Device Commands */

function send(command) {
  switch (command) {
    case 'connect\n':
      connect();
      break;
    case 'close\n':
      close();
      break;
    case 'openRelay1\n':
      sendToSocket('setstate,' + relayPort + ':1,0\r');
      break;
    case 'closeRelay1\n':
      sendToSocket('setstate,' + relayPort + ':1,1\r');
      break;
    case 'getRelay1\n':
      sendToSocket('getstate,' + relayPort + ':1\r');
      break;
    case 'openRelay2\n':
      sendToSocket('setstate,' + relayPort + ':2,0\r');
      break;
    case 'closeRelay2\n':
      sendToSocket('setstate,' + relayPort + ':2,1\r');
      break;
    case 'getRelay2\n':
      sendToSocket('getstate,' + relayPort + ':2\r');
      break;
    case 'openRelay3\n':
      sendToSocket('setstate,' + relayPort + ':3,0\r');
      break;
    case 'closeRelay3\n':
      sendToSocket('setstate,' + relayPort + ':3,1\r');
      break;
    case 'getRelay3\n':
      sendToSocket('getstate,' + relayPort + ':3\r');
      break;
    default:
      if (command.indexOf('send: ') == 0) {
        const msg = command.substring(6);
        sendToSocket(msg);
        break;
      }
      log('Command not found for: ' + command);
      break;
  }
}

/* Parse Device Responses */

function parseResponse(response) {
  if (response.indexOf('state,' + relayPort + ':') != -1) {
    const responseArray = response.split(',');
    if (responseArray.length == 3) {
      const portSlot = responseArray[1].split(':');
      if (portSlot.length == 2) {
        const slot = 'relay' + portSlot[1];
        var value = false;
        if (responseArray[2] == '1') {
          value = true;
        }
        /*var result;
        result[slot] = value;
        return result;*/
      }
    }
  }
  if (response.indexOf('err,' + relayPort + ':') != -1) {
    /*var result;
    result['error'] = value;
    return result;*/
  }
}

/* Socket Functions */

function sendToSocket(message) {
  if (client) {
    log('Sending to socket: ' + message);
    client.write(message);
  } else {
    log('Cannot send to undefined socket.');
  }
}

function connect() {
  if (port && ipAddress) {
    log('Connecting with ip address: ' + ipAddress + ' and port: ' + port);
    client = new net.Socket();
    client.connect(port, ipAddress);

    client.on('data', (data) => {
      const msg = data.toString();
      parseResponse(msg);
      log('Received from socket: ' + msg);
    });

    client.on('connect', connectEventHandler.bind(this));
    client.on('end', endEventHandler.bind(this));
    client.on('timeout', timeoutEventHandler.bind(this));
    client.on('drain', drainEventHandler.bind(this));
    client.on('error', errorEventHandler.bind(this));
    client.on('close', closeEventHandler.bind(this));
  } else {
    log('Cannot connect with ip address: ' + ipAddress + ' and port: ' + port);
  }
}

function close() {
/*result['connected'] = false;
return result;*/

  if (client) {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    doNotReconnect = true;
    client.end();
  } else {
    log('Cannot close. Socket undefined. ');
  }
}

/* Socket Event Handlers */

function connectEventHandler() {
  log('Socket connected.');
  /*result['connected'] = true;
return result;*/
  retrying = false;
  client.setKeepAlive(true);
}

function endEventHandler() {
  log('Socket end event.');
}

function timeoutEventHandler() {
  /*result['connected'] = false;
return result;*/
  log('Socket timeout event.');
}

function drainEventHandler() {
  log('Socket drain event.');
}

function errorEventHandler(err) {
  /*result['socketError'] = err;
return result;*/
  log('Socket error: ' + err);
}

function closeEventHandler() {
    /*result['connected'] = false;
return result;*/
  log('Socket closed.');
  if (!retrying && !doNotReconnect) {
    retrying = true;
    log('Reconnecting...');
  }
  if (!doNotReconnect) {
    reconnectTimeout = setTimeout(connect.bind(this), 10000);
  }
}