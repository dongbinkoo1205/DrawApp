import React, { useEffect, useRef, useState } from 'react';

async function getTurnServerCredentials() {
    try {
        const response = await fetch(
            'https://drawapp.metered.live/api/v1/turn/credentials?apiKey=cf0149014300f0ed0227a5c137636795ce6e'
        );
        if (!response.ok) throw new Error('Failed to fetch TURN server credentials');
        const iceServers = await response.json();
        console.log('Fetched TURN server credentials:', iceServers);
        return iceServers;
    } catch (error) {
        console.error('Error fetching TURN server credentials:', error);
        return [{ urls: 'stun:stun.l.google.com:19302' }];
    }
}

export default function ScreenShare({ socket }) {
    const [isBroadcaster, setIsBroadcaster] = useState(false);
    const [broadcasterId, setBroadcasterId] = useState(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const pendingRemoteCandidates = useRef([]);

    const startScreenShare = async () => {
        console.log('Starting screen share...');
        const iceServers = await getTurnServerCredentials();
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        localStreamRef.current.srcObject = stream;

        setIsBroadcaster(true);
        socket.emit('start-broadcast');

        peerConnectionRef.current = new RTCPeerConnection({ iceServers });
        stream.getTracks().forEach((track) => peerConnectionRef.current.addTrack(track, stream));

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Generated ICE candidate:', event.candidate);
                socket.emit('ice-candidate', { target: broadcasterId, candidate: event.candidate });
            }
        };

        peerConnectionRef.current.onnegotiationneeded = async () => {
            console.log('Negotiation needed');
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            console.log('Sending offer:', offer);
            socket.emit('offer', { target: broadcasterId, offer });
        };
    };

    const joinBroadcast = async (id) => {
        console.log('Joining broadcast from:', id);
        const iceServers = await getTurnServerCredentials();

        peerConnectionRef.current = new RTCPeerConnection({ iceServers });
        remoteStreamRef.current.srcObject = new MediaStream();

        peerConnectionRef.current.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStreamRef.current.srcObject.addTrack(track);
            });
        };

        socket.emit('offer', { target: id, offer: await peerConnectionRef.current.createOffer() });
    };

    useEffect(() => {
        socket.on('broadcaster', (id) => {
            console.log('Received broadcaster ID:', id);
            setBroadcasterId(id);
            if (!isBroadcaster) joinBroadcast(id);
        });

        socket.on('offer', async (data) => {
            console.log('Received offer:', data);
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            socket.emit('answer', { target: data.sender, answer });
        });

        socket.on('ice-candidate', (data) => {
            if (peerConnectionRef.current.remoteDescription) {
                peerConnectionRef.current
                    .addIceCandidate(new RTCIceCandidate(data.candidate))
                    .catch((error) => console.error('Error adding ICE candidate:', error));
            } else {
                console.warn('Remote description not set. Queueing ICE candidate.');
                pendingRemoteCandidates.current.push(new RTCIceCandidate(data.candidate));
            }
        });

        return () => {
            socket.off('broadcaster');
            socket.off('offer');
            socket.off('ice-candidate');
        };
    }, [isBroadcaster]);

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
