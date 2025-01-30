const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    path: '/socket.io/', // 경로 설정
});

app.get('/', (req, res) => {
    res.send('Signaling 서버가 정상적으로 작동 중입니다.');
});

io.on('connection', (socket) => {
    console.log('사용자 연결됨:', socket.id);

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('chat-message', (message) => {
        io.emit('chat-message', message);
    });

    socket.on('disconnect', () => {
        console.log('사용자 연결 종료:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Signaling 서버가 ${PORT}번 포트에서 실행 중...`);
});
