import CharacterSelector from './CharacterSelector';
import React, { useState } from 'react';
import './NicknameInput.css';

const NicknameInput = ({ onSubmit, selectedCharacter, setSelectedCharacter }) => {
    const [nickname, setNickname] = useState('');

    const handleSubmit = () => {
        // 닉네임과 캐릭터 선택이 완료되면 전송
        if (nickname.trim() && selectedCharacter) {
            onSubmit(nickname);
        } else {
            alert('채팅 참여를 위해서는 캐릭터 선택과 닉네임이 필요합니다!');
        }
    };

    return (
        <div className="modalPop w-full h-full  absolute top-0 left-0  h-auto z-10 flex items-center justify-center Pretendard-r">
            <div className="flex flex-col items-center justify-around min-h-70 text-white  bg-black w-[55%]  p-15 rounded-xl z-10  p-9">
                <h1 className="text-2xl self-baseline Pretendard-b">
                    Participation
                    <span className="mt-3 text-base block Pretendard-r">
                        채팅에서 사용할 캐릭터와 이름을 입력해주세요.
                    </span>
                </h1>
                <CharacterSelector
                    selectedCharacter={selectedCharacter}
                    setSelectedCharacter={setSelectedCharacter}
                    nickname={nickname}
                />
                <div className="customInputWrap mt-8 flex flex-col items-center space-y-4">
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault(); // 기본 동작 방지
                                handleSubmit();
                            }
                        }}
                        className="customInput border-none "
                    />
                    <label style={{ opacity: nickname ? '0' : '1' }}>Nickname</label>
                </div>
                <span className="mt-5 block self-end" style={{ color: nickname ? 'lightgreen' : 'red' }}>
                    {nickname ? 'Enter로 참여하기' : '닉네임을 입력해주세요'}
                </span>
            </div>
        </div>
    );
};

export default NicknameInput;
