import React, { useEffect, useRef, useState } from 'react';

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
        return [{ urls: 'stun:stun.l.google.com:19302' }]; // 기본 STUN 서버 반환
    }
}

export default function ScreenShare({ socket }) {
    const [isBroadcaster, setIsBroadcaster] = useState(false);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);

    // Start screen sharing
    const startScreenShare = async () => {
        console.log('Starting screen share...');

        // TURN 서버 정보 가져오기
        const iceServers = await getTurnServerCredentials();

        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        localStreamRef.current.srcObject = stream;

        setIsBroadcaster(true);
        socket.emit('start-broadcast');

        // PeerConnection 생성
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

        // TURN 서버 정보 가져오기
        const iceServers = await getTurnServerCredentials();

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
