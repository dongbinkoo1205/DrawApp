const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS 설정
app.use(
    cors({
        origin: 'https://drawapp-five.vercel.app', // 허용할 프론트엔드 도메인
        methods: ['GET', 'POST'],
        credentials: true, // 인증 정보(Cookies, Authorization)를 허용
    })
);

// Socket.io 서버 설정
const io = new Server(server, {
    cors: {
        origin: 'https://drawapp-five.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['polling', 'websocket'], // 기본 폴백 방식 허용
});

// WebSocket 연결 이벤트
io.on('connection', (socket) => {
    console.log('WebSocket connected:', socket.id);

    // Heartbeat (ping-pong) 설정
    socket.on('ping', () => {
        console.log('Received ping from:', socket.id);
        socket.emit('pong');
    });

    // 연결 종료 이벤트
    socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', socket.id, 'Reason:', reason);
    });

    // 에러 핸들러
    socket.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

// 서버 에러 핸들러
server.on('error', (err) => {
    console.error('Server error:', err);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
