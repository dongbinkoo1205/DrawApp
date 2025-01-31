const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'https://drawapp-ne15.onrender.com' } });

let activeScreenSharer = null;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

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

    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    socket.on('chat-message', (message) => {
        io.emit('chat-message', message);
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
