const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
let activeScreenSharer = null;
let currentOffer = null; // 현재 Offer를 저장

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 새로 접속한 클라이언트에 현재 화면 공유 상태 전달
    if (activeScreenSharer && currentOffer) {
        socket.emit('screen-share-started', { sharerId: activeScreenSharer, offer: currentOffer });
    }

    socket.on('start-screen-share', async (offer) => {
        if (!activeScreenSharer) {
            activeScreenSharer = socket.id;
            currentOffer = offer;
            socket.broadcast.emit('screen-share-started', { sharerId: socket.id, offer });
            console.log('Screen share started by:', socket.id);
        } else {
            socket.emit('error', 'Screen sharing is already active.');
        }
    });

    socket.on('stop-screen-share', () => {
        if (activeScreenSharer === socket.id) {
            activeScreenSharer = null;
            currentOffer = null;
            socket.broadcast.emit('screen-share-stopped');
            console.log('Screen share stopped by:', socket.id);
        }
    });

    socket.on('disconnect', () => {
        if (activeScreenSharer === socket.id) {
            activeScreenSharer = null;
            currentOffer = null;
            io.emit('screen-share-stopped');
        }
        console.log('User disconnected:', socket.id);
    });

    socket.on('ice-candidate', (data) => {
        socket.broadcast.emit('ice-candidate', data);
    });
});

server.listen(8080, () => {
    console.log('Server listening on port 8080');
});
