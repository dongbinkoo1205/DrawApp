import { io } from 'socket.io-client';

const socket = io('https://drawapp-ne15.onrender.com', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
});

export default socket;
