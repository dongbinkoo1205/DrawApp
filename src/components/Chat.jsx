import React, { useState } from 'react';

const Chat = ({ messages, onSendMessage }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue); // 부모 컴포넌트로 메시지 전송
            setInputValue('');
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Chat</h3>
            <ul className="flex-1 space-y-2 overflow-y-auto p-2 bg-gray-700 rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {messages.map((msg, index) => (
                    <li key={index} className="bg-gray-600 p-2 rounded-lg text-sm text-gray-300">
                        <span className="font-bold text-white">{msg.id}</span>: {msg.message}
                    </li>
                ))}
            </ul>
            <div className="mt-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
            </div>
        </div>
    );
};

export default Chat;

