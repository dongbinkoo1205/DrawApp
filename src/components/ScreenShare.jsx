import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import logo from '../assets/logo.png';
import Chat from './Chat';
import NicknameInput from './NicknameInput';
import './ScreenShare.css';
import './Mediaquery.css';

// server
// const socket = io('https://drawapp-ne15.onrender.com');
const socket = io('http://localhost:8080');

const iceServers = [
    { urls: 'stun:stun.relay.metered.ca:80' },
    {
        urls: 'turns:global.relay.metered.ca:443?transport=tcp',
        username: '0e7b1f0cd385987cbf443ba6',
        credential: 'CgDOWoNDYeHJSP/f',
    },
    {
        urls: 'turn:global.relay.metered.ca:443',
        username: '0e7b1f0cd385987cbf443ba6',
        credential: 'CgDOWoNDYeHJSP/f',
    },
];

const ScreenShare = () => {
    // State
    const [isSharing, setIsSharing] = useState(false);
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]); // 참여자들
    const [nickname, setNickname] = useState('');
    const [isNicknameSet, setIsNicknameSet] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    // Ref
    const videoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);

    useEffect(() => {
        socket.on('screen-share-started', handleRemoteScreenShare);
        socket.on('screen-share-stopped', stopRemoteScreenShare);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);
        socket.on('chat-message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        socket.on('participants-update', (data) => {
            setParticipants(data);
        });

        return () => {
            socket.off('screen-share-started');
            socket.off('screen-share-stopped');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('chat-message');
            socket.off('participants-update');
        };
    }, []);
    const handleNicknameSubmit = (nicknameInput) => {
        const nicknameData = {
            avatar: selectedCharacter.avatar, // 아바타 이미지 경로
            nickname: nicknameInput, // 입력한 닉네임
        };
        setNickname(nicknameData);
        setIsNicknameSet(true);
        socket.emit('join', nicknameData); // 객체 형태로 데이터 전송
    };

    const startScreenShare = async () => {
        try {
            localStream.current = await navigator.mediaDevices.getDisplayMedia({ video: true });
            videoRef.current.srcObject = localStream.current;

            if (peerConnection.current) {
                peerConnection.current.close();
            }

            peerConnection.current = new RTCPeerConnection({ iceServers });
            localStream.current
                .getTracks()
                .forEach((track) => peerConnection.current.addTrack(track, localStream.current));

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', event.candidate);
                }
            };

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.emit('offer', offer);

            setIsSharing(true);
            socket.emit('start-screen-share');
        } catch (error) {
            console.error('Error starting screen share:', error);
        }
    };

    const stopScreenShare = () => {
        localStream.current.getTracks().forEach((track) => track.stop());
        peerConnection.current.close();
        socket.emit('stop-screen-share');
        setIsSharing(false);
    };

    const handleRemoteScreenShare = (sharerId) => {
        console.log('Screen share started by:', sharerId);
    };

    const stopRemoteScreenShare = () => {
        console.log('Remote screen share stopped');
    };

    const handleOffer = async (offer) => {
        if (peerConnection.current) {
            peerConnection.current.close();
        }

        peerConnection.current = new RTCPeerConnection({ iceServers });
        peerConnection.current.ontrack = (event) => {
            videoRef.current.srcObject = event.streams[0];
        };

        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('answer', answer);
    };

    const handleAnswer = async (answer) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIceCandidate = (candidate) => {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const sendMessage = (text) => {
        const message = {
            senderId: socket.id,
            avatar: nickname.avatar,
            nickname: nickname.nickname,
            text: text,
        };
        socket.emit('chat-message', message); // 메시지 전송
    };

    return (
        <div className="mainWrap min-h-screen max-h-[100vh] flex flex-col p-4 bg-[#f6f7fb]  text-[#1c292e] Pretendard-r">
            {!isNicknameSet && (
                <NicknameInput
                    onSubmit={handleNicknameSubmit}
                    selectedCharacter={selectedCharacter}
                    setSelectedCharacter={setSelectedCharacter}
                />
            )}
            <header className="h-[70px] p-4 bg-[#f4f8fb] shadow-md flex items-center justify-between rounded-lg mb-4">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="ballon">
                        <img src={logo} alt="Logo" className="w-[2.8em] h-[2.8em] rounded-full object-contain" />
                    </span>
                    <h2 className="text-2xl text-[#1c292e] font_NEXON self-start relative">
                        CollabLive
                        <span className="w-[100%] whitespace-nowrap bottom-[-20px] left-[2px] block text-[11px] Pretendard-r absolute">
                            협력의 새로운 방식 컬랩라이브
                        </span>
                    </h2>
                </div>
                <button
                    onClick={isSharing ? stopScreenShare : startScreenShare}
                    className={
                        isSharing
                            ? 'px-5 py-2 bg-red-600 hover:bg-red-700 transition-colors text-white font-bold rounded-lg Pretendard-r'
                            : 'px-5 py-2 bg-[#004cfb] hover:bg-green-700 transition-colors text-white font-bold rounded-lg Pretendard-r '
                    }
                >
                    {isSharing ? '화면 공유 나가기' : '실시간 화면 공유'}
                </button>
            </header>

            <div className="mediaWrap flex flex-1 justify-between overflow-hidden gap-4 shadow-md">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="mediaVideo w-[72%] bg-[#f1f4fb] rounded-lg shadow-md h-[calc(100vh-70px)] "
                ></video>

                <div className="mediaChat bg-[#f8fbfc] shadow-md rounded-lg p-4 w-[27%] flex flex-col scrollbar-custom overflow-y-scroll overflow-y-scroll overflow-x-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Participants - {participants.length}</h3>
                    </div>
                    <ul className="text-sm space-y-2 mb-6 ">
                        {participants.map((participant) => (
                            <li key={participant.id} className="w-full p-2 bg-[#d6e3fd] rounded-lg shadow-md">
                                <span className="flex items-center  ">
                                    <span className="avatar mr-[7px] Pretendard-b">
                                        <img
                                            className="w-[40px] h-[40px] object-cover "
                                            src={participant.avatar}
                                            alt=""
                                        />
                                    </span>
                                    <span className="truncate font-medium">{participant.nickname}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                    <Chat messages={messages} participants={participants} onSendMessage={sendMessage} />
                </div>
            </div>
        </div>
    );
};

export default ScreenShare;
