// components/ScreenShare.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Buffer } from 'buffer';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import DrawingCanvas from './DrawCanvas';
import ChatBox from './ChatBox';
window.Buffer = Buffer; // 브라우저 환경에 Buffer 전역 객체 설정
const socket = io('https://drawapp-ne15.onrender.com', {
    transports: ['websocket'],
    path: '/socket.io/', // 서버와 경로 일치시킴
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
            console.log('소켓 연결 성공:', socket.id);

            if (!queryParams.get('room')) {
                window.history.replaceState(null, '', `?room=${socket.id}`);
                setIsInitiator(true);
            } else {
                initiatePeerConnection(queryParams.get('room'));
            }
        });

        socket.on('signal', (data) => {
            peerRef.current?.signal(data.signal);
            console.log('신호 데이터 수신:', data);
        });

        socket.on('sharing-status', (status) => {
            if (!status) {
                alert('다른 사용자가 이미 화면을 공유하고 있습니다.');
                setIsSharing(false);
            }
        });

        socket.on('connect_error', (error) => {
            console.error('소켓 연결 오류:', error);
        });

        return () => {
            socket.off('connect');
            socket.off('signal');
            socket.off('sharing-status');
        };
    }, []);

    const initiatePeerConnection = (roomId) => {
        const peer = new SimplePeer({
            initiator: isInitiator,
            trickle: false,
            stream: null,
        });

        peer.on('signal', (signal) => {
            socket.emit('signal', { to: roomId, signal });
            console.log('signal 이벤트 전송:', { to: roomId, signal });
        });

        peer.on('stream', (stream) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
        });

        peer.on('connect', () => {
            console.log('P2P 연결 성공');
        });

        peer.on('error', (err) => {
            console.error('P2P 연결 오류:', err);
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
            console.log('화면 공유 스트림 가져옴:', stream); // 스트림 확인
            videoRef.current.srcObject = stream;
            setIsSharing(true);

            socket.emit('start-sharing', peerId);

            if (peerRef.current) {
                peerRef.current.addStream(stream);
                console.log('스트림이 P2P 연결에 추가됨'); // 스트림 추가 확인
            }

            stream.getVideoTracks()[0].onended = () => {
                console.log('화면 공유가 중단됨');
                setIsSharing(false);
                socket.emit('stop-sharing');
            };
        } catch (error) {
            console.error('화면 공유 중 오류 발생:', error);
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
