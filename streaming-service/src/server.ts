import net from 'net';
import { WebSocket, WebSocketServer } from 'ws';

import * as fs from 'fs';
import { privateEncrypt } from 'crypto';

const TCP_PORT = parseInt(process.env.TCP_PORT || '12000', 10);

const tcpServer = net.createServer();
const websocketServer = new WebSocketServer({ port: 8080 });

tcpServer.on('connection', (socket) => {
    console.log('TCP client connected');

    // Creating a list of numbers to contain all the received temperature values from the past 5 minutes
    let tempValueList: number[] = [];
    
    socket.on('data', (msg) => {
        
        //Attempt to parse received data and perform relevant actions 
        try {
            // Receiving msg
            let currJSON = JSON.parse(msg.toString());
            console.log(msg.toString());
            console.log(currJSON.battery_temperature);

            // Add to list
            tempValueList.push(currJSON.battery_temperature);
            console.log(tempValueList);

            // If the number of samples in last 5 seconds exceeds 3 then write to incidents.log
            if (tempValueList.filter((temp) => temp < 20 || temp > 80).length >= 3) {
                
                console.log("printing to file: ", currJSON.timestamp);
                fs.writeFile('incidents.log', currJSON.timestamp.toString().concat('\n'), {flag:'a'}, (err) => {});

                // Clear sample list after
                tempValueList = [];
            }


        } 
        // Push safe value to list if parsing error
        catch (error) {
            console.log(error);
            tempValueList.push(40);
        }

        // Pop off front of list if too big
        if (tempValueList.length >= 10) tempValueList.shift();
        
        websocketServer.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(msg.toString());
            }
          });
    });

    socket.on('end', () => {
        console.log('Closing connection with the TCP client');
    });
    
    socket.on('error', (err) => {
        console.log('TCP client error: ', err);
    });
});

websocketServer.on('listening', () => console.log('Websocket server started'));

websocketServer.on('connection', async (ws: WebSocket) => {
    console.log('Frontend websocket client connected to websocket server');
    ws.on('error', console.error);  
});

tcpServer.listen(TCP_PORT, () => {
    console.log(`TCP server listening on port ${TCP_PORT}`);
});


