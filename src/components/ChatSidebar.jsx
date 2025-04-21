import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useMyPresence, useBroadcastEvent, useEventListener, useOthers } from '../liveblocks.config';
import Draggable from 'react-draggable';

// Helper function to get sender name (adapt based on your actual presence structure)
const getSenderName = (senderId, myPresence, others) => {
  if (senderId === myPresence?.connectionId) {
    return myPresence?.info?.name || `You (${myPresence?.connectionId})`; // Use local presence info
  }
  const sender = others.find(other => other.connectionId === senderId);
  return sender?.presence?.info?.name || `User (${senderId})`; // Use other's presence info, fallback to ID
};

function ChatSidebar() {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const broadcast = useBroadcastEvent();
  const [myPresence] = useMyPresence();
  const others = useOthers(); // Get other users in the room
  const nodeRef = useRef(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const chatWidth = 280; // Match CSS
    const chatHeight = 400; // Match CSS
    const offset = 20; // Gap from edge
    setPosition({
      x: window.innerWidth - chatWidth - offset,
      y: window.innerHeight - chatHeight - offset
    });
    setIsMounted(true);
  }, []);

  useEventListener(({ event, connectionId }) => {
    if (event.type === 'CHAT_MESSAGE') {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          text: event.data.text,
          senderId: connectionId,
          senderName: getSenderName(connectionId, myPresence, others),
          timestamp: Date.now(),
        },
      ]);
    }
  });

  const handleSendMessage = useCallback(() => {
    if (message.trim()) {
      broadcast({ type: 'CHAT_MESSAGE', data: { text: message } });
      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          text: message,
          senderId: myPresence.connectionId,
          senderName: getSenderName(myPresence.connectionId, myPresence, others),
          timestamp: Date.now(),
        },
      ]);
      setMessage('');
    }
  }, [message, broadcast, myPresence, others]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStop = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".chat-drag-handle"
      position={position}
      onStop={handleStop}
    >
      <div ref={nodeRef} className="chat-sidebar draggable-chat">
        <div className="chat-drag-handle">Chat</div>
        <div className="chat-messages">
          {chatMessages.map((msg, index) => {
            const isSent = msg.senderId === myPresence?.connectionId;
            return (
              <div
                key={`${msg.senderId}-${msg.timestamp}-${index}`}
                className={`chat-message ${isSent ? 'sent' : 'received'}`}
              >
                {!isSent && (
                  <div className="message-sender-name">{msg.senderName}</div>
                )}
                {msg.text}
              </div>
            );
          })}
        </div>
        <div className="chat-input-area">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows="2"
            className="chat-textarea"
            maxLength="200"
            required
          />
          <button onClick={handleSendMessage} className="btn btn-send">
            Send
          </button>
        </div>
      </div>
    </Draggable>
  );
}

export default ChatSidebar; 