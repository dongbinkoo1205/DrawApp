const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*', // 🔹 모든 도메인에서 접근 허용 (보안이 필요하면 특정 도메인만)
        methods: ['GET', 'POST'],
    },
});

app.use(cors());

// WebSocket 이벤트 처리
io.on('connection', (socket) => {
    console.log(`🔗 클라이언트 연결됨: ${socket.id}`);

    socket.on('chatMessage', (message) => {
        console.log(`📩 메시지 수신: ${message}`);
        io.emit('chatMessage', message); // 모든 사용자에게 메시지 전송
    });

    socket.on('offer', (offer) => {
        console.log(`📡 WebRTC Offer 수신`);
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        console.log(`📡 WebRTC Answer 수신`);
        socket.broadcast.emit('answer', answer);
    });

    socket.on('candidate', (candidate) => {
        console.log(`📡 ICE Candidate 수신`);
        socket.broadcast.emit('candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log(`❌ 클라이언트 연결 종료: ${socket.id}`);
    });
});

// 서버 실행
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: 포트 ${PORT}`);
});
