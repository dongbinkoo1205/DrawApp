const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// ✅ 포트를 환경 변수로부터 가져옵니다.
const PORT = process.env.PORT || 8080;

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// ✅ 기본 경로에 대한 응답 추가
app.get('/', (req, res) => {
    res.send('<h1>Signaling 서버가 정상적으로 작동 중입니다.</h1>');
});

io.on('connection', (socket) => {
    console.log('사용자 연결됨:', socket.id);

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('chat-message', (message) => {
        io.emit('chat-message', message);
    });

    socket.on('disconnect', () => {
        console.log('사용자 연결 종료:', socket.id);
    });
});

// ✅ PORT 환경 변수를 사용하여 서버 시작
server.listen(PORT, () => {
    console.log(`Signaling 서버가 ${PORT}번 포트에서 실행 중...`);
});
