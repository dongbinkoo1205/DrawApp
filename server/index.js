const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(
    cors({
        origin: 'https://drawapp-five.vercel.app', // 허용할 프론트엔드 도메인
        methods: ['GET', 'POST'], // 허용할 HTTP 메서드
        credentials: true, // 인증 정보(쿠키 등) 허용 여부
    })
);

const io = new Server(server, {
    cors: {
        origin: 'https://drawapp-five.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
