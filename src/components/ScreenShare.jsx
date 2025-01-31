import React, { useEffect, useRef, useState } from 'react';

const iceServers = [
    { urls: 'stun:stun.relay.metered.ca:80' },
    {
        urls: 'turn:global.relay.metered.ca:443?transport=tcp',
        username: '0e7b1f0cd385987cbf443ba6',
        credential: 'CgDOWoNDYeHJSP/f',
    },
];

export default function ScreenShare({ socket }) {
    const [isBroadcaster, setIsBroadcaster] = useState(false);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);

    const startScreenShare = async () => {
        console.log('Starting screen share...');
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        localStreamRef.current.srcObject = stream;

        setIsBroadcaster(true);
        socket.emit('start-broadcast');

        peerConnectionRef.current = new RTCPeerConnection({ iceServers });
        stream.getTracks().forEach((track) => peerConnectionRef.current.addTrack(track, stream));

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Sending ICE candidate:', event.candidate);
                socket.emit('ice-candidate', { candidate: event.candidate });
            }
        };
    };

    useEffect(() => {
        socket.on('broadcaster', (broadcasterId) => {
            console.log('Received broadcaster ID:', broadcasterId);
            if (!isBroadcaster) {
                joinBroadcast(broadcasterId);
            }
        });

        socket.on('offer', async (data) => {
            console.log('Received offer:', data);
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                socket.emit('answer', { target: data.sender, answer });
                console.log('Sent answer:', answer);
            }
        });

        socket.on('ice-candidate', (data) => {
            console.log('Received ICE candidate:', data);
            if (peerConnectionRef.current) {
                peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        return () => {
            socket.off('broadcaster');
            socket.off('offer');
            socket.off('ice-candidate');
        };
    }, [isBroadcaster, socket]);

    const joinBroadcast = async (broadcasterId) => {
        console.log('Joining broadcast from:', broadcasterId);
        peerConnectionRef.current = new RTCPeerConnection({ iceServers });

        remoteStreamRef.current.srcObject = new MediaStream();
        peerConnectionRef.current.ontrack = (event) => {
            console.log('Received remote track:', event);
            event.streams[0].getTracks().forEach((track) => {
                remoteStreamRef.current.srcObject.addTrack(track);
            });
        };

        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socket.emit('offer', { target: broadcasterId, offer });
        console.log('Sent offer:', offer);
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
