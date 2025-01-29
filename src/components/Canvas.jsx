// import { useEffect, useRef, useState } from 'react';
// import socket from '../socket';

// const Canvas = () => {
//     const canvasRef = useRef(null);
//     const ctxRef = useRef(null);
//     const [drawing, setDrawing] = useState(false);

//     useEffect(() => {
//         const canvas = canvasRef.current;
//         canvas.width = 800;
//         canvas.height = 600;
//         const ctx = canvas.getContext('2d');
//         ctx.lineWidth = 3;
//         ctx.strokeStyle = '#ffffff';
//         ctxRef.current = ctx;

//         socket.on('drawing', ({ x, y, type }) => {
//             if (type === 'start') {
//                 ctx.beginPath();
//                 ctx.moveTo(x, y);
//             } else {
//                 ctx.lineTo(x, y);
//                 ctx.stroke();
//             }
//         });

//         return () => socket.off('drawing');
//     }, []);

//     const handleMouseDown = (e) => {
//         setDrawing(true);
//         ctxRef.current.beginPath();
//         ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
//         socket.emit('drawing', {
//             x: e.nativeEvent.offsetX,
//             y: e.nativeEvent.offsetY,
//             type: 'start',
//         });
//     };

//     const handleMouseMove = (e) => {
//         if (!drawing) return;
//         ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
//         ctxRef.current.stroke();
//         socket.emit('drawing', {
//             x: e.nativeEvent.offsetX,
//             y: e.nativeEvent.offsetY,
//             type: 'draw',
//         });
//     };

//     const handleMouseUp = () => setDrawing(false);

//     return (
//         <canvas
//             ref={canvasRef}
//             className="border bg-black"
//             onMouseDown={handleMouseDown}
//             onMouseMove={handleMouseMove}
//             onMouseUp={handleMouseUp}
//         />
//     );
// };

// export default Canvas;

import React, { useRef, useEffect, useState } from 'react';

const Canvas = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.7;

        const handleMouseDown = () => setIsDrawing(true);
        const handleMouseUp = () => {
            setIsDrawing(false);
            ctx.beginPath(); // 새로운 경로 시작
        };

        const handleMouseMove = (event) => {
            if (!isDrawing) return;

            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'red';
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        // 이벤트 리스너 등록
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mousemove', handleMouseMove);

        // 클린업
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isDrawing]);

    return (
        <div>
            <h2>드로잉 캔버스</h2>
            <canvas ref={canvasRef} style={{ border: '1px solid #ddd', width: '100%', height: '70vh' }} />
        </div>
    );
};

export default Canvas;
