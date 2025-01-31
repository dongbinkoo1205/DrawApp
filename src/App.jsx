// App.jsx
import React from 'react';
import ScreenShare from './components/ScreenShare';
import './index.css'; // Import Tailwind CSS

const App = () => {
    return (
        <div className="flex h-screen">
            <aside className="w-1/4 bg-gray-800 text-white p-4">
                <h1 className="text-xl font-bold mb-4">Team Workspace</h1>
                <ul className="space-y-2">
                    <li className="p-2 bg-gray-700 rounded cursor-pointer">Channel 1</li>
                    <li className="p-2 bg-gray-700 rounded cursor-pointer">Channel 2</li>
                    <li className="p-2 bg-gray-700 rounded cursor-pointer">Direct Messages</li>
                </ul>
            </aside>
            <main className="flex-1 flex flex-col bg-gray-100">
                <header className="p-4 bg-white shadow-md flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Current Channel</h2>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded">Logout</button>
                </header>
                <div className="flex-1 p-4 overflow-auto">
                    <ScreenShare />
                </div>
            </main>
        </div>
    );
};

export default App;
