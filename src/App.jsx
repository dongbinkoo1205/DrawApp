import React from 'react';
import ScreenShare from './components/ScreenShare';
import MediaQueryProvider from './Context/MediaQueryContext'; // MediaQueryProvider 가져오기
import './index.css'; // Import Tailwind CSS
import './components/CustomScrollBar.css';

const App = () => {
    return (
        <MediaQueryProvider>
            <div className="flex max-h-screen">
                <main className="flex-1 flex flex-col bg-[#f7f8fc] rounded-lg">
                    <div className="flex-1 overflow-auto">
                        <ScreenShare />
                    </div>
                </main>
            </div>
        </MediaQueryProvider>
    );
};

export default App;
