import { io } from 'socket.io-client';

// WebSocket 우선으로 설정
const socket = io('https://drawapp-ne15.onrender.com', {
    transports: ['websocket', 'polling'], // WebSocket 우선
    reconnection: true, // 자동 재연결 활성화
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
});

export default socket;
