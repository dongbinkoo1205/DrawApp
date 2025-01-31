import React, { useEffect, useRef, useState } from 'react';

const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' }, // Google STUN 서버
    {
        urls: 'turn:global.relay.metered.ca:443?transport=tcp', // TURN 서버 추가
        username: '0e7b1f0cd385987cbf443ba6',
        credential: 'CgDOWoNDYeHJSP/f',
    },
];

export default function ScreenShare({ socket }) {
    const [isBroadcaster, setIsBroadcaster] = useState(false);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);

    // Start screen sharing
    const startScreenShare = async () => {
        console.log('Starting screen share...');
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        localStreamRef.current.srcObject = stream;

        setIsBroadcaster(true);
        socket.emit('start-broadcast');

        peerConnectionRef.current = new RTCPeerConnection({ iceServers });

        // Add tracks to PeerConnection
        stream.getTracks().forEach((track) => peerConnectionRef.current.addTrack(track, stream));

        // Handle ICE candidates
        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Sending ICE candidate:', event.candidate);
                socket.emit('ice-candidate', { candidate: event.candidate });
            } else {
                console.log('All ICE candidates have been sent.');
            }
        };

        // Handle negotiation needed event
        peerConnectionRef.current.onnegotiationneeded = async () => {
            console.log('Negotiation needed');
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            console.log('Sending offer:', offer);
            socket.emit('offer', { offer });
        };

        // Track ICE connection state
        peerConnectionRef.current.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', peerConnectionRef.current.iceConnectionState);
        };

        // Track WebRTC connection state
        peerConnectionRef.current.onconnectionstatechange = () => {
            console.log('Connection state:', peerConnectionRef.current.connectionState);
        };
    };

    // Handle incoming signaling events
    useEffect(() => {
        socket.on('broadcaster', (broadcasterId) => {
            console.log('Received broadcaster ID:', broadcasterId);
            if (!isBroadcaster) {
                joinBroadcast(broadcasterId);
            }
        });

        socket.on('offer', async (data) => {
            console.log('Received offer:', data);
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            console.log('Sending answer:', answer);
            socket.emit('answer', { answer });
        });

        socket.on('answer', async (data) => {
            console.log('Received answer:', data);
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        socket.on('ice-candidate', (data) => {
            console.log('Received ICE candidate:', data);
            peerConnectionRef.current
                .addIceCandidate(new RTCIceCandidate(data.candidate))
                .then(() => console.log('ICE candidate added successfully.'))
                .catch((error) => console.error('Error adding ICE candidate:', error));
        });

        return () => {
            socket.off('broadcaster');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
        };
    }, [isBroadcaster, socket]);

    const joinBroadcast = async (broadcasterId) => {
        console.log('Joining broadcast from:', broadcasterId);
        peerConnectionRef.current = new RTCPeerConnection({ iceServers });

        remoteStreamRef.current.srcObject = new MediaStream();

        // Add incoming track to remote stream
        peerConnectionRef.current.ontrack = (event) => {
            console.log('Received remote track:', event);
            event.streams[0].getTracks().forEach((track) => {
                remoteStreamRef.current.srcObject.addTrack(track);
            });
        };

        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        console.log('Sending offer to broadcaster');
        socket.emit('offer', { offer });
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
