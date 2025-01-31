const express = require('express');
const { ExpressPeerServer } = require('peer');
const http = require('http');
const cors = require('cors');

// Express 앱 생성
const app = express();
const server = http.createServer(app);

// CORS 설정
app.use(
    cors({
        origin: 'https://drawapp-five.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

// PeerJS 서버 설정 및 Express에 통합
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/',
    allow_discovery: true,
});

app.use('/peerjs', peerServer);

peerServer.on('connection', (client) => {
    console.log('Peer connected:', client.id);
});

peerServer.on('disconnect', (client) => {
    console.log('Peer disconnected:', client.id);
});

// 서버 시작
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
