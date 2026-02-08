import WebSocket from 'ws';

const YELLOW_WS_URL = 'wss://clearnet-sandbox.yellow.com/ws';

console.log(`Testing connection to ${YELLOW_WS_URL}...`);

const ws = new WebSocket(YELLOW_WS_URL);

ws.on('open', () => {
    console.log('✅ Connection Opened!');
    // Keep alive for a moment to receive any welcome messages
    setTimeout(() => {
        console.log('Closing connection...');
        ws.close();
        process.exit(0);
    }, 2000);
});

ws.on('message', (data) => {
    console.log('📩 Received Message:', data.toString());
});

ws.on('error', (err) => {
    console.error('❌ Connection Error:', err.message);
    process.exit(1);
});

ws.on('close', () => {
    console.log('Disconnected.');
});
