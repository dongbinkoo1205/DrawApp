import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import logo from '../assets/logo.png';
import Chat from './Chat';

const socket = io('https://drawapp-ne15.onrender.com');
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
    const [isSharing, setIsSharing] = useState(false);
    const [messages, setMessages] = useState([]);
    const videoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        // 닉네임 입력 및 서버로 전송
        const nickname = prompt('Enter your nickname:') || 'Anonymous';
        socket.emit('join', nickname);

        // 참여자 목록 수신
        socket.on('participants-update', (data) => {
            setParticipants(data);
        });

        // Offer 수신 및 WebRTC 연결 설정
        socket.on('screen-share-started', async (offer) => {
            if (peerConnection.current) {
                peerConnection.current.close(); // 기존 연결 종료
            }

            // 새 PeerConnection 초기화
            peerConnection.current = new RTCPeerConnection({ iceServers });

            // 수신 트랙 처리
            peerConnection.current.ontrack = (event) => {
                videoRef.current.srcObject = event.streams[0]; // 공유된 화면 표시
            };

            // ICE Candidate 이벤트 처리
            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', event.candidate); // 서버로 전송
                }
            };

            // Offer 처리 및 Answer 생성
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.emit('answer', answer); // Answer 전송
        });

        // ICE Candidate 수신 및 추가
        socket.on('ice-candidate', (candidate) => {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        });

        // 클린업: 이벤트 리스너 해제
        return () => {
            socket.off('screen-share-started');
            socket.off('participants-update');
            socket.off('ice-candidate');
        };
    }, []);

    const startScreenShare = async () => {
        try {
            localStream.current = await navigator.mediaDevices.getDisplayMedia({ video: true });
            videoRef.current.srcObject = localStream.current;

            if (peerConnection.current) {
                peerConnection.current.close();
            }

            // PeerConnection 설정 및 트랙 추가
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
            socket.emit('start-screen-share', offer); // 서버로 Offer 전송

            setIsSharing(true);
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

    const sendMessage = (message) => {
        socket.emit('chat-message', message);
    };

    return (
        <div className="min-h-screen max-h-[100vh] flex flex-col p-4 bg-gray-900 text-white font_minsans">
            <header className="h-[70px] p-4 bg-gray-800 shadow-lg flex items-center justify-between rounded-lg mb-4">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-contain" />
                    <h2 className="text-2xl text-white hana">LinkUp</h2>
                </div>
                <button
                    onClick={isSharing ? stopScreenShare : startScreenShare}
                    className={
                        isSharing
                            ? 'px-5 py-2 bg-red-600 hover:bg-red-700 transition-colors text-white font-semibold rounded-lg'
                            : 'px-5 py-2 bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold rounded-lg'
                    }
                >
                    {isSharing ? 'Stop Meeting' : 'Start Meeting'}
                </button>
            </header>

            <div className="flex flex-1 justify-between overflow-hidden gap-4">
                <video
                    style={{ height: 'calc(100vh - 70px)' }}
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-[78%] h-full bg-black rounded-lg shadow-lg"
                ></video>

                <div className="bg-gray-800 shadow-lg rounded-lg p-4 w-[21%] flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">On The Call {participants.length}</h3>
                    </div>
                    <ul className="text-sm space-y-2 mb-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                        {participants.map((participant) => (
                            <li key={participant.id} className="p-2 bg-gray-700 rounded-lg">
                                {participant.nickname}
                            </li>
                        ))}
                    </ul>
                    <Chat messages={messages} onSendMessage={sendMessage} />
                </div>
            </div>
        </div>
    );
};

export default ScreenShare;
