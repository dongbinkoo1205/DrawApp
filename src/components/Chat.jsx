import React, { useState } from 'react';
const Chat = ({ messages = [], onSendMessage, participants = [] }) => {
    const [inputValue, setInputValue] = useState('');

    const getNickname = (senderId) => {
        const participant = participants.find((person) => person.id === senderId);
        return participant ? participant.nickname : 'Anonymous';
    };

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="flex-1 flex flex-col  ">
            <h3 className="text-lg font-semibold mb-2">Chat</h3>
            <ul className="flex-1 space-y-2  p-2 bg-gray-700 rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 overflow-scroll overflow-x-hidden scrollbar-custom">
                {messages.length > 0 ? (
                    messages.map((msg, index) => {
                        // 첫 메시지이거나 이전 메시지와 보낸 사람이 다르면 닉네임 표시
                        const showNickname = index === 0 ? true : messages[index - 1].senderId !== msg.senderId;
                     
                        return (
                            <li key={msg.id || index} className="bg-gray-600 p-2 rounded-lg text-sm text-gray-300">
                                {showNickname ? (
                                    <span className="font-bold text-white">{getNickname(msg.senderId)}</span>
                                ) : null}
                                <span className={showNickname ? 'ml-2' : ''}>{msg.text}</span>
                            </li>
                        );
                    })
                ) : (
                    <li className="text-gray-400 text-center">No messages yet...</li>
                )}
            </ul>
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
