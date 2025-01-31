const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let activeScreenSharer = null;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('start-screen-share', () => {
        if (!activeScreenSharer) {
            activeScreenSharer = socket.id;
            socket.broadcast.emit('screen-share-started', socket.id);
            console.log('Screen share started by:', socket.id);
        } else {
            socket.emit('error', 'Screen sharing is already active.');
        }
    });

    socket.on('stop-screen-share', () => {
        if (activeScreenSharer === socket.id) {
            activeScreenSharer = null;
            socket.broadcast.emit('screen-share-stopped');
            console.log('Screen share stopped by:', socket.id);
        }
    });

    socket.on('offer', (data) => {
        socket.broadcast.emit('offer', data);
    });

    socket.on('answer', (data) => {
        socket.broadcast.emit('answer', data);
    });

    socket.on('ice-candidate', (data) => {
        socket.broadcast.emit('ice-candidate', data);
    });

    socket.on('chat-message', (message) => {
        io.emit('chat-message', { id: socket.id, message });
    });

    socket.on('disconnect', () => {
        if (activeScreenSharer === socket.id) {
            activeScreenSharer = null;
            io.emit('screen-share-stopped');
            console.log('Screen share stopped due to disconnect:', socket.id);
        }
        console.log('User disconnected:', socket.id);
    });
});

server.listen(8080, () => {
    console.log('Server listening on port 8080');
});
