const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // 필요한 경우 도메인으로 제한 가능
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('사용자 연결됨:', socket.id);

    // 시그널 데이터 전송
    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('disconnect', () => {
        console.log('사용자 연결 종료:', socket.id);
    });
});

server.listen(5000, () => {
    console.log('Signaling 서버가 5000번 포트에서 실행 중...');
});
