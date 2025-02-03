import React, { useState } from 'react';
import './ScreenShare.css';

const Chat = ({ messages = [], onSendMessage, participants = [] }) => {
    const [inputValue, setInputValue] = useState('');

    const getNickname = (senderId) => {
        const participant = participants.find((person) => person.id === senderId);
        return participant ? participant.nickname.nickname : 'Anonymous';
    };

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="flex-1 flex flex-col Pretendard-r ">
            <h3 className="text-lg font-semibold mb-2">Group Chat</h3>
            <ul className="flex-1 space-y-2 pt-2 pb-2 pl-4 pr-4 bg-[#d6e3fd] rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 overflow-scroll overflow-x-hidden scrollbar-custom">
                {messages.length > 0 ? (
                    messages
                        .reduce((groupedMessages, msg, index) => {
                            const isNewGroup = index === 0 || messages[index - 1].senderId !== msg.senderId;

                            if (isNewGroup) {
                                groupedMessages.push({
                                    senderId: msg.senderId,
                                    nickname: msg.nickname, // 바로 사용 가능
                                    messages: [msg.text],
                                    avatar: msg.avatar, // 바로 사용 가능
                                });
                            } else {
                                const lastGroup = groupedMessages[groupedMessages.length - 1];
                                lastGroup.messages.push(msg.text);
                            }

                            return groupedMessages;
                        }, [])
                        .map((group, index) => (
                            <div key={index}>
                                <span className="text-[12px] text-[#1c292e] font-semibold  block m-1 flex items-center">
                                    <span className="chatAvatar mr-[7px] mb-1">
                                        <img
                                            src={group.avatar}
                                            alt=""
                                            className=" block w-[40px] h-[40px] object-cover mr-[5px] "
                                        />
                                    </span>
                                    {group.nickname}
                                </span>

                                <li className=" flex flex-wrap items-center  bg-[#6892ffa3] p-2 rounded-lg text-sm text-[#1c292e]">
                                    {group.messages.map((text, idx) => {
                                        return (
                                            <p key={idx} className="w-full block ml-2 mt-1 mb-1">
                                                ・{text}
                                            </p>
                                        );
                                    })}
                                </li>
                            </div>
                        ))
                ) : (
                    <li className="text-gray-400 text-center mt-2 mb-2">아직 작성된 메세지가 없습니다.</li>
                )}
            </ul>

            <div className="mt-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-2 rounded-lg bg-[#fff] border-[#1c292e] text-[#000] text-[12px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 "
                    placeholder="메세지를 입력하세요."
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
