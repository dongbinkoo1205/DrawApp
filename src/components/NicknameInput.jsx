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
        <div className="w-full h-full  absolute top-0 left-0  h-auto z-10 flex items-center justify-center">
            <div className="flex flex-col items-center justify-around min-h-70 text-white  bg-black w-[90%] h-70p p-15 rounded-lg">
                <h1 className="text-2xl font-bold self-baseline">
                    Participation
                    <span className="text-small block">채팅에서 사용할 캐릭터와 이름을 입력해주세요.</span>
                </h1>
                <CharacterSelector selectedCharacter={selectedCharacter} setSelectedCharacter={setSelectedCharacter} />
                <div>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임을 입력해주세요."
                        className="p-2 rounded-lg text-black "
                    />
                    <button onClick={handleSubmit} className="px-4 py-2  text-white rounded-lg">
                        참여하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NicknameInput;
