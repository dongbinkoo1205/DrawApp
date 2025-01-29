// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const path = require('path');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: '*', // 모든 출처 허용
//         methods: ['GET', 'POST'],
//         transports: ['websocket', 'polling'],
//     },
// });

// app.use(cors());

// // React 빌드된 파일을 서빙합니다.
// app.use(express.static(path.join(__dirname, 'client/build')));

// // 기본 라우트에서 React 앱을 서빙합니다.
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

// io.on('connection', (socket) => {
//     console.log(`🔗 클라이언트 연결됨: ${socket.id}`);

//     socket.on('offer', (offer) => {
//         console.log('📡 WebRTC Offer 수신');
//         socket.broadcast.emit('offer', offer); // 다른 클라이언트에게 offer 전송
//     });

//     socket.on('answer', (answer) => {
//         console.log('📡 WebRTC Answer 수신');
//         socket.broadcast.emit('answer', answer); // 다른 클라이언트에게 answer 전송
//     });

//     socket.on('candidate', (candidate) => {
//         console.log('📡 ICE Candidate 수신');
//         socket.broadcast.emit('candidate', candidate); // 다른 클라이언트에게 candidate 전송
//     });

//     socket.on('disconnect', () => {
//         console.log(`❌ 클라이언트 연결 종료: ${socket.id}`);
//     });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//     console.log(`🚀 서버 실행 중: 포트 ${PORT}`);
// });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build')); // React 앱 빌드 폴더 제공

io.on('connection', (socket) => {
    console.log('사용자 연결됨');

    socket.on('chat', (msg) => {
        io.emit('chat', msg); // 모든 클라이언트에 메시지 전송
    });

    socket.on('disconnect', () => {
        console.log('사용자 연결 해제됨');
    });
});

server.listen(3000, () => {
    console.log('서버가 3000번 포트에서 실행 중입니다.');
});
