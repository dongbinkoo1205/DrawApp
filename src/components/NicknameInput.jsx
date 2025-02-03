import CharacterSelector from './CharacterSelector';
import React, { useState } from 'react';

const NicknameInput = ({ onSubmit, selectedCharacter, setSelectedCharacter }) => {
    const [nickname, setNickname] = useState('');

    const handleSubmit = () => {
        // 닉네임과 캐릭터 선택이 완료되면 전송
        if (nickname.trim() && selectedCharacter) {
            onSubmit(nickname);
        } else {
            alert('그룹 채팅에 사용하실 닉네임을 입력해주세요.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
            <h1 className="text-2xl font-bold mb-4">Select Your Character</h1>
            <CharacterSelector selectedCharacter={selectedCharacter} setSelectedCharacter={setSelectedCharacter} />
            <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your nickname"
                className="p-2 rounded-lg text-black mb-4"
            />
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Join Meeting
            </button>
        </div>
    );
};

export default NicknameInput;
