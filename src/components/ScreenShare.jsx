import React, { useEffect, useRef, useState } from 'react';

const iceServers = [
    { urls: 'stun:stun.relay.metered.ca:80' },
    {
        urls: 'turn:global.relay.metered.ca:443',
        username: '0e7b1f0cd385987cbf443ba6',
        credential: 'CgDOWoNDYeHJSP/f',
    },
];

export default function ScreenShare({ socket }) {
    const [isBroadcaster, setIsBroadcaster] = useState(false);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);

    // 화면 공유 시작
    const startScreenShare = async () => {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        localStreamRef.current.srcObject = stream;

        setIsBroadcaster(true);
        socket.emit('start-broadcast');

        peerConnectionRef.current = new RTCPeerConnection({ iceServers });
        stream.getTracks().forEach((track) => peerConnectionRef.current.addTrack(track, stream));

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate });
            }
        };
    };

    // Signaling 이벤트 핸들링
    useEffect(() => {
        socket.on('broadcaster', (broadcasterId) => {
            if (!isBroadcaster) {
                joinBroadcast(broadcasterId);
            }
        });

        socket.on('offer', async (data) => {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                socket.emit('answer', { target: data.sender, answer });
            }
        });

        socket.on('ice-candidate', (data) => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });
    }, [isBroadcaster, socket]);

    const joinBroadcast = async (broadcasterId) => {
        peerConnectionRef.current = new RTCPeerConnection({ iceServers });

        remoteStreamRef.current.srcObject = new MediaStream();
        peerConnectionRef.current.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStreamRef.current.srcObject.addTrack(track);
            });
        };

        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socket.emit('offer', { target: broadcasterId, offer });
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-200">
            <video ref={localStreamRef} autoPlay muted playsInline className="w-1/2 h-64 rounded-lg shadow" />
            <video ref={remoteStreamRef} autoPlay playsInline className="w-1/2 h-64 rounded-lg shadow ml-4" />
            <button
                onClick={startScreenShare}
                className={`absolute top-4 right-4 px-4 py-2 rounded-lg font-semibold ${
                    isBroadcaster ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                }`}
                disabled={isBroadcaster}
            >
                Start Screen Sharing
            </button>
        </div>
    );
}
