import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RoomEntryPage() {
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomName.trim()) {
      // Navigate to the dynamic room route
      // Encode the room name to handle spaces or special characters safely
      navigate(`/app/${encodeURIComponent(roomName.trim())}`);
    }
  };

  return (
    <div className="room-entry-container">
      <h2>Join or Create a Whiteboard Room</h2>
      <form onSubmit={handleSubmit} className="room-entry-form">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
          required
          className="room-entry-input"
        />
        <button type="submit" className="btn btn-primary">
          Go to Room
        </button>
      </form>
      <p>Enter a name. If the room exists, you'll join it. Otherwise, a new room will be created.</p>
    </div>
  );
}

export default RoomEntryPage; 