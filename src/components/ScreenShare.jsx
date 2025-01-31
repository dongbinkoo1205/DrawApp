import Peer from 'peerjs';
import React, { useEffect, useRef, useState } from 'react';

// 사용자 정의 STUN/TURN 서버 정보
const iceServers = [
    {
        urls: 'stun:stun.relay.metered.ca:80',
    },
    {
        urls: 'turn:global.relay.metered.ca:80',
        username: '0e7b1f0cd385987cbf443ba6',
        credential: 'CgDOWoNDYeHJSP/f',
    },
];

export default function ScreenShare() {
    const [peerId, setPeerId] = useState(null);
    const [remotePeerId, setRemotePeerId] = useState('');
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const peerRef = useRef(null);

    // 화면 공유 시작 함수
    const startScreenShare = async () => {
        console.log('Starting screen share...');

        // Peer 연결 설정
        const peer = new Peer({
            host: 'drawapp-ne15.onrender.com',
            port: 443,
            path: '/peerjs', // 경로 명확히 설정
            secure: true,
            config: { iceServers },
        });

        peerRef.current = peer;

        // PeerJS 이벤트 처리
        peer.on('open', (id) => {
            console.log('PeerJS ID:', id);
            setPeerId(id);
        });

        peer.on('call', (call) => {
            call.answer();
            call.on('stream', (remoteStream) => {
                console.log('Received remote stream');
                remoteStreamRef.current.srcObject = remoteStream;
            });
        });

        // 화면 공유 미디어 스트림 가져오기
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        localStreamRef.current.srcObject = stream;

        console.log('Local stream acquired. Waiting for remote peer...');
    };

    // 원격 피어에 통화 요청 함수
    const makeCall = () => {
        if (!peerRef.current || !remotePeerId) return;

        const stream = localStreamRef.current.srcObject;
        const call = peerRef.current.call(remotePeerId, stream);

        call.on('stream', (remoteStream) => {
            console.log('Received remote stream from peer');
            remoteStreamRef.current.srcObject = remoteStream;
        });

        console.log('Calling remote peer:', remotePeerId);
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-200">
            <video ref={localStreamRef} autoPlay muted playsInline className="w-1/2 h-64 rounded-lg shadow" />
            <video ref={remoteStreamRef} autoPlay playsInline className="w-1/2 h-64 rounded-lg shadow ml-4" />

            <button
                onClick={startScreenShare}
                className="absolute top-4 right-4 px-4 py-2 rounded-lg font-semibold bg-green-500 hover:bg-green-600"
            >
                Start Screen Sharing
            </button>

            <div className="absolute bottom-4 left-4 p-4 bg-white rounded-lg shadow">
                <p>My Peer ID: {peerId || 'Not connected'}</p>
                <input
                    type="text"
                    placeholder="Enter remote peer ID"
                    value={remotePeerId}
                    onChange={(e) => setRemotePeerId(e.target.value)}
                    className="border p-2 rounded w-full mt-2"
                />
                <button onClick={makeCall} className="mt-2 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white">
                    Call Remote Peer
                </button>
            </div>
        </div>
    );
}
