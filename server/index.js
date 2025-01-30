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
    },
});

let currentSharer = null; // 현재 화면 공유 사용자

io.on('connection', (socket) => {
    console.log('사용자 연결됨:', socket.id);

    socket.on('start-sharing', () => {
        if (currentSharer) {
            socket.emit('sharing-status', false); // 공유 거부
        } else {
            currentSharer = socket.id;
            io.emit('sharing-status', true); // 공유 승인
        }
    });

    socket.on('stop-sharing', () => {
        if (socket.id === currentSharer) {
            currentSharer = null;
            io.emit('sharing-status', true); // 다른 사용자가 공유 가능
        }
    });

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('disconnect', () => {
        console.log('사용자 연결 종료:', socket.id);
        if (socket.id === currentSharer) {
            currentSharer = null;
            io.emit('sharing-status', true);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Signaling 서버가 ${PORT}번 포트에서 실행 중...`);
});
