const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(
    cors({
        origin: 'https://drawapp-five.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true,
    })
);

const io = new Server(server, {
    cors: {
        origin: 'https://drawapp-five.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log('WebSocket connected:', socket.id);

    socket.on('start-broadcast', () => {
        console.log('Broadcast started by:', socket.id);
        socket.broadcast.emit('broadcaster', socket.id);
    });

    socket.on('offer', (data) => {
        if (data.target) {
            console.log(`Forwarding offer from ${socket.id} to ${data.target}`);
            socket.to(data.target).emit('offer', { sender: socket.id, offer: data.offer });
        } else {
            console.error('Offer target is missing.');
        }
    });

    socket.on('answer', (data) => {
        if (data.target) {
            console.log(`Forwarding answer from ${socket.id} to ${data.target}`);
            socket.to(data.target).emit('answer', { sender: socket.id, answer: data.answer });
        } else {
            console.error('Answer target is missing.');
        }
    });

    socket.on('ice-candidate', (data) => {
        if (data.target) {
            console.log(`Forwarding ICE candidate from ${socket.id} to ${data.target}`);
            socket.to(data.target).emit('ice-candidate', { candidate: data.candidate });
        } else {
            console.error('ICE candidate target is missing.');
        }
    });

    socket.on('disconnect', () => {
        console.log('WebSocket disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
