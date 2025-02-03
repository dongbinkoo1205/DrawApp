import React from 'react';
import mimo1 from '../assets/mimo1.gif';
import mimo2 from '../assets/mimo2.gif';

const characters = [
    { id: 'char1', avatar: mimo1 },
    { id: 'char2', avatar: mimo2 },
];

const CharacterSelector = ({ selectedCharacter, setSelectedCharacter }) => {
    const handleClick = (char) => {
        setSelectedCharacter(char); // 선택된 캐릭터 상태 설정
    };

    return (
        <div className="flex rounded-lg overflow-hidden shadow-xl bg-opacity-80">
            {characters.map((char) => (
                <button
                    key={char.id}
                    onClick={() => handleClick(char)}
                    className={`w-1/2 h-full flex transition-all duration-500 justify-center items-center relative ${
                        selectedCharacter?.id === char.id ? 'bg-gradient-to-br from-blue-500 to-purple-800' : 'bg-black'
                    } hover:scale-105 transform`}
                >
                    <div className="flex flex-col justify-center items-center px-8 text-center">
                        <img
                            src={char.avatar}
                            alt={char.name}
                            className="w-71 h-71 object-contain mb-4 opacity-90 hover:opacity-100"
                        />
                        <h2 className="text-3xl font-extrabold tracking-wide text-white">{char.name}</h2>
                    </div>
                    {/* <div className="absolute inset-0  from-blue-600 to-purple-800 opacity-20 mix-blend-overlay pointer-events-none"></div> */}
                </button>
            ))}
        </div>
    );
};

export default CharacterSelector;
