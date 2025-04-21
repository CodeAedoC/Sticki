import React, { useState } from 'react';
import Toolbar from '../components/Toolbar';
import Workspace from '../components/Workspace';
import ChatSidebar from '../components/ChatSidebar';
import { useMutation } from '../liveblocks.config';
import { LiveObject } from "@liveblocks/client";
import { nanoid } from 'nanoid';

// Helper to get random light color
const getRandomColor = () => {
  const colors = ['#FFFACD', '#ADD8E6', '#90EE90', '#FFB6C1', '#E6E6FA']; // Lemon, Light Blue, Light Green, Light Pink, Lavender
  return colors[Math.floor(Math.random() * colors.length)];
}

function Home() {
  const [color, setColor] = useState('#000000');
  const addNote = useMutation(({ storage }) => {
    const noteId = nanoid();
    const newNote = new LiveObject({
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      text: 'New Note',
      fill: getRandomColor(),
    });
    storage.get('notes').set(noteId, newNote);
  }, []);

  return (
    <div className="home-container">
      <ChatSidebar />

      <h2 className="sub-title">Sticki</h2>
      <h1 className="main-title">Collaborative Whiteboard</h1>

      <Toolbar
        color={color}
        setColor={setColor}
        addNote={addNote}
      />

      <Workspace color={color} />
    </div>
  );
}

export default Home; 