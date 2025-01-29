const startScreenShare = async () => {
    try {
        console.log('🎥 화면 공유 시작 요청');
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
        alert('화면 공유 권한이 필요합니다. 브라우저 설정을 확인하세요.');
    }
};
