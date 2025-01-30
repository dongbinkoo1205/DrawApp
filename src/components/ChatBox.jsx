import React, { useState, useEffect } from 'react';

function ChatBox({ socket }) {
    const [message, setMessage] = useState('');
    const [chatLog, setChatLog] = useState([]);

    useEffect(() => {
        const handleMessage = (data) => {
            setChatLog((prevLog) => [...prevLog, { type: 'received', text: data }]);
        };

        socket.on('chat-message', handleMessage);

        return () => {
            socket.off('chat-message', handleMessage); // 클린업으로 이벤트 리스너 제거
        };
    }, [socket]);

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit('chat-message', message);
            setChatLog([...chatLog, { type: 'sent', text: message }]);
            setMessage('');
        }
    };

    return (
        <div className="w-1/3 bg-gray-800 text-white p-4">
            <h3 className="font-bold mb-2">채팅</h3>
            <div className="h-64 overflow-y-scroll bg-gray-700 p-2 rounded">
                {chatLog.map((chat, index) => (
                    <div key={index} className={`mb-1 ${chat.type === 'sent' ? 'text-right' : ''}`}>
                        {chat.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full mt-2 p-2 rounded bg-gray-600"
            />
            <button onClick={sendMessage} className="mt-2 w-full px-4 py-2 bg-blue-600 rounded">
                전송
            </button>
        </div>
    );
}

export default ChatBox;
