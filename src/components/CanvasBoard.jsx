import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../contexts/AppContext'; // I imported the context hook

function CanvasBoard() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const { color } = useAppContext(); // I get the current color from context

  // // I set up the canvas context when the component mounts.
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 5; // Default line width
  }, []);

  // // I update the drawing color when the context color changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.strokeStyle = color;
  }, [color]);

  const getMousePos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  // // I start drawing when the mouse button is pressed down.
  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const pos = getMousePos(canvas, event);
    setIsDrawing(true);
    setLastPosition(pos);
    // // Start a new path
    const context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  // // I draw lines as the mouse moves while the button is down.
  const draw = (event) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const pos = getMousePos(canvas, event);

    context.lineTo(pos.x, pos.y);
    context.stroke();
    setLastPosition(pos);
  };

  // // I stop drawing when the mouse button is released or leaves the canvas.
  const stopDrawing = () => {
    if (isDrawing) {
       const canvas = canvasRef.current;
       const context = canvas.getContext('2d');
       context.closePath(); // Close the path
       setIsDrawing(false);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={800} // // I set a fixed size for now, could be dynamic
      height={600}
      className="bg-white border border-gray-400 shadow-md" // I added basic styling
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing} // // Stop drawing if mouse leaves the canvas
    />
  );
}

export default CanvasBoard; 