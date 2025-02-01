require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // 모든 출처 허용
        methods: ['GET', 'POST'],
        credentials: true, // 필요한 경우 쿠키, 인증 정보 사용 가능
    },
});

let activeScreenSharer = null;

io.on('connection', (socket) => {
    // 참여자 연결확인
    console.log('User connected:', socket.id);
    socket.on('join', (nickname) => {
        // 새로운 참여자 추가
        participants.push({ id: socket.id, nickname });
        console.log(`${nickname} joined the room`);
        io.emit('participants-update', participants); // 참여자 목록 전송
    });
    if (activeScreenSharer) {
        socket.emit('screen-share-started', activeScreenSharer);
    }

    socket.on('start-screen-share', () => {
        if (!activeScreenSharer) {
            activeScreenSharer = socket.id;
            io.emit('screen-share-started', socket.id);
            console.log('Screen share started by:', socket.id);
        } else {
            socket.emit('error', 'Screen sharing is already active.');
        }
    });

    socket.on('stop-screen-share', () => {
        if (activeScreenSharer === socket.id) {
            activeScreenSharer = null;
            io.emit('screen-share-stopped');
            console.log('Screen share stopped by:', socket.id);
        }
    });

    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    socket.on('chat-message', (message) => {
        io.emit('chat-message', message);
    });

    socket.on('disconnect', () => {
        // 나간 참여자 제거
        participants = participants.filter((participant) => participant.id !== socket.id);
        io.emit('participants-update', participants); // 참여자 목록 업데이트
        if (activeScreenSharer === socket.id) {
            activeScreenSharer = null;
            io.emit('screen-share-stopped');
        }
        console.log('User disconnected:', socket.id);
    });
});

// 포트 설정 (Render에서는 PORT 환경변수가 자동으로 제공됨)
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
