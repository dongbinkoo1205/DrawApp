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

const turnServers = [
    {
        urls: 'stun:stun.relay.metered.ca:80',
    },
    {
        urls: 'turn:global.relay.metered.ca:80',
        username: '0e7b1f0cd385987cbf443ba6',
        credential: 'CgDOWoNDYeHJSP/f',
    },
    {
        urls: 'turn:global.relay.metered.ca:80?transport=tcp',
        username: '0e7b1f0cd385987cbf443ba6',
        credential: 'CgDOWoNDYeHJSP/f',
    },
    {
        urls: 'turn:global.relay.metered.ca:443',
        username: '0e7b1f0cd385987cbf443ba6',
        credential: 'CgDOWoNDYeHJSP/f',
    },
    {
        urls: 'turns:global.relay.metered.ca:443?transport=tcp',
        username: '0e7b1f0cd385987cbf443ba6',
        credential: 'CgDOWoNDYeHJSP/f',
    },
    {
        urls: 'turn:global.relay.metered.ca:80',
        username: '343eb39487289852d9d44d25',
        credential: 'gqBMF/Igc81vlkJN',
    },
    {
        urls: 'turn:global.relay.metered.ca:443',
        username: '343eb39487289852d9d44d25',
        credential: 'gqBMF/Igc81vlkJN',
    },
];

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

            initiatePeerConnectionWithFallback(roomId);
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

    const initiatePeerConnectionWithFallback = async (roomId) => {
        for (let i = 0; i < turnServers.length; i++) {
            console.log(`[DEBUG] 시도 중인 TURN 서버: ${turnServers[i].urls}`);

            if (peerRef.current) {
                peerRef.current.destroy();
            }

            const peer = new SimplePeer({
                initiator: isInitiator,
                trickle: true,
                config: {
                    iceServers: [turnServers[i]],
                    iceTransportPolicy: 'relay',
                },
            });

            peer.on('signal', (signal) => {
                console.log('[DEBUG] 신호 생성:', signal);
                if (signal.type === 'offer' || signal.type === 'answer') {
                    console.log(`[DEBUG] 신호 타입: ${signal.type}`);
                }
                socket.emit('signal', { to: roomId, signal });
            });

            let candidateFound = false;

            // 이벤트 이름을 ice로 수정
            peer.on('ice', (candidate) => {
                if (candidate) {
                    console.log('[CLIENT] ICE 후보 생성:', candidate);
                    candidateFound = true;
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

            await new Promise((resolve) => setTimeout(resolve, 10000)); // 대기 시간 10초로 증가

            if (candidateFound) {
                console.log(`[INFO] 성공적인 TURN 서버: ${turnServers[i].urls}`);
                return;
            } else {
                console.warn(`[WARN] TURN 서버 실패: ${turnServers[i].urls}`);
                peer.destroy();
            }
        }

        console.error('[ERROR] 모든 TURN 서버 연결 실패');
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
