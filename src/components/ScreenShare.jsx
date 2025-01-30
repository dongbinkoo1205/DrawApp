import React, { useEffect, useRef, useState } from 'react';
import { Buffer } from 'buffer';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import DrawingCanvas from './DrawCanvas';
import ChatBox from './ChatBox';

window.Buffer = Buffer;

const socket = io('https://drawapp-ne15.onrender.com', {
    transports: ['websocket'],
    path: '/socket.io/',
});

function ScreenShare() {
    const [peerId, setPeerId] = useState('');
    const [isInitiator, setIsInitiator] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const videoRef = useRef();
    const remoteVideoRef = useRef();
    const peerRef = useRef();

    useEffect(() => {
        socket.on('connect', () => {
            setPeerId(socket.id);
            const queryParams = new URLSearchParams(window.location.search);
            console.log('[CLIENT] 소켓 연결 성공:', socket.id);

            const roomId = queryParams.get('room') || socket.id;
            socket.emit('join-room', roomId);

            if (!queryParams.get('room')) {
                window.history.replaceState(null, '', `?room=${roomId}`);
                setIsInitiator(true);
            }

            initiatePeerConnection(roomId);
        });

        socket.on('signal', (data) => {
            console.log('[CLIENT] 신호 수신:', data);
            if (peerRef.current) {
                peerRef.current.signal(data.signal);
            } else {
                console.error('[CLIENT] Peer 객체가 존재하지 않음.');
            }
        });

        socket.on('sharing-started', ({ sharer }) => {
            console.log('[CLIENT] 화면 공유 시작 알림 수신:', sharer);
        });

        socket.on('connect_error', (error) => {
            console.error('[CLIENT] 소켓 연결 오류:', error);
        });

        return () => {
            socket.off('connect');
            socket.off('signal');
            socket.off('sharing-started');
        };
    }, []);

    const initiatePeerConnection = (roomId) => {
        const peer = new SimplePeer({
            initiator: isInitiator,
            trickle: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    {
                        urls: 'turn:relay.metered.ca:80',
                        credential: 'public',
                        username: 'public',
                    },
                ],
                iceTransportPolicy: 'relay', // TURN 서버 강제 사용
            },
        });

        peer.on('signal', (signal) => {
            console.log('[DEBUG] 신호 생성:', signal);
            // offer 또는 answer 신호가 생성되는지 확인
            if (signal.type === 'offer' || signal.type === 'answer') {
                console.log(`[DEBUG] 신호 타입: ${signal.type}`);
            }
            socket.emit('signal', { to: roomId, signal });
        });

        peer.on('iceCandidate', (candidate) => {
            if (candidate) {
                console.log('[CLIENT] ICE 후보 생성:', candidate);
                socket.emit('signal', { to: roomId, signal: { candidate } });
            } else {
                console.warn('[CLIENT] ICE 후보가 생성되지 않음');
            }
        });
        peer.on('connect', () => {
            console.log('[CLIENT] P2P 연결 성공');
        });

        peer.on('error', (err) => {
            console.error('[CLIENT] P2P 연결 오류:', err);
        });

        peerRef.current = peer;
    };

    const startScreenShare = async () => {
        if (isSharing) {
            alert('이미 화면을 공유 중입니다.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            console.log('[CLIENT] 화면 공유 스트림 가져옴:', stream);
            videoRef.current.srcObject = stream;
            setIsSharing(true);

            socket.emit('start-sharing', peerId);

            if (peerRef.current) {
                peerRef.current.addStream(stream);
                console.log('[CLIENT] 스트림이 P2P 연결에 추가됨');
            }

            stream.getVideoTracks()[0].onended = () => {
                console.log('[CLIENT] 화면 공유가 중단됨');
                setIsSharing(false);
                socket.emit('stop-sharing');
            };
        } catch (error) {
            console.error('[CLIENT] 화면 공유 중 오류 발생:', error);
        }
    };

    return (
        <div className="flex h-screen flex-col bg-gray-900 text-white">
            <header className="flex items-center justify-between p-4 bg-gray-800">
                <h1 className="text-xl font-bold">화면 공유</h1>
                <button onClick={startScreenShare} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
                    화면 공유 시작
                </button>
            </header>

            <main className="flex-grow flex">
                <div className="relative flex-1">
                    <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                    <DrawingCanvas socket={socket} />
                </div>
                <div className="relative flex-1">
                    <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover" />
                </div>

                <ChatBox socket={socket} />
            </main>
        </div>
    );
}

export default ScreenShare;
