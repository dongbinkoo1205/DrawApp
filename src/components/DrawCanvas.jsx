// DrawingCanvas.jsx
import * as React from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';

function DrawingCanvas() {
    const canvasRef = useRef();
    const handleClear = () => {
        canvasRef.current.clearCanvas();
    };

    return (
        <div className="absolute inset-0">
            <ReactSketchCanvas
                ref={canvasRef}
                style={{ border: '1px solid black', width: '100%', height: '100%' }}
                strokeWidth={tool === 'pen' ? 2 : 10}
                strokeColor="#00FF00"
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
