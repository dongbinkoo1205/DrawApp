// ScreenShare.jsx
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://drawapp-ne15.onrender.com');

const iceServers = [
    { urls: 'stun:stun.relay.metered.ca:80' },
    { urls: 'turn:global.relay.metered.ca:80', username: '0e7b1f0cd385987cbf443ba6', credential: 'CgDOWoNDYeHJSP/f' },
    { urls: 'turn:global.relay.metered.ca:443', username: '0e7b1f0cd385987cbf443ba6', credential: 'CgDOWoNDYeHJSP/f' },
];

const ScreenShare = () => {
    const [isSharing, setIsSharing] = useState(false);
    const [messages, setMessages] = useState([]);
    const videoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);

    useEffect(() => {
        socket.on('screen-share-started', handleRemoteScreenShare);
        socket.on('screen-share-stopped', stopRemoteScreenShare);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);
        socket.on('chat-message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off('screen-share-started');
            socket.off('screen-share-stopped');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('chat-message');
        };
    }, []);

    const startScreenShare = async () => {
        try {
            localStream.current = await navigator.mediaDevices.getDisplayMedia({ video: true });
            videoRef.current.srcObject = localStream.current;

            peerConnection.current = new RTCPeerConnection({ iceServers });
            localStream.current
                .getTracks()
                .forEach((track) => peerConnection.current.addTrack(track, localStream.current));

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', event.candidate);
                }
            };

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.emit('offer', offer);

            setIsSharing(true);
            socket.emit('start-screen-share');
        } catch (error) {
            console.error('Error starting screen share:', error);
        }
    };

    const stopScreenShare = () => {
        localStream.current.getTracks().forEach((track) => track.stop());
        peerConnection.current.close();
        socket.emit('stop-screen-share');
        setIsSharing(false);
    };

    const handleRemoteScreenShare = (sharerId) => {
        console.log('Screen share started by:', sharerId);
    };

    const stopRemoteScreenShare = () => {
        console.log('Remote screen share stopped');
    };

    const handleOffer = async (offer) => {
        peerConnection.current = new RTCPeerConnection({ iceServers });
        peerConnection.current.ontrack = (event) => {
            videoRef.current.srcObject = event.streams[0];
        };

        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('answer', answer);
    };

    const handleAnswer = async (answer) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIceCandidate = (candidate) => {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const sendMessage = (message) => {
        socket.emit('chat-message', message);
    };

    return (
        <div className="h-full flex flex-col">
            <video ref={videoRef} autoPlay playsInline className="w-full h-3/4 bg-black rounded"></video>
            <button
                onClick={isSharing ? stopScreenShare : startScreenShare}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded self-center"
            >
                {isSharing ? 'Stop Sharing' : 'Start Sharing'}
            </button>
            <div className="flex-1 bg-white shadow rounded mt-4 overflow-auto">
                <ul className="p-4 space-y-2">
                    {messages.map((msg, index) => (
                        <li key={index} className="bg-gray-200 p-2 rounded">
                            {msg.id}: {msg.message}
                        </li>
                    ))}
                </ul>
                <input
                    type="text"
                    className="p-2 border rounded w-full"
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(e.target.value)}
                />
            </div>
        </div>
    );
};

export default ScreenShare;
