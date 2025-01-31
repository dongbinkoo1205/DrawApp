const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

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

    socket.on('offer', async (offer) => {
        console.log('Received offer from:', socket.id);

        // Broadcast the offer to all other clients
        socket.broadcast.emit('offer', offer);

        // If no other clients are connected, send a dummy answer to maintain ICE connection
        if (io.engine.clientsCount === 1) {
            console.log('No other clients available, sending dummy answer to:', socket.id);
            const peerConnection = new RTCPeerConnection();
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('answer', answer);
        }
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
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

server.listen(8080, () => {
    console.log('Server listening on port 8080');
});
