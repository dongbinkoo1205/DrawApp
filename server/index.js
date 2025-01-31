const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Express 앱 생성
const app = express();
const server = http.createServer(app);

// CORS 설정
app.use(
    cors({
        origin: 'https://drawapp-five.vercel.app', // 허용할 클라이언트 도메인
        methods: ['GET', 'POST'], // 허용할 HTTP 메서드
        credentials: true, // 인증 정보(Cookie, Authorization) 허용
    })
);

// Socket.io 설정
const io = new Server(server, {
    cors: {
        origin: 'https://drawapp-five.vercel.app', // CORS 설정을 Socket.io에도 적용
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Socket.io 이벤트 처리
io.on('connection', (socket) => {
    console.log('WebSocket connected:', socket.id);

    socket.on('start-broadcast', () => {
        console.log('Broadcast started by:', socket.id);
        socket.broadcast.emit('broadcaster', socket.id);
    });

    socket.on('offer', (data) => {
        console.log(`Received offer from ${socket.id} to ${data.target}`);
        socket.to(data.target).emit('offer', { sender: socket.id, offer: data.offer });
    });

    socket.on('answer', (data) => {
        console.log(`Received answer from ${socket.id} to ${data.target}`);
        socket.to(data.target).emit('answer', { sender: socket.id, answer: data.answer });
    });

    socket.on('ice-candidate', (data) => {
        console.log(`Received ICE candidate from ${socket.id} to ${data.target}`);
        socket.to(data.target).emit('ice-candidate', { candidate: data.candidate });
    });

    socket.on('disconnect', () => {
        console.log('WebSocket disconnected:', socket.id);
    });
});

// 서버 포트 설정 및 시작
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
