import React from 'react';
import mimo1 from '../assets/mimo1.gif';
import mimo2 from '../assets/mimo2.gif';

const characters = [
    { id: 'char1', avatar: mimo1, name: 'Character 1' },
    { id: 'char2', avatar: mimo2, name: 'Character 2' },
];

const CharacterSelector = ({ selectedCharacter, setSelectedCharacter }) => {
    const handleClick = (char) => {
        setSelectedCharacter(char); // 선택된 캐릭터 상태 설정
    };

    return (
        <div className="flex w-full h-screen">
            {characters.map((char) => (
                <button
                    key={char.id}
                    onClick={() => handleClick(char)}
                    className={`w-1/2 h-full flex transition-all duration-300  justify-center items-center ${
                        selectedCharacter?.id === char.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                >
                    <div className="flex flex-col justify-center items-center px-8 text-center">
                        <img src={char.avatar} alt={char.name} className="w-60 h-60 object-contain mb-4" />
                        <h2 className="text-4xl font-bold">{char.name}</h2>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default CharacterSelector;
