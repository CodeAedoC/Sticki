import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Remove useAuth import if user ID is no longer needed to generate ID
// import { useAuth } from '../contexts/AuthContext';

function RoomEntryPage() {
  const [roomIdInput, setRoomIdInput] = useState('');
  const navigate = useNavigate();
  // const { user } = useAuth(); // No longer needed here

  // Function to handle joining an existing room via input
  const handleJoinSubmit = (e) => {
    e.preventDefault();
    let targetRoomId = roomIdInput.trim();

    // Check if the input looks like a full URL and try to extract the ID
    try {
      const url = new URL(targetRoomId);
      // Assuming the ID is the last part of the path /app/ID
      const pathParts = url.pathname.split('/').filter(part => part);
      if (pathParts.length > 0 && pathParts[pathParts.length - 2] === 'app') {
        targetRoomId = pathParts[pathParts.length - 1];
      }
      // If it's a URL but doesn't match /app/ID pattern, maybe it's just the ID - keep targetRoomId as is.
    } catch (error) {
      // If it's not a valid URL, assume it's already just the ID
      // No action needed, targetRoomId already holds the trimmed input
    }

    if (targetRoomId) {
      // Navigate using the potentially extracted ID
      navigate(`/app/${targetRoomId}`);
    }
  };

  // Function to handle creating a new room
  const handleCreateRoom = () => {
    // Generate a unique ID using the browser's crypto API
    const newRoomId = crypto.randomUUID();
    // Navigate to the newly created room URL
    navigate(`/app/${newRoomId}`);
  };

  return (
    <div className="room-entry-container">
      {/* Section to Join Existing Room */}
      <h2>Join an Existing Whiteboard</h2>
      <form onSubmit={handleJoinSubmit} className="room-entry-form">
        <input
          type="text"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
          placeholder="Paste Room ID or full link"
          required
          className="room-entry-input"
        />
        <button type="submit" className="btn btn-secondary">
          Join Room
        </button>
      </form>
      <p className="room-entry-helper-text">Enter the unique ID or paste the full shared link to join an existing session.</p>

      {/* Separator or Clearer Distinction */}
      <div style={{ margin: '2rem 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        OR
      </div>

      {/* Section to Create New Room */}
      <h2>Create a New Whiteboard</h2>
      <button onClick={handleCreateRoom} className="btn btn-primary landing-btn">
        Create New Room
      </button>
      <p className="room-entry-helper-text">Start a brand new session. Share the link from inside the room.</p>
    </div>
  );
}

export default RoomEntryPage; 