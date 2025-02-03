import React, { useState } from 'react';
import mimo1 from '../assets/mimo1.gif';
import mimo2 from '../assets/mimo2.gif';

const CharacterSelector = ({ selectedCharacter, setSelectedCharacter, nickname }) => {
    const [characters, setCharacters] = useState([
        { id: 'char1', avatar: mimo1, name: '' },
        { id: 'char2', avatar: mimo2, name: '' },
    ]);

    const handleClick = (char) => {
        // 선택된 캐릭터의 name을 nickname으로 설정한 새 객체 생성
        const updatedCharacter = { ...char, name: nickname };
        // 캐릭터 상태 업데이트
        setCharacters(characters);
        // 선택된 캐릭터 상태를 업데이트
        setSelectedCharacter(updatedCharacter);
    };
    return (
        <div className="flex overflow-hidden shadow-xl bg-opacity-80 mt-5 w-full">
            {characters.map((char) => {
                const isSelected = selectedCharacter?.id === char.id;

                return (
                    <button
                        key={char.id}
                        onClick={() => handleClick(char)}
                        className={`w-[48%] h-full flex transition-all duration-500 justify-center items-center relative p-4 m-[1%] ${
                            selectedCharacter?.id === char.id
                                ? 'bg-gradient-to-br from-blue-500 to-purple-800'
                                : 'bg-black'
                        } hover:scale-105  rounded-lg  transform`}
                    >
                        <div className="flex flex-col justify-center items-center text-center">
                            <img
                                src={char.avatar}
                                alt={char.name}
                                className="avatar w-[80%] h-[80%] object-cover opacity-90 hover:opacity-100"
                            />
                            <h2 className=" text-2xl font-extrabold tracking-wide text-white">
                                {isSelected ? nickname : char.name || 'Anonymous'}
                            </h2>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default CharacterSelector;
