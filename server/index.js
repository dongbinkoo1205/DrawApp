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
        origin: 'https://drawapp-five.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

// Socket.io 설정
const io = new Server(server, {
    cors: {
        origin: 'https://drawapp-five.vercel.app',
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
        if (data.target) {
            socket.to(data.target).emit('offer', { sender: socket.id, offer: data.offer });
        } else {
            console.error('Offer target is undefined. Skipping offer.');
        }
    });

    socket.on('answer', (data) => {
        if (!data.target || !data.answer) {
            console.error('Invalid answer data:', data);
            return;
        }
        console.log(`Received answer from ${socket.id} to ${data.target}`);
        socket.to(data.target).emit('answer', { sender: socket.id, answer: data.answer });
    });

    socket.on('ice-candidate', (data) => {
        console.log(`Received ICE candidate from ${socket.id} to ${data.target}`);
        if (data.target) {
            socket.to(data.target).emit('ice-candidate', { candidate: data.candidate });
        } else {
            console.error('ICE candidate target is undefined. Skipping candidate.');
        }
    });
    socket.on('disconnect', () => {
        console.log('WebSocket disconnected:', socket.id);
    });
});

// 서버 포트 설정 및 시작
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
