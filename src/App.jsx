import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScreenShare from './components/ScreenShare';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ScreenShare />} />
                <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
        </Router>
    );
}

export default App;
