import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

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

    // Start screen sharing
    const startScreenShare = async () => {
        console.log('Starting screen share...');

        try {
            const iceServers = await getTurnServerCredentials();

            // Peer 생성 및 연결
            const peer = new Peer({
                host: 'drawapp-ne15.onrender.com',
                port: 443,
                path: '/peerjs',
                secure: true,
                config: { iceServers },
            });

            peerRef.current = peer;

            peer.on('open', (id) => {
                console.log('PeerJS ID:', id);
                setPeerId(id);
            });

            peer.on('call', (call) => {
                console.log('Incoming call from:', call.peer);
                call.answer();

                call.on('stream', (remoteStream) => {
                    console.log('Received remote stream');
                    remoteStreamRef.current.srcObject = remoteStream;
                });

                call.on('close', () => {
                    console.log('Call closed');
                });

                call.on('error', (err) => {
                    console.error('Call error:', err);
                });
            });

            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            localStreamRef.current.srcObject = stream;

            console.log('Local stream acquired.');
        } catch (error) {
            console.error('Error starting screen share:', error);
        }
    };

    const makeCall = () => {
        if (!peerRef.current || !remotePeerId) {
            console.error('Peer instance or remote peer ID is missing.');
            return;
        }

        const stream = localStreamRef.current.srcObject;
        const call = peerRef.current.call(remotePeerId, stream);

        call.on('stream', (remoteStream) => {
            console.log('Received remote stream during call');
            remoteStreamRef.current.srcObject = remoteStream;
        });

        call.on('error', (err) => {
            console.error('Call error:', err);
        });

        call.on('close', () => {
            console.log('Call ended.');
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
