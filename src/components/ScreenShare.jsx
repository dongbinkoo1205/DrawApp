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
        return [{ urls: 'stun:stun.l.google.com:19302' }];
    }
}

export default function ScreenShare({ socket }) {
    const [isBroadcaster, setIsBroadcaster] = useState(false);
    const [broadcasterId, setBroadcasterId] = useState(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const pendingCandidatesRef = useRef([]); // 대기 중인 ICE 후보 저장용

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

        stream.getTracks().forEach((track) => peerConnectionRef.current.addTrack(track, stream));

        // Handle ICE candidates
        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Generated ICE candidate:', event.candidate);
                if (broadcasterId) {
                    console.log('Sending ICE candidate to:', broadcasterId);
                    socket.emit('ice-candidate', { target: broadcasterId, candidate: event.candidate });
                } else {
                    console.warn('Broadcaster ID is not defined yet. Queuing ICE candidate.');
                    pendingCandidatesRef.current.push(event.candidate);
                }
            } else {
                console.log('All ICE candidates have been generated.');
            }
        };

        peerConnectionRef.current.onnegotiationneeded = async () => {
            console.log('Negotiation needed');
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            console.log('Sending offer:', offer);
            socket.emit('offer', { target: broadcasterId, offer });
        };

        peerConnectionRef.current.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', peerConnectionRef.current.iceConnectionState);
        };

        peerConnectionRef.current.onconnectionstatechange = () => {
            console.log('Connection state:', peerConnectionRef.current.connectionState);
        };
    };

    // Handle incoming signaling events
    useEffect(() => {
        socket.on('broadcaster', (id) => {
            console.log('Received broadcaster ID:', id);
            setBroadcasterId(id);

            if (!isBroadcaster) {
                joinBroadcast(id);
            }
        });

        socket.on('offer', async (data) => {
            console.log('Received offer:', data);
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            console.log('Sending answer:', answer);
            socket.emit('answer', { target: data.sender, answer });
        });

        socket.on('answer', async (data) => {
            console.log('Received answer:', data);
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));

            // 큐에 저장된 ICE Candidate 전송
            if (pendingCandidatesRef.current.length > 0) {
                console.log('Sending queued ICE candidates to:', broadcasterId);
                pendingCandidatesRef.current.forEach((candidate) => {
                    socket.emit('ice-candidate', { target: broadcasterId, candidate });
                });
                pendingCandidatesRef.current = [];
            }
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

    const joinBroadcast = async (id) => {
        console.log('Joining broadcast from:', id);

        const iceServers = await getTurnServerCredentials();

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

        console.log('Sending offer to broadcaster:', id);
        socket.emit('offer', { target: id, offer });
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
