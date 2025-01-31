import React, { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { io } from 'socket.io-client';

// 사용자 정의 TURN/STUN 서버 정보
const iceServers = [
    { urls: 'stun:stun.relay.metered.ca:80' },
    { urls: 'turn:global.relay.metered.ca:80', username: '0e7b1f0cd385987cbf443ba6', credential: 'CgDOWoNDYeHJSP/f' },
];

export default function ScreenShare() {
    const [peerId, setPeerId] = useState(null);
    const [remotePeerId, setRemotePeerId] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const socket = useRef(null);
    const peerRef = useRef(null);

    useEffect(() => {
        // Socket 연결 설정
        socket.current = io('https://drawapp-ne15.onrender.com', {
            transports: ['websocket'], // 안정적 연결 보장
        });

        socket.current.on('connect', () => {
            console.log('Connected to server:', socket.current.id);
        });

        socket.current.on('signal', (data) => {
            console.log('Received signal:', data);
            if (peerRef.current) {
                peerRef.current.signal(data.signal);
            }
        });

        return () => {
            socket.current.disconnect();
        };
    }, []);

    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            localStreamRef.current.srcObject = stream;
            setIsBroadcasting(true);

            createPeer(true, stream); // Peer 생성 및 초기화
            socket.current.emit('start-share');
        } catch (error) {
            console.error('Error starting screen share:', error);
        }
    };

    const createPeer = (initiator, stream) => {
        const peer = new SimplePeer({
            initiator,
            trickle: false,
            stream,
            config: { iceServers },
        });

        peerRef.current = peer;

        peer.on('signal', (data) => {
            console.log('Sending signal:', data);
            socket.current.emit('signal', {
                signal: data,
                from: socket.current.id,
                to: remotePeerId,
            });
        });

        peer.on('stream', (remoteStream) => {
            console.log('Received remote stream');
            remoteStreamRef.current.srcObject = remoteStream;
        });

        peer.on('error', (err) => {
            console.error('Peer connection error:', err);
        });

        peer.on('close', () => {
            console.log('Peer connection closed');
        });
    };

    const makeCall = () => {
        if (!remotePeerId || !localStreamRef.current.srcObject) {
            console.error('Remote peer ID or local stream is missing');
            return;
        }

        console.log('Calling remote peer:', remotePeerId);
        createPeer(true, localStreamRef.current.srcObject);
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-200">
            <video ref={localStreamRef} autoPlay muted playsInline className="w-1/2 h-64 rounded-lg shadow" />
            <video ref={remoteStreamRef} autoPlay playsInline className="w-1/2 h-64 rounded-lg shadow ml-4" />

            <button
                onClick={startScreenShare}
                className={`absolute top-4 right-4 px-4 py-2 rounded-lg font-semibold ${
                    isBroadcasting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                }`}
                disabled={isBroadcasting}
            >
                {isBroadcasting ? 'Broadcasting...' : 'Start Screen Sharing'}
            </button>

            <div className="absolute bottom-4 left-4 p-4 bg-white rounded-lg shadow">
                <p>Socket ID: {socket.current?.id || 'Not connected'}</p>
                <input
                    type="text"
                    placeholder="Enter remote peer ID"
                    value={remotePeerId}
                    onChange={(e) => setRemotePeerId(e.target.value)}
                    className="border p-2 rounded w-full mt-2"
                />
                <button
                    onClick={makeCall}
                    className="mt-2 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={!remotePeerId}
                >
                    Call Remote Peer
                </button>
            </div>
        </div>
    );
}
