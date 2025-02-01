// App.jsx
import React from 'react';
import ScreenShare from './components/ScreenShare';
import './index.css'; // Import Tailwind CSS
import './components/CustomScrollBar.css';

const App = () => {
    return (
        <div className="flex max-h-screen">
            <main className="flex-1 flex flex-col bg-gray-100">
                <div className="flex-1  overflow-auto">
                    <ScreenShare />
                </div>
            </main>
        </div>
    );
};

export default App;
