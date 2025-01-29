import { useEffect, useRef, useState } from 'react';
import socket from '../socket';

const Canvas = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [drawing, setDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctxRef.current = ctx;

        socket.on('drawing', ({ x, y, type }) => {
            if (type === 'start') {
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        });

        return () => socket.off('drawing');
    }, []);

    const handleMouseDown = (e) => {
        setDrawing(true);
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        socket.emit('drawing', {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
            type: 'start',
        });
    };

    const handleMouseMove = (e) => {
        if (!drawing) return;
        ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctxRef.current.stroke();
        socket.emit('drawing', {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
            type: 'draw',
        });
    };

    const handleMouseUp = () => setDrawing(false);

    return (
        <canvas
            ref={canvasRef}
            className="border bg-black"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        />
    );
};

export default Canvas;
