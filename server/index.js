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
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(
    cors({
        origin: ['https://drawapp-five.vercel.app'],
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

const io = new Server(server, {
    cors: {
        origin: 'https://drawapp-five.vercel.app',
        methods: ['GET', 'POST'],
    },
});

let screenSharer = null; // 현재 화면 공유 중인 사용자 ID

io.on('connection', (socket) => {
    console.log('✅ 클라이언트 연결됨:', socket.id);

    // 현재 화면 공유 상태 전송
    socket.emit('screen-sharing-status', screenSharer !== null);

    // ✅ WebRTC Offer, Answer, ICE Candidate 전송
    socket.on('offer', (data) => {
        socket.broadcast.emit('offer', data);
    });

    socket.on('answer', (data) => {
        socket.broadcast.emit('answer', data);
    });

    socket.on('ice-candidate', (data) => {
        socket.broadcast.emit('ice-candidate', data);
    });

    socket.on('start-screen-share', () => {
        if (!screenSharer) {
            screenSharer = socket.id;
            io.emit('screen-sharing-status', true);
            console.log(`📺 화면 공유 시작: ${socket.id}`);
        }
    });

    socket.on('stop-screen-share', () => {
        if (screenSharer === socket.id) {
            screenSharer = null;
            io.emit('screen-sharing-status', false);
            console.log(`❌ 화면 공유 종료: ${socket.id}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ 클라이언트 연결 해제됨:', socket.id);
        if (screenSharer === socket.id) {
            screenSharer = null;
            io.emit('screen-sharing-status', false);
            console.log('❌ 화면 공유 중이던 사용자가 나갔습니다.');
        }
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`✅ 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
