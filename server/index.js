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

// ✅ CORS 설정 - Render에서 올바르게 WebSocket 요청을 허용
app.use(
    cors({
        origin: ['https://drawapp-five.vercel.app'], // Vercel 프론트엔드 주소
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

const io = new Server(server, {
    cors: {
        origin: 'https://drawapp-five.vercel.app', // ✅ WebSocket 요청 허용
        methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'], // ✅ WebSocket & Polling 허용
    allowEIO3: true, // ✅ 일부 브라우저에서 WebSocket이 차단되지 않도록 설정
    pingInterval: 25000, // ✅ 연결 유지 (25초마다 Ping)
    pingTimeout: 60000, // ✅ 60초 이상 응답 없으면 연결 종료
});

let screenSharer = null; // 현재 화면 공유 중인 사용자 ID

io.on('connection', (socket) => {
    console.log('✅ 클라이언트 연결됨:', socket.id);

    // ✅ 현재 화면 공유 상태 전송
    socket.emit('screen-sharing-status', screenSharer !== null);

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

// ✅ Render에서는 8080 포트를 사용해야 함
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`✅ 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
