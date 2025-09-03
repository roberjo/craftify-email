import { WebSocketServer } from 'ws';

export const initializeWebSocket = (wss: WebSocketServer) => {
    console.log('WebSocket server initialized');

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');

        ws.on('message', (message) => {
            console.log('Received:', message);
        });

        ws.on('close', () => {
            console.log('WebSocket connection closed');
        });
    });
}; 