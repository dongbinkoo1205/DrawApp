// components/ScreenShare.jsx
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import DrawingCanvas from './DrawCanvas';
import ChatBox from './ChatBox';

const socket = io('https://drawapp-ne15.onrender.com', {
    transports: ['websocket'],
});

function ScreenShare() {
    const [peerId, setPeerId] = useState('');
    const [isInitiator, setIsInitiator] = useState(false);
    const [isSharing, setIsSharing] = useState(false); // 화면 공유 상태 관리
    const videoRef = useRef();
    const remoteVideoRef = useRef();
    const peerRef = useRef();

    useEffect(() => {
        socket.on('connect', () => {
            setPeerId(socket.id);
            const queryParams = new URLSearchParams(window.location.search);

            if (!queryParams.get('room')) {
                window.history.replaceState(null, '', `?room=${socket.id}`);
                setIsInitiator(true);
            } else {
                initiatePeerConnection(queryParams.get('room'));
            }
        });

        socket.on('signal', (data) => {
            peerRef.current?.signal(data.signal);
        });

        socket.on('sharing-status', (status) => {
            if (!status) {
                alert('다른 사용자가 이미 화면을 공유하고 있습니다.');
                setIsSharing(false);
            }
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
        });

        peer.on('stream', (stream) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
        });

        peerRef.current = peer;
    };

    const startScreenShare = async () => {
        if (isSharing) {
            alert('이미 화면을 공유 중입니다.');
            return;
        }

        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        videoRef.current.srcObject = stream;
        setIsSharing(true);

        socket.emit('start-sharing', peerId); // 서버에 화면 공유 시작 알림

        if (peerRef.current) {
            peerRef.current.addStream(stream);
        }

        stream.getVideoTracks()[0].onended = () => {
            setIsSharing(false);
            socket.emit('stop-sharing'); // 화면 공유 중단 알림
        };
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
