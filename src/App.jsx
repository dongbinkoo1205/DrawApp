import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScreenShare from './components/ScreenShare';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ScreenShare />} />
            </Routes>
        </Router>
    );
}

export default App;
