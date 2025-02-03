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
                    className={`w-1/2 h-full flex flex-col items-center justify-center gap-4 p-6 transition-all duration-300 ${
                        selectedCharacter?.id === char.id ? 'bg-blue-200' : 'bg-gray-100'
                    }`}
                >
                    <img src={char.avatar} alt={char.name} className="w-40 h-40 object-contain" />
                    <h2 className="text-xl font-bold">{char.name}</h2>
                </button>
            ))}
        </div>
    );
};

export default CharacterSelector;
