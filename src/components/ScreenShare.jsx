import { useState, useEffect, useRef } from 'react';
import socket from '../socket';

const ScreenShare = () => {
    const [isSharing, setIsSharing] = useState(false);
    const videoRef = useRef(null);
    const peerRef = useRef(null);
    const mediaStream = useRef(null);

    useEffect(() => {
        socket.on('offer', async (offer) => {
            console.log('📡 WebRTC Offer 수신');
            if (!peerRef.current) {
                peerRef.current = createPeer(false);
            }
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            socket.emit('answer', answer);
        });

        socket.on('answer', (answer) => {
            console.log('📡 WebRTC Answer 수신');
            if (peerRef.current) {
                peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on('candidate', (candidate) => {
            console.log('📡 ICE Candidate 수신');
            if (peerRef.current) {
                peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        return () => {
            socket.off('offer');
            socket.off('answer');
            socket.off('candidate');
        };
    }, []);

    const createPeer = (initiator) => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('candidate', event.candidate);
            }
        };

        peer.ontrack = (event) => {
            console.log('🎥 비디오 트랙 수신');
            if (videoRef.current) {
                videoRef.current.srcObject = event.streams[0];
            }
        };

        if (initiator) {
            console.log('🎥 화면 공유 트랙 추가');
            mediaStream.current.getTracks().forEach((track) => {
                peer.addTrack(track, mediaStream.current);
            });

            peer.createOffer().then((offer) => {
                peer.setLocalDescription(offer);
                socket.emit('offer', offer);
            });
        }

        return peer;
    };

    const startScreenShare = async () => {
        try {
            console.log('🎥 화면 공유 시작');
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            mediaStream.current = stream;
            setIsSharing(true);

            if (!peerRef.current) {
                peerRef.current = createPeer(true);
            }

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            stream.getVideoTracks()[0].onended = () => stopScreenShare();
        } catch (err) {
            console.error('❌ 화면 공유 오류:', err);
        }
    };

    const stopScreenShare = () => {
        console.log('🛑 화면 공유 중지');
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach((track) => track.stop());
            setIsSharing(false);
            socket.emit('stopScreenShare');
        }
    };

    return (
        <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-2">화면 공유</h2>
            <button
                className={`w-full p-2 rounded ${isSharing ? 'bg-red-500' : 'bg-green-500'}`}
                onClick={isSharing ? stopScreenShare : startScreenShare}
            >
                {isSharing ? '공유 중지' : '화면 공유 시작'}
            </button>
            <video ref={videoRef} autoPlay playsInline className="w-full rounded border" />
        </div>
    );
};

export default ScreenShare;
