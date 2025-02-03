import React from 'react';

const characters = [
    { id: 'char1', name: 'Warrior', avatar: '🛡️' },
    { id: 'char2', name: 'Archer', avatar: '🏹' },
];

const CharacterSelector = ({ selectedCharacter, setSelectedCharacter }) => {
    return (
        <div className="flex gap-4 mb-6">
            {characters.map((char) => (
                <button
                    key={char.id}
                    onClick={() => setSelectedCharacter(char)}
                    className={`p-4 rounded-lg text-xl border-2 ${
                        selectedCharacter?.id === char.id ? 'border-blue-500' : 'border-gray-500'
                    }`}
                >
                    {char.avatar} {char.name}
                </button>
            ))}
        </div>
    );
};

export default CharacterSelector;
