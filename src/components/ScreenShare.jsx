import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import logo from '../assets/logo.png';
import Chat from './Chat';

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
    const [isSharing, setIsSharing] = useState(false);
    const [messages, setMessages] = useState([]);
    const videoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);
    const [participants, setParticipants] = useState(0); // 참여자들 선언

    useEffect(() => {
        socket.on('screen-share-started', handleRemoteScreenShare);
        socket.on('screen-share-stopped', stopRemoteScreenShare);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);
        socket.on('chat-message', (data) => {
            setMessages((prev) => [...prev, data]);
        });
        socket.on('participants-update', (count) => {
            setParticipants(count); // 참여자 수 업데이트
        });

        return () => {
            socket.off('screen-share-started');
            socket.off('screen-share-stopped');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('chat-message');
            // 컴포넌트 언마운트 시 이벤트 해제
            socket.off('participants-update');
        };
    }, []);

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
                        <h3 className="text-lg font-semibold">Participants {participants}</h3>
                    </div>
                    <ul className="text-sm space-y-2 mb-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                        <li className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg">
                            <span className="w-8 h-8 rounded-full bg-gray-500"></span>
                            <span className="flex-1 font-semibold text-white">Laura Williams</span>
                            <span className="text-gray-400 text-xs">🔊</span>
                        </li>
                    </ul>
                    <Chat messages={messages} onSendMessage={sendMessage} />
                </div>
            </div>
        </div>
    );
};

export default ScreenShare;
