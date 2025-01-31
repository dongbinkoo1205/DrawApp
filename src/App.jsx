import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import ScreenShare from './components/ScreenShare';

const socket = io('https://drawapp-ne15.onrender.com');

export default function App() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');

    // 메시지 수신 이벤트 핸들링
    useEffect(() => {
        socket.on('receive-message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });
    }, []);

    const sendMessage = () => {
        if (inputMessage.trim()) {
            socket.emit('send-message', inputMessage);
            setInputMessage('');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-100 text-gray-900">
            <header className="flex items-center justify-between p-4 bg-blue-600 text-white">
                <h1 className="text-lg font-bold">Real-Time Collaboration Tool</h1>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 bg-white border-r p-4">
                    <h2 className="font-bold text-xl">Channels</h2>
                    <ul className="mt-4 space-y-2">
                        <li className="p-2 rounded-lg bg-gray-200"># General</li>
                        <li className="p-2 rounded-lg hover:bg-gray-200"># Tech Support</li>
                        <li className="p-2 rounded-lg hover:bg-gray-200"># Random</li>
                    </ul>
                </aside>

                <main className="flex-1 flex flex-col">
                    <ScreenShare socket={socket} />

                    <div className="flex-1 flex flex-col p-4 bg-white">
                        <h2 className="font-bold text-lg mb-4">Chat</h2>
                        <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className="p-2 bg-gray-100 rounded-lg">
                                    {msg}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center">
                            <input
                                type="text"
                                placeholder="Type a message"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                className="flex-1 border rounded-lg p-2 mr-2"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
