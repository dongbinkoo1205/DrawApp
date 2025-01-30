const express = require('express');
const { ExpressPeerServer } = require('peer');
const http = require('http');

const app = express();
const server = http.createServer(app);

// PeerJS 서버 설정
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/peerjs',
});

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.send('PeerJS Server is running...');
});

// 서버 실행
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
