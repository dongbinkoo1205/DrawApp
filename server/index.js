const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'https://drawapp-five.vercel.app',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    },
});

let activeScreenSharer = null;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 새로 연결된 클라이언트에게 현재 화면 공유 상태 전송
    if (activeScreenSharer) {
        socket.emit('screen-share-started', activeScreenSharer);
    }

    socket.on('start-screen-share', () => {
        if (!activeScreenSharer) {
            activeScreenSharer = socket.id;
            io.emit('screen-share-started', socket.id);
            console.log('Screen share started by:', socket.id);
        } else {
            socket.emit('error', 'Screen sharing is already active.');
        }
    });

    socket.on('stop-screen-share', () => {
        if (activeScreenSharer === socket.id) {
            activeScreenSharer = null;
            io.emit('screen-share-stopped');
            console.log('Screen share stopped by:', socket.id);
        }
    });

    socket.on('disconnect', () => {
        if (activeScreenSharer === socket.id) {
            activeScreenSharer = null;
            io.emit('screen-share-stopped');
        }
        console.log('User disconnected:', socket.id);
    });
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const PORT = 8080; // 직접 포트를 지정
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
