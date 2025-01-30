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
        credentials: true,
    },
    path: '/socket.io/', // 경로 설정
});

app.get('/', (req, res) => {
    res.send('Signaling 서버가 정상적으로 작동 중입니다.');
});

let currentSharer = null; // 현재 화면 공유 중인 사용자 ID

// ✅ 클라이언트 연결 시 이벤트 처리
io.on('connection', (socket) => {
    console.log(`[SERVER] 사용자 연결됨: ${socket.id}`);

    let currentRoom = null;

    socket.on('join-room', (roomId) => {
        currentRoom = roomId;
        socket.join(roomId);
        console.log(`[SERVER] ${socket.id}가 방 ${roomId}에 참여했습니다.`);
    });

    socket.on('signal', (data) => {
        console.log(`[SERVER] 신호 데이터 수신 from ${socket.id} -> 방 ${currentRoom} 내 사용자 ${data.to}`);
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('disconnect', () => {
        console.log(`[SERVER] 사용자 연결 종료: ${socket.id}`);
        socket.leave(currentRoom);
    });
});

// ✅ 서버 시작
server.listen(PORT, () => {
    console.log(`Signaling 서버가 ${PORT}번 포트에서 실행 중...`);
});
