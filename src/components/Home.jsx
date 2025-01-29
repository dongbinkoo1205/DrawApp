import { useNavigate } from 'react-router-dom'; // ✅ `useNavigate` 사용 (Router X)

const Home = () => {
    const navigate = useNavigate();

    const createSession = () => {
        const sessionId = Math.random().toString(36).substring(2, 8);
        navigate(`/session/${sessionId}`);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-2xl font-bold">실시간 과외</h1>
            <button onClick={createSession} className="mt-4 px-4 py-2 bg-blue-500 rounded">
                세션 생성
            </button>
        </div>
    );
};

export default Home;
