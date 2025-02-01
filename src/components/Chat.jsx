import React, { useState } from 'react';

const Chat = ({ messages = [], onSendMessage, participants = [] }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (inputValue.trim()) {
            // 메시지 전송
            onSendMessage({ sender: 'You', text: inputValue });
            setInputValue('');
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Chat</h3>

            {/* 참여자 목록 */}
            <ul className="space-y-2 p-2 bg-gray-800 rounded-lg text-sm text-white mb-4">
                <h4 className="font-bold text-gray-400 mb-2">Participants</h4>
                {participants.map((participant) => (
                    <li key={participant.id} className="p-2 bg-gray-600 rounded-lg">
                        {participant.nickname}
                    </li>
                ))}
            </ul>

            {/* 채팅 메시지 목록 */}
            <ul className="flex-1 space-y-2 overflow-y-auto p-2 bg-gray-700 rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <li key={msg.id || index} className="bg-gray-600 p-2 rounded-lg text-sm text-gray-300">
                            <span className="font-bold text-white">{msg.sender || 'Anonymous'}</span>: {msg.text || ''}
                        </li>
                    ))
                ) : (
                    <li className="text-gray-400 text-center">No messages yet...</li>
                )}
            </ul>

            {/* 입력 필드 */}
            <div className="mt-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); // 기본 동작 방지
                            handleSend();
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Chat;
