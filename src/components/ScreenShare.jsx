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
                await waitForStableState(peerRef.current);

                await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
                console.log('✅ Remote description 설정 완료');

                const answer = await peerRef.current.createAnswer();
                await peerRef.current.setLocalDescription(answer);
                console.log('✅ Local description 설정 완료');

                socket.emit('answer', answer);
            } catch (err) {
                console.error('Offer 처리 실패:', err);
            }
        });

        socket.on('answer', async (answer) => {
            console.log('📡 WebRTC Answer 수신');
            if (peerRef.current) {
                try {
                    if (peerRef.current.signalingState === 'stable') {
                        console.warn('🔍 Answer를 설정할 필요가 없음');
                        return;
                    }

                    await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                    console.log('✅ Remote answer 설정 완료');
                } catch (err) {
                    console.error('Answer 처리 실패:', err);
                }
            }
        });

        socket.on('candidate', async (candidate) => {
            console.log('📡 ICE Candidate 수신');
            if (peerRef.current) {
                try {
                    await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log('✅ ICE Candidate 추가 완료');
                } catch (err) {
                    console.error('ICE Candidate 처리 실패:', err);
                }
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

            peer.createOffer()
                .then((offer) => {
                    return peer.setLocalDescription(offer);
                })
                .then(() => {
                    console.log('📡 Offer 전송');
                    socket.emit('offer', peer.localDescription);
                })
                .catch((err) => console.error('Offer 생성 실패:', err));
        }

        return peer;
    };

    const waitForStableState = async (peer) => {
        let retries = 0;
        while (peer.signalingState !== 'stable' && retries < 5) {
            console.log(`⏳ Waiting for stable state... [${retries + 1}/5]`);
            await new Promise((resolve) => setTimeout(resolve, 500));
            retries++;
        }

        if (peer.signalingState !== 'stable') {
            throw new Error('PeerConnection 상태가 안정적이지 않음 (stable 상태 대기 실패)');
        }
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
