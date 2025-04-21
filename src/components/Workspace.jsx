import React from 'react';
import CanvasBoard from './CanvasBoard';
import StickyNote from './StickyNote';
import { useStorage } from '../liveblocks.config';

// Workspace component receives drawing color and renders board + notes
function Workspace({ color }) {
  const notes = useStorage((root) => root.notes);

  return (
    <div className="whiteboard-container grid-bg">
      <div className="canvas-wrapper">
        <CanvasBoard color={color} />
      </div>

      {notes && Array.from(notes.entries()).map(([id, noteData]) => (
        <StickyNote key={id} id={id} />
      ))}
    </div>
  );
}

export default Workspace; 