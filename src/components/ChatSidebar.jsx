import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useMyPresence, useBroadcastEvent, useEventListener, useOthers } from '../liveblocks.config';
import Draggable from 'react-draggable';

// Helper function to get sender name (adapt based on your actual presence structure)
const getSenderName = (senderId, myPresence, others) => {
  if (senderId === myPresence?.connectionId) {
    return myPresence?.info?.name || `You (${myPresence?.connectionId})`;
  }
  const sender = others.find(other => other.connectionId === senderId);
  return sender?.presence?.info?.name || `User (${senderId})`;
};

// Check for SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false; // Stop listening after a pause
  recognition.lang = 'en-US'; // Set language (adjust as needed)
  recognition.interimResults = false; // We only want the final result
}

function ChatSidebar() {
  const [message, setMessage] = useState('');
  const messageRef = useRef(''); // Ref to hold current message for onresult
  const [chatMessages, setChatMessages] = useState([]);
  const broadcast = useBroadcastEvent();
  const [myPresence] = useMyPresence();
  const others = useOthers(); // Get other users in the room
  const nodeRef = useRef(null);

  // TEMP: Use fixed initial position for debugging
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isMounted, setIsMounted] = useState(false);
  const [isListening, setIsListening] = useState(false); // State for voice input
  const [speechError, setSpeechError] = useState(null); // State for speech errors
  const [transcriptLength, setTranscriptLength] = useState(null); // State for length display
  const lengthTimeoutRef = useRef(null); // Ref for the length display timeout

  // New state for minimizing and notifications
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Define expanded dimensions (match CSS or define constants)
  const expandedWidth = 280;
  const expandedHeight = 400;
  const edgeOffset = 10; // Min space from edge

  const didDragRef = useRef(false); // Ref to track dragging

  // Keep messageRef updated
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // TEMP: Set mounted immediately for debugging fixed position
  useEffect(() => {
      setIsMounted(true);
      // Basic Speech Recognition setup (no position calculation)
      if (!recognition) return;

      recognition.onresult = (event) => {
         const transcript = event.results[0][0].transcript;
         const currentMessage = messageRef.current;
         const fullMessage = (currentMessage + transcript).trim();
         setMessage(fullMessage);
         messageRef.current = fullMessage;
         setTranscriptLength(transcript.length);
         if (lengthTimeoutRef.current) clearTimeout(lengthTimeoutRef.current);
         lengthTimeoutRef.current = setTimeout(() => setTranscriptLength(null), 3000);
         setSpeechError(null);
      };
      recognition.onerror = (event) => {
         console.error('Speech recognition error:', event.error);
         setSpeechError(`Error: ${event.error}`);
         setIsListening(false);
      };
      recognition.onend = () => {
         setIsListening(false);
      };

      return () => {
          recognition.onresult = null;
          recognition.onerror = null;
          recognition.onend = null;
          recognition.abort();
          if (lengthTimeoutRef.current) clearTimeout(lengthTimeoutRef.current);
      };
  }, []); // Run setup once

  // Log whenever the component renders
  // console.log(`ChatSidebar: Rendering. isMounted=${isMounted}, isMinimized=${isMinimized}`);

  useEventListener(({ event, connectionId }) => {
    if (event.type === 'CHAT_MESSAGE') {
      // Set unread flag if minimized and message is not from self
      if (isMinimized && connectionId !== myPresence?.connectionId) {
        setHasUnreadMessages(true);
      }
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

  const handleManualSend = useCallback(() => {
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
      messageRef.current = ''; // Clear ref too
    }
  }, [message, broadcast, myPresence, others]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleManualSend(); // Use manual send for Enter key
    }
  };

  // Handler for drag start
  const handleStart = () => {
    didDragRef.current = false; // Reset drag flag on new drag start
  };

  // Drag stop handler
  const handleStop = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  // Handler for drag event
  const handleDrag = () => {
    didDragRef.current = true; // Set flag if dragging occurs
  };

  // Function to handle microphone button click
  const handleMicClick = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      setSpeechError(null); // Clear previous errors before starting
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        // Catch potential errors if recognition is already started
        console.error("Error starting speech recognition:", err);
        setSpeechError("Could not start listening.");
        setIsListening(false);
      }
    }
  };

  // Toggle minimize state
  const toggleMinimize = (e) => {
    e.stopPropagation();

    // Prevent toggle if a drag just ended
    if (didDragRef.current) {
      didDragRef.current = false; // Reset flag
      return; // Don't toggle
    }

    // Calculate potential new position *before* toggling minimized state
    let targetPos = { ...position }; // Start with current position
    const willExpand = isMinimized; // If currently minimized, we will expand

    if (willExpand) {
      // Calculate adjusted position if expanding near edges
      // Check right edge
      if (position.x + expandedWidth + edgeOffset > window.innerWidth) {
        targetPos.x = window.innerWidth - expandedWidth - edgeOffset;
      }
      // Check bottom edge
      if (position.y + expandedHeight + edgeOffset > window.innerHeight) {
        targetPos.y = window.innerHeight - expandedHeight - edgeOffset;
      }
      // Check left edge
      if (targetPos.x < edgeOffset) {
        targetPos.x = edgeOffset;
      }
      // Check top edge
      if (targetPos.y < edgeOffset) {
        targetPos.y = edgeOffset;
      }
    }

    // Update position state if it needs changing
    if (targetPos.x !== position.x || targetPos.y !== position.y) {
      setPosition(targetPos);
    }

    // Now toggle minimized state
    setIsMinimized(prevMinimized => !prevMinimized);

    // Clear unread messages only if we actually expanded
    if (willExpand) {
      setHasUnreadMessages(false);
    }
  };

  if (!isMounted) {
    // console.log('ChatSidebar: Not mounted yet, returning null.');
    return null;
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".chat-drag-handle"
      position={position}
      onStart={handleStart}
      onDrag={handleDrag}
      onStop={handleStop}
    >
      <div
        ref={nodeRef}
        className={`chat-sidebar draggable-chat ${isMinimized ? 'minimized' : ''}`}
        data-minimized={isMinimized}
        title={isMinimized ? "Click to expand chat" : ""}
        onClick={isMinimized ? toggleMinimize : undefined}
      >
        <div className="chat-drag-handle">
          <span className="handle-content">
            {isMinimized ? '💬' : 'Chat'}
          </span>

          {isMinimized && hasUnreadMessages && <span className="notification-dot"></span>}

          <button
            onClick={!isMinimized ? toggleMinimize : undefined}
            className="minimize-btn"
            title={isMinimized ? "Expand Chat" : "Minimize Chat"}>
            {isMinimized ? '💬' : '−'}
          </button>
        </div>

        {!isMinimized && (
          <>
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

            {/* Display speech recognition errors */} 
            {speechError && <div className="chat-error">{speechError}</div>}

            {/* Transcript Length Display */}
            {transcriptLength !== null && (
              <div className="transcript-length-display">
                Recognized: {transcriptLength} chars
              </div>
            )}

            <div className="chat-input-area">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type or use mic..."
                rows="2"
                className="chat-textarea"
                maxLength="200"
                required
              />
              {/* Microphone Button */}
              {recognition && (
                <button
                  onClick={handleMicClick}
                  className={`btn icon-btn mic-btn ${isListening ? 'listening' : ''}`}
                  title={isListening ? 'Stop Listening' : 'Start Voice Input'}
                >
                  🎤
                </button>
              )}
              <button onClick={handleManualSend} className="btn btn-send">
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </Draggable>
  );
}

export default ChatSidebar; 