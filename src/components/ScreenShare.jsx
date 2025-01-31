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
        // <div className="h-full flex flex-col">
        //     <video ref={videoRef} autoPlay playsInline className="w-full h-3/4 bg-black rounded"></video>
        //     <button
        //         onClick={isSharing ? stopScreenShare : startScreenShare}
        //         className="mt-4 px-4 py-2 bg-green-500 text-white rounded self-center"
        //     >
        //         {isSharing ? 'Stop Sharing' : 'Start Sharing'}
        //     </button>
        //     <div className="flex-1 bg-white shadow rounded mt-4 overflow-auto">
        //         <ul className="p-4 space-y-2">
        //             {messages.map((msg, index) => (
        //                 <li key={index} className="bg-gray-200 p-2 rounded">
        //                     {msg.id}: {msg.message}
        //                 </li>
        //             ))}
        //         </ul>
        //         <input
        //             type="text"
        //             className="p-2 border rounded w-full"
        //             placeholder="Type a message..."
        //             onKeyDown={(e) => e.key === 'Enter' && sendMessage(e.target.value)}
        //         />
        //     </div>
        // </div>
        <div className="flex-1 flex p-4 space-x-4 overflow-hidden">
            {/* 비디오 화면 */}
            <section className="flex-1 flex flex-col items-center bg-black rounded-lg p-4">
                <video ref={videoRef} autoPlay playsInline className="w-full h-3/4 bg-black rounded mb-4"></video>
                <button
                    onClick={isSharing ? stopScreenShare : startScreenShare}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                >
                    {isSharing ? 'Stop Sharing' : 'Start Sharing'}
                </button>
            </section>

            {/* 참가자 목록 및 채팅 */}
            <aside className="w-1/3 flex flex-col space-y-4">
                {/* 참가자 목록 */}
                <div className="flex-1 bg-gray-800 rounded p-4 overflow-auto">
                    <h3 className="text-lg font-bold mb-4">Participants (4)</h3>
                    <ul className="space-y-2">
                        <li className="flex items-center justify-between p-2 bg-gray-700 rounded">
                            <span>Laura Williams</span>
                            <span className="text-green-400">●</span>
                        </li>
                        <li className="flex items-center justify-between p-2 bg-gray-700 rounded">
                            <span>Nicholas Strattenberg</span>
                            <span className="text-red-400">●</span>
                        </li>
                        <li className="flex items-center justify-between p-2 bg-gray-700 rounded">
                            <span>Jake Middlestone</span>
                            <span className="text-green-400">●</span>
                        </li>
                        <li className="flex items-center justify-between p-2 bg-gray-700 rounded">
                            <span>Melissa Miles</span>
                            <span className="text-green-400">●</span>
                        </li>
                    </ul>
                </div>

                {/* 채팅 */}
                <div className="flex-1 bg-gray-800 rounded p-4 overflow-auto">
                    <h3 className="text-lg font-bold mb-4">Chat</h3>
                    <ul className="space-y-2">
                        {messages.map((msg, index) => (
                            <li key={index} className="p-2 bg-gray-700 rounded">
                                {msg.id}: {msg.message}
                            </li>
                        ))}
                    </ul>
                    <input
                        type="text"
                        className="mt-4 p-2 w-full bg-gray-700 text-white rounded"
                        placeholder="Type a message..."
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage(e.target.value)}
                    />
                </div>
            </aside>
        </div>
    );
};

export default ScreenShare;
