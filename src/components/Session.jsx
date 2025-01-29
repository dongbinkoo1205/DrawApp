import { useParams } from 'react-router-dom'; // ✅ `useParams` 사용 (Router X)
// import Chat from './Chat';
import Canvas from './Canvas';
import ScreenShare from './ScreenShare';

const Session = () => {
    const { sessionId } = useParams();
    const shareURL = `${window.location.origin}/session/${sessionId}`;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <div className="p-4 bg-gray-800 text-center">
                <p>참여자에게 이 링크를 공유하세요:</p>
                <input className="w-full bg-gray-700 text-white p-2 rounded" value={shareURL} readOnly />
            </div>
            <div className="flex flex-1">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Canvas />
                    <ScreenShare />
                </div>
                {/* <div className="w-80">
                    <Chat />
                </div> */}
            </div>
        </div>
    );
};

export default Session;
