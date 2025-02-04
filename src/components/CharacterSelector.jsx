// 리액트 훅
import React, { useState, useContext } from 'react';
import { MediaQueryContext } from '../Context/MediaQueryContext';

// 모바일  스와이프
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// 아바타 이미지
import mimo1 from '../assets/mimo1.gif';
import mimo2 from '../assets/mimo2.gif';

const CharacterSelector = ({ selectedCharacter, setSelectedCharacter, nickname }) => {
    // 반응형
    const { isMobile } = useContext(MediaQueryContext);
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
    // 모바일 스와이퍼 세팅
    const MobSwiperSetting = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: true,
    };
    return (
        <>
            {isMobile && (
                <div
                    className={`flex overflow-hidden shadow-xl bg-opacity-80 mt-5 w-full Pretendard-r  ${
                        isMobile ? 'p-[0rem]' : 'p-[2rem]'
                    } `}
                >
                    <Slider {...MobSwiperSetting} className="w-full">
                        {characters.map((char) => {
                            const isSelected = selectedCharacter?.id === char.id;
                            return (
                                <div key={char.id} className="flex items-center justify-center p-4">
                                    <button
                                        onClick={() => handleClick(char)}
                                        className={`w-full h-full flex items-center justify-center bg-[#f5f5f5] rounded-lg ${
                                            isSelected ? 'bg-[#d6e1ff]' : ' bg-[#f5f5f5]'
                                        }`}
                                    >
                                        <div className="flex flex-col justify-center items-center text-center">
                                            <img
                                                src={char.avatar}
                                                alt={char.name}
                                                className="avatar w-[90%] h-[90%] object-cover"
                                            />
                                            <h2 className="text-[1.2rem] font-extrabold text-[#000] truncate w-full p-[5px]">
                                                {isSelected ? nickname : char.name || 'Anonymous'}
                                            </h2>
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </Slider>
                </div>
            )}
            {!isMobile && (
                <div className="flex overflow-hidden shadow-xl bg-opacity-80 mt-5 w-full Pretendard-r p-2">
                    {characters.map((char) => {
                        const isSelected = selectedCharacter?.id === char.id;

                        return (
                            <button
                                key={char.id}
                                onClick={() => handleClick(char)}
                                className={`w-[48%] h-full flex transition-all duration-500 justify-center items-center relative p-4 m-[1%] ${
                                    isSelected ? 'bg-[#d6e1ff]' : 'blur-[1px] bg-[#f5f5f5]'
                                } hover:scale-105 rounded-lg transform`}
                            >
                                <div className="flex flex-col justify-center items-center text-center">
                                    <img
                                        src={char.avatar}
                                        alt={char.name}
                                        className="avatar w-[90%] h-[90%] object-cover opacity-100 hover:opacity-100"
                                    />
                                    <h2 className="text-[20px] font-extrabold tracking-wide text-[#000] font_suite truncate">
                                        {isSelected ? nickname : char.name || 'Anonymous'}
                                    </h2>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default CharacterSelector;
