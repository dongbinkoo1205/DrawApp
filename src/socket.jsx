import { io } from 'socket.io-client';

// 🔹 Render에서 배포된 백엔드 주소로 변경
const socket = io('https://drawapp-ne15.onrender.com', {
    transports: ['websocket', 'polling'], // 🔹 WebSocket 우선 사용
    reconnection: true, // 🔹 자동 재연결 활성화
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export default socket;
