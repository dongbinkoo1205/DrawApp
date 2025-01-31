const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS 설정
app.use(
    cors({
        origin: 'https://drawapp-five.vercel.app', // 프론트엔드 도메인 허용
        methods: ['GET', 'POST'],
    })
);

// Socket.io 서버 설정
const io = new Server(server, {
    cors: {
        origin: 'https://drawapp-five.vercel.app',
        methods: ['GET', 'POST'],
    },
    transports: ['websocket'], // WebSocket 전용 전송 방식 설정 (optional)
});

io.on('connection', (socket) => {
    console.log('WebSocket connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('WebSocket disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
