import React, { useState } from 'react';
import CanvasBoard from '../components/CanvasBoard';

function Home() {
  const [color, setColor] = useState('#000000');

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Collaborative Whiteboard</h1>

      <div className="mb-4 flex items-center space-x-2">
        <label htmlFor="colorPicker" className="text-sm font-medium">Color:</label>
        <input
          type="color"
          id="colorPicker"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
        />
      </div>

      <CanvasBoard color={color} />
    </div>
  );
}

export default Home; 