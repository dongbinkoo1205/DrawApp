import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ScreenShare from './components/ScreenShare';

function App() {
    return (
        <Routes>
            <Route path="/" element={<ScreenShare />} />
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
}

export default App;
