import WebSocket from 'ws';

const YELLOW_WS_URL = 'wss://clearnet-sandbox.yellow.com/ws';

console.log(`Testing connection to ${YELLOW_WS_URL}...`);

const ws = new WebSocket(YELLOW_WS_URL);

ws.on('open', () => {
    console.log('✅ Connection Opened!');

    // Send a garbage JSON to trigger a response (expecting an error)
    const payload = JSON.stringify({ jsonrpc: "2.0", method: "ping", id: 1 });
    console.log(`📤 Sending: ${payload}`);
    ws.send(payload);

    // Keep alive
    setTimeout(() => {
        console.log('Timeout reached. closing...');
        ws.close();
        process.exit(0);
    }, 5000);
});

ws.on('message', (data) => {
    console.log('📩 Received Message:', data.toString());
});

ws.on('error', (err) => {
    console.error('❌ Connection Error:', err.message);
    process.exit(1);
});

ws.on('close', (code, reason) => {
    console.log(`Disconnected. Code: ${code}, Reason: ${reason}`);
});
