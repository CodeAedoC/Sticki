import React, { useState } from 'react';
import CanvasBoard from '../components/CanvasBoard';
import StickyNote from '../components/StickyNote';
import { useStorage, useMutation, useHistory, useRoom } from '../liveblocks.config';
import { LiveObject } from "@liveblocks/client";
import { nanoid } from 'nanoid';

// Helper to get random light color
const getRandomColor = () => {
  const colors = ['#FFFACD', '#ADD8E6', '#90EE90', '#FFB6C1', '#E6E6FA']; // Lemon, Light Blue, Light Green, Light Pink, Lavender
  return colors[Math.floor(Math.random() * colors.length)];
}

function Home() {
  const [color, setColor] = useState('#000000');
  const room = useRoom();
  const history = useHistory();
  const notes = useStorage((root) => root.notes);
  const addNote = useMutation(({ storage }) => {
    const noteId = nanoid();
    const newNote = new LiveObject({
      x: 350 + Math.random() * 100,
      y: 250 + Math.random() * 100,
      text: 'New Note',
      fill: getRandomColor(),
    });
    storage.get('notes').set(noteId, newNote);
  }, []);
  // Mutation to clear all drawn paths (erase canvas)
  const clearCanvas = useMutation(({ storage }) => {
    storage.get('paths').clear();
  }, []);

  return (
    <div className="home-container">
      <h2 className="sub-title">Sticki</h2>
      <h1 className="main-title">Collaborative Whiteboard</h1>

      <div className="toolbar">
        <label htmlFor="colorPicker" className="text-sm font-medium mr-1">Draw:</label>
        <input
          type="color"
          id="colorPicker"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="color-picker"
        />
        <button
          onClick={addNote}
          className="btn btn-primary"
          disabled={room.getStatus() !== 'connected'}
        >
          + Add Note
        </button>
        <button
          onClick={() => history.undo()}
          className="btn btn-secondary"
          disabled={room.getStatus() !== 'connected'}
        >
          Undo
        </button>
        <button
          onClick={() => history.redo()}
          className="btn btn-secondary"
          disabled={room.getStatus() !== 'connected'}
        >
          Redo
        </button>
        <button
          onClick={clearCanvas}
          className="btn btn-secondary"
          disabled={room.getStatus() !== 'connected'}
        >
          Clear Canvas
        </button>
      </div>

      <div className="whiteboard-container grid-bg">
        <div className="canvas-wrapper">
          <CanvasBoard color={color} />
        </div>

        {notes && Array.from(notes.entries()).map(([id, noteData]) => (
          <StickyNote key={id} id={id} />
        ))}
      </div>
    </div>
  );
}

export default Home; 