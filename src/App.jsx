import React from 'react';
import ScreenShare from './components/ScreenShare';
import Canvas from './components/Canvas';
import Chat from './components/Chat';

const App = () => {
    return (
        <div>
            <ScreenShare />
            <Canvas />
            <Chat />
        </div>
    );
};

export default App;
