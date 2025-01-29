// import { useState, useEffect } from 'react';
// import socket from '../socket';

// const Chat = () => {
//     const [messages, setMessages] = useState([]);
//     const [input, setInput] = useState('');

//     useEffect(() => {
//         // 채팅 메시지 수신
//         socket.on('chatMessage', (message) => {
//             setMessages((prev) => [...prev, message]);
//         });

//         return () => {
//             socket.off('chatMessage');
//         };
//     }, []);

//     const sendMessage = () => {
//         if (input.trim()) {
//             socket.emit('chatMessage', input); // 서버로 채팅 메시지 전송
//             setInput('');
//         }
//     };

//     return (
//         <div className="w-80 bg-gray-800 text-white rounded-lg shadow-lg p-4">
//             <h2 className="text-lg font-bold mb-2">채팅</h2>
//             <div className="h-60 overflow-y-auto bg-gray-700 p-2 rounded">
//                 {messages.map((msg, index) => (
//                     <p key={index} className="text-sm p-1">
//                         {msg}
//                     </p>
//                 ))}
//             </div>
//             <input
//                 className="w-full p-2 mt-2 bg-gray-600 rounded"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//             />
//             <button className="w-full mt-2 bg-blue-500 p-2 rounded hover:bg-blue-600" onClick={sendMessage}>
//                 보내기
//             </button>
//         </div>
//     );
// };

// export default Chat;

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('https://drawapp-ne15.onrender.com', {
    transports: ['websocket', 'polling'], // ✅ WebSocket & Polling 허용
    reconnection: true, // 자동 재연결
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
});
const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        socket.on('chat', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off('chat'); // ✅ 컴포넌트 언마운트 시 WebSocket 리스너 제거
        };
    }, []);

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit('chat', message);
            setMessage('');
        }
    };

    return (
        <div style={{ height: '30vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <h2>채팅</h2>
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <div style={{ display: 'flex', borderTop: '1px solid #ddd' }}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="메시지 입력..."
                    style={{ flex: 1, padding: '10px', border: 'none', outline: 'none' }}
                />
                <button
                    onClick={sendMessage}
                    style={{ padding: '10px 15px', background: '#007BFF', color: '#fff', border: 'none' }}
                >
                    전송
                </button>
            </div>
        </div>
    );
};

export default Chat;
