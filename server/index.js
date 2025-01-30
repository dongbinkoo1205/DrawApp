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

    // 'signal' 이벤트 처리
    socket.on('signal', (data) => {
        console.log(`신호 데이터 수신 from ${socket.id} -> to ${data.to}`);
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('chat-message', (message) => {
        io.emit('chat-message', message);
    });

    // 화면 공유 시작 이벤트 처리
    socket.on('start-sharing', () => {
        console.log(`${socket.id}가 화면 공유를 시작했습니다.`);
    });

    socket.on('disconnect', () => {
        console.log('사용자 연결 종료:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Signaling 서버가 ${PORT}번 포트에서 실행 중...`);
});
