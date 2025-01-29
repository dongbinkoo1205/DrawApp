// import { useState, useEffect, useRef } from 'react';
// import socket from '../socket';

// const ScreenShare = () => {
//     const [isSharing, setIsSharing] = useState(false);
//     const videoRef = useRef(null);
//     const peerRef = useRef(null);
//     const mediaStream = useRef(null);

//     useEffect(() => {
//         socket.on('offer', async (offer) => {
//             console.log('📡 WebRTC Offer 수신');
//             if (!peerRef.current) {
//                 peerRef.current = createPeer(false);
//             }

//             try {
//                 console.log('📡 Offer 수신 후 signalingState:', peerRef.current.signalingState);
//                 await waitForStableState(peerRef.current);

//                 if (peerRef.current.signalingState === 'stable') {
//                     await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
//                     console.log('✅ Remote description 설정 완료');

//                     const answer = await peerRef.current.createAnswer();
//                     await peerRef.current.setLocalDescription(answer);
//                     console.log('✅ Local description 설정 완료');

//                     socket.emit('answer', answer); // 서버로 answer 전송
//                 } else {
//                     console.log('❌ signalingState가 stable 상태가 아니므로 처리하지 않음');
//                 }
//             } catch (err) {
//                 console.error('Offer 처리 실패:', err);
//             }
//         });

//         socket.on('answer', async (answer) => {
//             console.log('📡 WebRTC Answer 수신');
//             if (peerRef.current) {
//                 try {
//                     await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//                     console.log('✅ Remote answer 설정 완료');
//                 } catch (err) {
//                     console.error('Answer 처리 실패:', err);
//                 }
//             }
//         });

//         socket.on('candidate', async (candidate) => {
//             console.log('📡 ICE Candidate 수신:', candidate);

//             if (!peerRef.current) {
//                 console.error('❌ peerRef.current가 존재하지 않습니다.');
//                 return;
//             }

//             try {
//                 const iceCandidate = new RTCIceCandidate(candidate);
//                 await peerRef.current.addIceCandidate(iceCandidate);
//                 console.log('✅ ICE Candidate 추가 완료');
//             } catch (err) {
//                 console.error('ICE Candidate 처리 실패:', err);
//             }
//         });

//         socket.on('connect', () => {
//             console.log('🔗 WebSocket 연결됨');
//         });

//         socket.on('disconnect', () => {
//             console.log('❌ WebSocket 연결 종료됨');
//         });

//         return () => {
//             socket.off('offer');
//             socket.off('answer');
//             socket.off('candidate');
//         };
//     }, []);

//     const createPeer = (initiator) => {
//         const peer = new RTCPeerConnection({
//             iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//         });

//         peer.onicecandidate = (event) => {
//             if (event.candidate) {
//                 console.log('📡 ICE Candidate 생성:', event.candidate); // 로그 강화
//                 try {
//                     socket.emit('candidate', event.candidate); // 후보 전송
//                 } catch (error) {
//                     console.error('ICE Candidate 전송 오류:', error);
//                 }
//             }
//         };

//         peer.ontrack = (event) => {
//             console.log('🎥 비디오 트랙 수신:', event);
//             if (videoRef.current) {
//                 videoRef.current.srcObject = event.streams[0];
//                 console.log('🎥 비디오 스트림 설정 완료');
//             }
//         };

//         if (initiator) {
//             console.log('🎥 화면 공유 트랙 추가');
//             mediaStream.current.getTracks().forEach((track) => {
//                 peer.addTrack(track, mediaStream.current);
//             });

//             peer.createOffer()
//                 .then((offer) => peer.setLocalDescription(offer))
//                 .then(() => {
//                     console.log('📡 Offer 전송');
//                     socket.emit('offer', peer.localDescription); // 서버로 offer 전송
//                 })
//                 .catch((err) => console.error('Offer 생성 실패:', err));
//         }

//         return peer;
//     };

//     const waitForStableState = async (peer) => {
//         let retries = 0;
//         while (peer.signalingState !== 'stable' && retries < 5) {
//             console.log(`⏳ Waiting for stable state... [${retries + 1}/5]`);
//             await new Promise((resolve) => setTimeout(resolve, 500));
//             retries++;
//         }

//         if (peer.signalingState !== 'stable') {
//             console.error('❌ PeerConnection 상태가 stable 상태로 변경되지 않았음');
//             throw new Error('PeerConnection 상태가 안정적이지 않음');
//         } else {
//             console.log('✅ signalingState가 stable 상태로 변경됨');
//         }
//     };

//     const startScreenShare = async () => {
//         if (isSharing) {
//             console.log('❌ 화면 공유 중복 시작 방지');
//             return; // 이미 화면 공유 중이면 다시 시작하지 않음
//         }

//         try {
//             console.log('🎥 화면 공유 시작');
//             const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
//             mediaStream.current = stream;
//             setIsSharing(true);

//             if (!peerRef.current) {
//                 peerRef.current = createPeer(true);
//             }

//             if (videoRef.current) {
//                 videoRef.current.srcObject = stream;
//             }

//             stream.getVideoTracks()[0].onended = () => stopScreenShare();
//         } catch (err) {
//             console.error('❌ 화면 공유 오류:', err);
//         }
//     };

//     const stopScreenShare = () => {
//         if (!isSharing) {
//             console.log('❌ 화면 공유가 진행 중이 아닙니다.');
//             return;
//         }

//         console.log('🛑 화면 공유 중지');
//         if (mediaStream.current) {
//             mediaStream.current.getTracks().forEach((track) => track.stop());
//             setIsSharing(false);
//             socket.emit('stopScreenShare');
//             console.log('🎥 화면 공유 트랙 종료됨');
//         }
//     };

//     return (
//         <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
//             <h2 className="text-lg font-bold mb-2">화면 공유</h2>
//             <button
//                 className={`w-full p-2 rounded ${isSharing ? 'bg-red-500' : 'bg-green-500'}`}
//                 onClick={isSharing ? stopScreenShare : startScreenShare}
//             >
//                 {isSharing ? '공유 중지' : '화면 공유 시작'}
//             </button>
//             <video ref={videoRef} autoPlay playsInline className="w-full rounded border" />
//         </div>
//     );
// };

// export default ScreenShare;
import React, { useEffect, useRef } from 'react';

const ScreenShare = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        // ✅ 화면 공유 시작
        const startScreenShare = async () => {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream; // 화면 데이터를 video 요소에 연결
                }
            } catch (error) {
                console.error('❌ 화면 공유 실패:', error);
                alert('📌 화면 공유를 허용해야 합니다. HTTPS 환경에서 실행해주세요.');
            }
        };

        startScreenShare();
    }, []);

    return (
        <div>
            <h2>화면 공유</h2>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '70vh', background: '#000' }} />
        </div>
    );
};

export default ScreenShare;
