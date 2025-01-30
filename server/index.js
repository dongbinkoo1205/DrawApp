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
    console.log('사용자 연결됨:', socket.id);

    // ✅ 새 클라이언트가 연결되면 현재 공유 상태 동기화
    if (currentSharer) {
        console.log(`현재 ${currentSharer}가 화면을 공유 중입니다.`);
        socket.emit('sharing-started', { sharer: currentSharer });
    }

    // ✅ 화면 공유 시작 이벤트 처리
    socket.on('start-sharing', () => {
        if (currentSharer) {
            console.log(`이미 ${currentSharer}가 화면을 공유 중입니다. ${socket.id} 요청 거부`);
            socket.emit('sharing-denied', '다른 사용자가 이미 화면을 공유 중입니다.');
        } else {
            currentSharer = socket.id;
            console.log(`${socket.id}가 화면 공유를 시작했습니다.`);
            io.emit('sharing-started', { sharer: socket.id });
        }
    });

    // ✅ 화면 공유 중단 이벤트 처리
    socket.on('stop-sharing', () => {
        if (socket.id === currentSharer) {
            console.log(`${socket.id}가 화면 공유를 중단했습니다.`);
            currentSharer = null;
            io.emit('sharing-stopped');
        }
    });

    // ✅ 신호 데이터 전송 이벤트 처리
    socket.on('signal', (data) => {
        console.log(`신호 데이터 수신 from ${socket.id} -> to ${data.to}`);

        const targetSocket = io.sockets.sockets.get(data.to);
        if (targetSocket) {
            targetSocket.emit('signal', { from: socket.id, signal: data.signal });
            console.log(`신호 데이터 전송 완료 to ${data.to}`);
        } else {
            console.warn(`타겟 소켓 ${data.to}가 존재하지 않습니다.`);
        }
    });

    // ✅ 채팅 메시지 전송 이벤트 처리
    socket.on('chat-message', (message) => {
        console.log(`채팅 메시지 from ${socket.id}: ${message}`);
        io.emit('chat-message', message);
    });

    // ✅ 사용자 연결 종료 이벤트 처리
    socket.on('disconnect', () => {
        console.log('사용자 연결 종료:', socket.id);

        if (socket.id === currentSharer) {
            console.log(`현재 화면 공유 사용자 ${socket.id}가 연결 종료됨. 화면 공유 중단`);
            currentSharer = null;
            io.emit('sharing-stopped');
        }
    });
});

// ✅ 서버 시작
server.listen(PORT, () => {
    console.log(`Signaling 서버가 ${PORT}번 포트에서 실행 중...`);
});
