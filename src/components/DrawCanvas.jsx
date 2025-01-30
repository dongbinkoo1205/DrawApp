import React, { useState } from 'react';
import CanvasDraw from 'react-canvas-draw';

function DrawingCanvas() {
    const [tool, setTool] = useState('pen');
    const canvasRef = React.createRef();

    const handleClear = () => {
        canvasRef.current.clear();
    };

    return (
        <div className="absolute inset-0">
            <CanvasDraw
                ref={canvasRef}
                brushRadius={tool === 'pen' ? 2 : 10}
                lazyRadius={0}
                canvasWidth="100%"
                canvasHeight="100%"
                hideGrid
                brushColor="#00FF00"
            />
            <div className="absolute top-2 left-2 p-2 bg-gray-800 rounded shadow">
                <button
                    onClick={() => setTool('pen')}
                    className={`px-2 py-1 text-sm ${tool === 'pen' ? 'bg-blue-500' : 'bg-gray-600'} rounded mr-2`}
                >
                    펜
                </button>
                <button
                    onClick={() => setTool('eraser')}
                    className={`px-2 py-1 text-sm ${tool === 'eraser' ? 'bg-blue-500' : 'bg-gray-600'} rounded mr-2`}
                >
                    지우개
                </button>
                <button onClick={handleClear} className="px-2 py-1 text-sm bg-red-600 rounded">
                    전체 지우기
                </button>
            </div>
        </div>
    );
}

export default DrawingCanvas;
