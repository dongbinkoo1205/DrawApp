// import { io } from 'socket.io-client';

// // WebSocket 우선으로 설정
// const socket = io('https://drawapp-ne15.onrender.com', {
//     transports: ['websocket', 'polling'], // WebSocket 우선
//     reconnection: true, // 자동 재연결 활성화
//     reconnectionAttempts: 10,
//     reconnectionDelay: 2000,
// });

// export default socket;

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Express 서버 주소

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        socket.on('chat', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socket.off('chat');
    }, []);

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit('chat', message);
            setMessage('');
        }
    };

    return (
        <div>
            <h2>채팅</h2>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="메시지를 입력하세요" />
            <button onClick={sendMessage}>전송</button>
        </div>
    );
};

export default Chat;
