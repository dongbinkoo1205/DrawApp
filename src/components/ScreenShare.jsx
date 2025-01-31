import Peer from 'peerjs';
import React, { useRef, useState } from 'react';

// TURN 서버 정보를 API에서 가져오는 함수
async function getTurnServerCredentials() {
    try {
        const response = await fetch(
            'https://drawapp.metered.live/api/v1/turn/credentials?apiKey=cf0149014300f0ed0227a5c137636795ce6e'
        );

        if (!response.ok) {
            throw new Error('Failed to fetch TURN server credentials');
        }

        const iceServers = await response.json();
        console.log('Fetched TURN server credentials:', iceServers);
        return iceServers;
    } catch (error) {
        console.error('Error fetching TURN server credentials:', error);
        return [{ urls: 'stun:stun.l.google.com:19302' }];
    }
}

export default function ScreenShare() {
    const [peerId, setPeerId] = useState(null);
    const [remotePeerId, setRemotePeerId] = useState('');
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const peerRef = useRef(null);

    const startScreenShare = async () => {
        console.log('Starting screen share...');

        const iceServers = await getTurnServerCredentials();

        // Peer 연결 설정
        const peer = new Peer({
            host: 'drawapp-ne15.onrender.com',
            port: 443,
            path: '/peerjs/peer', // 경로 수정
            secure: true, // HTTPS 및 WSS를 위한 설정
            config: { iceServers },
        });

        peerRef.current = peer;

        peer.on('open', (id) => {
            console.log('PeerJS ID:', id);
            setPeerId(id);
        });

        peer.on('call', (call) => {
            call.answer();
            call.on('stream', (remoteStream) => {
                remoteStreamRef.current.srcObject = remoteStream;
            });
        });

        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        localStreamRef.current.srcObject = stream;

        console.log('Local stream acquired. Waiting for remote peer...');
    };

    const makeCall = () => {
        if (!peerRef.current || !remotePeerId) return;

        const stream = localStreamRef.current.srcObject;
        const call = peerRef.current.call(remotePeerId, stream);

        call.on('stream', (remoteStream) => {
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
