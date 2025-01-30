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
    path: '/socket.io/',
});

app.get('/', (req, res) => {
    res.send('Signaling 서버가 정상적으로 작동 중입니다.');
});

let rooms = {};

io.on('connection', (socket) => {
    console.log(`[SERVER] 사용자 연결됨: ${socket.id}`);

    let currentRoom = null;

    socket.on('join-room', (roomId) => {
        currentRoom = roomId;
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = { users: [], sharer: null };
            console.log(`[SERVER] 새 방 생성: ${roomId}`);
        }

        rooms[roomId].users.push(socket.id);
        console.log(`[SERVER] ${socket.id}가 방 ${roomId}에 참여했습니다. 현재 방 상태:`, rooms[roomId]);
    });

    socket.on('start-sharing', () => {
        if (rooms[currentRoom]?.sharer) {
            console.log(`[SERVER] ${socket.id}의 공유 요청 거부: 이미 ${rooms[currentRoom].sharer}가 공유 중`);
            socket.emit('sharing-denied', '다른 사용자가 이미 화면을 공유 중입니다.');
        } else {
            rooms[currentRoom].sharer = socket.id;
            console.log(`[SERVER] ${socket.id}가 화면 공유를 시작했습니다.`);
            io.in(currentRoom).emit('sharing-started', { sharer: socket.id });
        }
    });

    socket.on('stop-sharing', () => {
        if (rooms[currentRoom]?.sharer === socket.id) {
            console.log(`[SERVER] ${socket.id}가 화면 공유를 중단했습니다.`);
            rooms[currentRoom].sharer = null;
            io.in(currentRoom).emit('sharing-stopped');
        }
    });

    socket.on('signal', (data) => {
        console.log(`[SERVER] 신호 데이터 수신 from ${socket.id} to ${data.to}`);
        console.log(`[SERVER] 전달되는 신호:`, data.signal); // 신호 내용을 출력
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

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
                console.log(`[SERVER] 방 ${currentRoom} 삭제`);
                delete rooms[currentRoom];
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Signaling 서버가 ${PORT}번 포트에서 실행 중...`);
});
