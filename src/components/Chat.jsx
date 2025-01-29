import { useState, useEffect } from 'react';
import socket from '../socket';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        socket.on('chatMessage', (message) => {
            console.log('메시지 수신:', message); // 디버깅용 콘솔 로그
            setMessages((prev) => [...prev, message]);
        });

        return () => socket.off('chatMessage');
    }, []);

    const sendMessage = () => {
        if (input.trim()) {
            socket.emit('chatMessage', input);
            setMessages((prev) => [...prev, input]); // 🔹 내가 보낸 메시지를 즉시 상태에 추가
            setInput('');
        }
    };

    return (
        <div className="w-80 bg-gray-800 text-white rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-bold mb-2">채팅</h2>
            <div className="h-60 overflow-y-auto bg-gray-700 p-2 rounded">
                {messages.map((msg, index) => (
                    <p key={index} className="text-sm p-1">
                        {msg}
                    </p>
                ))}
            </div>
            <input
                className="w-full p-2 mt-2 bg-gray-600 rounded"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="w-full mt-2 bg-blue-500 p-2 rounded hover:bg-blue-600" onClick={sendMessage}>
                보내기
            </button>
        </div>
    );
};

export default Chat;
