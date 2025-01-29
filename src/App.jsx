import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Session from './components/Session';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Session/:sessionId" element={<Session />} />
        </Routes>
    );
}

export default App;
