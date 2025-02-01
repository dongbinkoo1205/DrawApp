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
        credentials: true,
    },
});

let activeScreenSharer = null;
let participants = []; // 참여자 목록

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 닉네임을 통해 참여자 추가
    socket.on('join', (nickname) => {
        participants.push({ id: socket.id, nickname });
        console.log(`${nickname} joined the room`);
        io.emit('participants-update', participants); // 참여자 목록 전송
    });

    // 현재 공유 중인 화면 정보가 있을 경우 Offer 전송
    if (activeScreenSharer) {
        socket.emit('screen-share-started', activeScreenSharer.offer);
    }

    // 화면 공유 시작
    socket.on('start-screen-share', (offer) => {
        if (!activeScreenSharer) {
            activeScreenSharer = { id: socket.id, offer };
            io.emit('screen-share-started', offer); // 모든 사용자에게 Offer 전송
            console.log('Screen share started by:', socket.id);
        } else {
            socket.emit('error', 'Screen sharing is already active.');
        }
    });

    // 화면 공유 중지
    socket.on('stop-screen-share', () => {
        if (activeScreenSharer && activeScreenSharer.id === socket.id) {
            activeScreenSharer = null;
            io.emit('screen-share-stopped'); // 모든 사용자에게 공유 중지 알림
            console.log('Screen share stopped by:', socket.id);
        }
    });

    // Offer/Answer 및 ICE Candidate 처리
    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    // 채팅 메시지 처리
    socket.on('chat-message', (message) => {
        io.emit('chat-message', message);
    });

    // 사용자 연결 해제 시 참여자 목록 및 화면 공유 상태 업데이트
    socket.on('disconnect', () => {
        participants = participants.filter((participant) => participant.id !== socket.id);
        io.emit('participants-update', participants);

        if (activeScreenSharer && activeScreenSharer.id === socket.id) {
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
