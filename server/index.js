import { useState, useEffect, useRef } from 'react';
import socket from '../socket';

const ScreenShare = () => {
    const [isSharing, setIsSharing] = useState(false);
    const videoRef = useRef(null);
    const peerRef = useRef(null);
    const mediaStream = useRef(null);

    useEffect(() => {
        // WebRTC 시그널링 처리
        socket.on('offer', async (offer) => {
            console.log('📡 WebRTC Offer 수신');
            if (!peerRef.current) {
                peerRef.current = createPeer(false);
            }

            try {
                // signalingState가 "stable"이 아닐 때 기다리기
                if (peerRef.current.signalingState !== 'stable') {
                    console.log('Signaling state is not stable, waiting...');
                    return; // "stable" 상태일 때만 진행
                }

                await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerRef.current.createAnswer();
                await peerRef.current.setLocalDescription(answer);
                socket.emit('answer', answer); // 서버로 answer 전송
            } catch (err) {
                console.error('Offer 처리 실패:', err);
            }
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
                socket.emit('offer', offer); // 서버로 offer 전송
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
            if (err.name === 'NotAllowedError') {
                console.error('❌ 화면 공유 권한이 거부되었습니다. 권한을 부여해 주세요.');
            } else if (err.name === 'NotFoundError') {
                console.error('❌ 화면을 찾을 수 없습니다. 다른 화면 공유 방법을 사용해 주세요.');
            } else {
                console.error('❌ 화면 공유 오류:', err);
            }
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
