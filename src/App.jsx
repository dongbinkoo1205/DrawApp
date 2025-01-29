import React from 'react';
import ScreenShare from './components/ScreenShare';
import DrawingCanvas from './components/DrawingCanvas';
import Chat from './components/Chat';

const App = () => {
    return (
        <div>
            <ScreenShare />
            <DrawingCanvas />
            <Chat />
        </div>
    );
};

export default App;
