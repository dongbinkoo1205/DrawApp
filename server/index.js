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
let rooms = {}; // 방 정보 관리 (방별 사용자 목록)

io.on('connection', (socket) => {
    console.log(`[SERVER] 사용자 연결됨: ${socket.id}`);

    let currentRoom = null;

    // 방 참여 처리
    socket.on('join-room', (roomId) => {
        currentRoom = roomId;
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = { users: [], sharer: null };
        }
        rooms[roomId].users.push(socket.id);
        console.log(`[SERVER] ${socket.id}가 방 ${roomId}에 참여했습니다.`);
    });

    // 화면 공유 시작 이벤트
    socket.on('start-sharing', () => {
        if (rooms[currentRoom].sharer) {
            console.log(`[SERVER] 이미 ${rooms[currentRoom].sharer}가 화면을 공유 중임`);
            socket.emit('sharing-denied', '다른 사용자가 이미 화면을 공유 중입니다.');
        } else {
            rooms[currentRoom].sharer = socket.id;
            console.log(`[SERVER] ${socket.id}가 화면 공유를 시작했습니다.`);
            io.in(currentRoom).emit('sharing-started', { sharer: socket.id });
        }
    });

    // 화면 공유 중단 이벤트
    socket.on('stop-sharing', () => {
        if (rooms[currentRoom]?.sharer === socket.id) {
            console.log(`[SERVER] ${socket.id}가 화면 공유를 중단했습니다.`);
            rooms[currentRoom].sharer = null;
            io.in(currentRoom).emit('sharing-stopped');
        }
    });

    // 시그널 데이터 전송 이벤트
    socket.on('signal', (data) => {
        console.log(`[SERVER] 신호 데이터 수신 from ${socket.id} -> 방 ${currentRoom} 내 사용자 ${data.to}`);
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    // 사용자 연결 종료 처리
    socket.on('disconnect', () => {
        console.log(`[SERVER] 사용자 연결 종료: ${socket.id}`);
        if (rooms[currentRoom]) {
            rooms[currentRoom].users = rooms[currentRoom].users.filter((id) => id !== socket.id);
            if (rooms[currentRoom].sharer === socket.id) {
                console.log(`[SERVER] 현재 화면 공유 사용자 ${socket.id}가 연결 종료됨. 화면 공유 중단`);
                rooms[currentRoom].sharer = null;
                io.in(currentRoom).emit('sharing-stopped');
            }
            if (rooms[currentRoom].users.length === 0) {
                delete rooms[currentRoom]; // 방 삭제
            }
        }
    });
});

// ✅ 서버 시작
server.listen(PORT, () => {
    console.log(`Signaling 서버가 ${PORT}번 포트에서 실행 중...`);
});
