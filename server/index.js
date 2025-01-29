const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        transports: ['websocket', 'polling'],
    },
});

app.use(cors());

io.on('connection', (socket) => {
    console.log(`🔗 클라이언트 연결됨: ${socket.id}`);

    socket.on('offer', (offer) => {
        console.log('📡 WebRTC Offer 수신');
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        console.log('📡 WebRTC Answer 수신');
        socket.broadcast.emit('answer', answer);
    });

    socket.on('candidate', (candidate) => {
        console.log('📡 ICE Candidate 수신');
        socket.broadcast.emit('candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log(`❌ 클라이언트 연결 종료: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: 포트 ${PORT}`);
});
