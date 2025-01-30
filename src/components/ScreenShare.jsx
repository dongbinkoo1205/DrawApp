import React, { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';
import ChatBox from './ChatBox';
import DrawCanvas from './DrawCanvas';

function ScreenShare() {
    const [peerId, setPeerId] = useState('');
    const [remoteStream, setRemoteStream] = useState(null);
    const videoRef = useRef();
    const remoteVideoRef = useRef();
    const peerRef = useRef();

    useEffect(() => {
        const peer = new Peer({
            host: 'localhost',
            port: 5000,
            path: '/peerjs',
            config: {
                iceServers: [{ url: 'stun:stun.l.google.com:19302' }],
            },
        });

        peer.on('open', (id) => {
            setPeerId(id);
            const queryParams = new URLSearchParams(window.location.search);
            if (!queryParams.get('room')) {
                window.history.replaceState(null, '', `?room=${id}`);
            }
        });

        peer.on('call', (call) => {
            call.answer();
            call.on('stream', (stream) => {
                setRemoteStream(stream);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = stream;
                }
            });
        });

        peerRef.current = peer;

        return () => peer.destroy();
    }, []);

    const startScreenShare = async () => {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        videoRef.current.srcObject = stream;

        const queryParams = new URLSearchParams(window.location.search);
        const roomId = queryParams.get('room');
        if (roomId) {
            const call = peerRef.current.call(roomId, stream);
            call.on('close', () => console.log('통화 종료'));
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
                {/* 내 화면 미리보기 */}
                <div className="relative flex-1">
                    <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                    <DrawCanvas />
                </div>

                {/* 상대방 화면 */}
                {remoteStream && (
                    <div className="flex-1 relative">
                        <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover" />
                    </div>
                )}

                <ChatBox peer={peerRef.current} />
            </main>
        </div>
    );
}

export default ScreenShare;
