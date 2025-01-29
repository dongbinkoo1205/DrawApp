const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // 프론트엔드와 연결
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('사용자 연결됨:', socket.id);

    socket.on('chatMessage', (message) => {
        console.log(`메시지 수신: ${message}`);
        io.emit('chatMessage', message); // 모든 클라이언트에게 메시지 전송
    });

    socket.on('disconnect', () => {
        console.log('사용자 연결 종료:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
