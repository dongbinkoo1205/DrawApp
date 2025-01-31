const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

app.use(cors());
app.get('/', (req, res) => res.send('Server is running...'));

let broadcaster;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Broadcaster sets their role
    socket.on('start-broadcast', () => {
        broadcaster = socket.id;
        socket.broadcast.emit('broadcaster', broadcaster);
    });

    // Forward offer, answer, and ICE candidates
    socket.on('offer', (data) => socket.to(data.target).emit('offer', data));
    socket.on('answer', (data) => socket.to(data.target).emit('answer', data));
    socket.on('ice-candidate', (data) => socket.to(data.target).emit('ice-candidate', data));

    // Chat messaging
    socket.on('send-message', (message) => {
        io.emit('receive-message', message);
    });

    socket.on('disconnect', () => {
        if (socket.id === broadcaster) {
            broadcaster = null;
            io.emit('broadcaster-disconnected');
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
