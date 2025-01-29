const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        transports: ['websocket', 'polling'],
    },
});

app.use(cors());

io.on('connection', (socket) => {
    console.log(`🔗 클라이언트 연결됨: ${socket.id}`);

    socket.on('offer', async (offer) => {
        console.log('📡 WebRTC Offer 수신');
        if (!peerRef.current) {
            peerRef.current = createPeer(false);
        }

        try {
            // signalingState가 "stable"이 아닐 때 기다리기
            if (peerRef.current.signalingState !== 'stable') {
                console.log('Signaling state is not stable, waiting...');
                return; // "stable" 상태일 때만 진행
            }

            await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            socket.emit('answer', answer); // 서버로 answer 전송
        } catch (err) {
            console.error('Offer 처리 실패:', err);
        }
    });

    // WebRTC Answer 수신
    socket.on('answer', (answer) => {
        console.log('📡 WebRTC Answer 수신');
        // 상대 클라이언트에게 answer 전송
        socket.broadcast.emit('answer', answer);
    });

    // ICE Candidate 수신
    socket.on('candidate', (candidate) => {
        console.log('📡 ICE Candidate 수신');
        // 상대 클라이언트에게 candidate 전송
        socket.broadcast.emit('candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log(`❌ 클라이언트 연결 종료: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: 포트 ${PORT}`);
});
