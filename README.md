# Global Cache iTach Contact Closures

## What is this for?
To control Global Cache iTach Contact Closures via TCP.  

## Usage  
```git clone https://github.com/Controlhaus/global-cache-contact-closures``` 
```cd global-cache-contact-closures``` 
```npm install``` 
```node main.js --ipAddress IpAddressOfYourDevice --port OptionalIpPortOfYourDevice --serviceName OptionalName```

## CLI Commands
The following commands are available from the command line:  
  
```connect``` 
Starts the TCP connection.  
  
```close``` 
Closes the TCP connection.  
  
```openRelay1```  
Opens relay 1 on port 1.  
  
```closeRelay1```  
Closes relay 1 on port 1.  
  
```getRelay1```  
Get the state of relay 1 on port 1.  
  
```openRelay2```  
```closeRelay2```  
```getRelay2```  
```openRelay3```  
```closeRelay3```  
```getRelay3```  
```send: MessageToSend```  
Sends ```MessageToSend```directly to the TCP socket.  

## CLI Responses  
See global-cache-contact-closures.json for a list of responses.   