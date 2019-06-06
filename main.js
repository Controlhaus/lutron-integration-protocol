const argv = require('yargs').argv;
const repl = require('repl');
const Telnet = require('telnet-client')

var serviceName = argv.serviceName || 'Lutron';
var ipAddress = argv.ipAddress;
var port = argv.port || 23;
var login = argv.login || 'lutron';
var password = argv.password || 'integration';
var heartbeatInterval = argv.heartbeatInterval || 10000;
var client;
var heartbeat;
var reconnectTimeout;
var doNotReconnect;
var retrying;

/* Startup */

connect();

/* Command Line Interface */

repl.start({ prompt: '> ', eval: evaulateCliCommands });
function evaulateCliCommands(command, context, filename, callback) {
  processCommand(command);
  callback(null, 'OK');
}

function log(message) {
  console.log(serviceName + ': ' + message);
}

/* Catch Connect Client Messages */

process.on("message", (data) => {
  processCommand(data);
});

function sendResponse(response) {
  log(response);
  //process.send() only exists if the app is started as a child process
  if (typeof process.send === 'function') {
    process.send(response);
  }
}

/* Create Device Commands */

function processCommand(command) {
  switch (command) {
    case 'connect\n':
      connect();
      break;
    case 'close\n':
      close();
      break;
    default:
      sendToSocket(command);
      break;
  }
}

/* Parse Device Responses */

function parseResponse(response) {
  log('Parsing response ' + response);
  isAlive = true;
  if (response != 'QNET> ') {
    sendResponse(response);
  }
}

/* Socket Functions */

async function sendToSocket(message) {
  if (client) {
    log('Sending to socket: ' + message);
    client.send(message + '\r', (error, data) => {
      // if (error) {
      //   log("sendToSocket result error: ", error)
      // }
      // if (data) {
      //   log("sendToSocket result data: ", data)
      // }
    });
  } else {
    log('Cannot send to undefined socket.');
  }
}

async function connect() {
  client = new Telnet();
  if (port && ipAddress) {
    log('Connecting with ip address: ' + ipAddress + ' and port: ' + port + ' and login: ' + login);
    var options = {
      debug: true,
      host: ipAddress,
      port: port,
      negotiationMandatory: true,
      timeout: 0,
      loginPrompt: 'login: ',
      passwordPrompt: 'password: ',
      username: login + '\r',
      password: password + '\r',
      shellPrompt: 'QNET>',
    };
    client.connect(options).catch((err) => {
      errorEventHandler(err);
    });

    client.on('failedlogin', function () {
      failedLoginEventHandler();
    });

    client.on('connect', function () {
      log('logging in');
    });

    client.on('ready', function () {
      log('logged in');
      connectEventHandler();
    });

    client.on('data', data => {
      parseResponse(data);
    });

    client.on('timeout', function () {
      timeoutEventHandler();
    });

    client.on('close', function () {
      closeEventHandler();
    });

  } else {
    log('Cannot connect with ip address: ' + ipAddress + ' and port: ' + port);
  }
}

function close() {
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
  sendResponse('catch-service-connected');
  retrying = false;
  clearInterval(reconnectTimeout);
  startHearbeat();
}

function startHearbeat() {
  isAlive = true;
  heartbeat = setInterval(checkHeartbeat, heartbeatInterval);
}

function checkHeartbeat() {
  if (isAlive === true) {
    isAlive = false;
    sendToSocket('gettime');
    return;
  }
  log('Heartbeat timed out.');
  doNotReconnect = false;
  client.destroy();
}

function failedLoginEventHandler() {
  sendResponse('catch-service-login-failed');
  log('Failed Login.');
  doNotReconnect = true;
  client.destroy();
}

function timeoutEventHandler() {
  log('Socket timeout event.');
  doNotReconnect = false;
  client.destroy();
}

function errorEventHandler(err) {
  log('Socket error: ' + err);
  doNotReconnect = false;
  client.destroy();
}

function closeEventHandler() {
  if (heartbeat) {
    clearInterval(heartbeat);
  }
  if (reconnectTimeout) {
    clearInterval(reconnectTimeout);
  }
  sendResponse('catch-service-disconnected');
  log('Socket closed.');
  if (!retrying && !doNotReconnect) {
    retrying = true;
    log('Reconnecting...');
  }
  if (!doNotReconnect) {
    reconnectTimeout = setTimeout(connect.bind(this), 10000);
  }
}