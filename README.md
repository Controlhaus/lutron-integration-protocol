# Lutron Integration Protocol
Create and login to the telnet connection to use with the [Lutron Integration Protocol](http://www.lutron.com/TechnicalDocumentLibrary/040249.pdf).  

## Usage  
```git clone https://github.com/Controlhaus/lutron-integration-protocol.git```   
```cd lutron-integration-protocol```  
```npm install```  
```node main.js --ipAddress TheLutronIpAddress --login test --password test```

### Start Parameters
- ```serviceName``` A prefix for log messages. Default: ```Lutron```
- ```ipAddress``` The host address or url to connect to.
- ```port``` The telnet port to connect to. Default: ```23```
- ```login``` The username. Default: ```lutron```
- ```password``` The password. Default: ```integration```
- ```heartbeatInterval``` The interval between sending heartbeat messages in milliseconds. The heartbeat is used to detect unexpected disconnects and automatically reconnect. Default: ```10000```

## CLI Commands
The following commands are available from the command line:  
- ```connect``` Starts the telnet connection. Called by default at startup.    
- ```close``` Closes the telnet connection.  
- ```MessageToSend``` Sends ```MessageToSend``` appended with a carriage return directly to the socket.  

## Lutron Integration Protocol  
See [the Lutron documentation](http://www.lutron.com/TechnicalDocumentLibrary/040249.pdf) for the complete protocol.   