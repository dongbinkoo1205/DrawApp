const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: 'https://drawapp-five.vercel.app', methods: ['GET', 'POST'], credentials: true }));

const io = new Server(server, {
    cors: {
        origin: 'https://drawapp-five.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('start-share', () => {
        console.log('Broadcast started by:', socket.id);
        socket.broadcast.emit('broadcaster', socket.id);
    });

    socket.on('signal', (data) => {
        console.log(`Signal from ${data.from} to ${data.to}`);
        socket.to(data.to).emit('signal', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
