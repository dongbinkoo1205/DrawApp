const express = require('express');
const { ExpressPeerServer } = require('peer');
const http = require('http');
const cors = require('cors');
const path = require('path');

// Express 앱 생성
const app = express();
const server = http.createServer(app);

// CORS 설정
app.use(
    cors({
        origin: 'https://drawapp-five.vercel.app', // 허용할 클라이언트 URL
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

// 정적 파일 제공 (React 앱의 build 폴더)
app.use(express.static(path.join(__dirname, '../client/build')));

// PeerJS 서버 설정 및 Express에 통합
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/peerjs',
    allow_discovery: true,
});

app.use('/peerjs', peerServer);

// 기본 경로 응답
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// 기본 오류 처리
app.use((req, res) => {
    res.status(404).send('404: Page not found');
});

peerServer.on('connection', (client) => {
    console.log('Peer connected:', client.id);
});

peerServer.on('disconnect', (client) => {
    console.log('Peer disconnected:', client.id);
});

// 서버 시작
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
