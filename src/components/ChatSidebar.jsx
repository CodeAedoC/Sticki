import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useMyPresence, useBroadcastEvent, useEventListener, useOthers } from '../liveblocks.config';

// Helper function to get sender name (adapt based on your actual presence structure)
const getSenderName = (senderId, myPresence, others) => {
  if (myPresence && senderId === myPresence.connectionId) {
    // Correctly access userInfo for self
    return myPresence.presence?.userInfo?.name || `You`;
  }
  const sender = others.find(other => other.connectionId === senderId);
  // Correctly access userInfo for others
  return sender?.presence?.userInfo?.name || `User (${senderId})`;
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
  // Get the full presence object for self, not just the update function
  const myPresence = useMyPresence()[0]; // [0] gets the presence object
  const others = useOthers(); // Get other users in the room
  const messagesEndRef = useRef(null);

  // State for voice input
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [transcriptLength, setTranscriptLength] = useState(null);
  const lengthTimeoutRef = useRef(null); // Ref for the length display timeout

  // Keep messageRef updated
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // Effect to set initial position and setup listeners
  useEffect(() => {
    // Setup speech recognition listeners
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
      // Cleanup speech listeners
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      }
      if (lengthTimeoutRef.current) clearTimeout(lengthTimeoutRef.current);
    };
  }, []); // Run setup once on mount

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEventListener(({ event, connectionId }) => {
    if (event.type === 'CHAT_MESSAGE') {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          text: event.data.text,
          senderId: connectionId,
          // Call getSenderName to determine the display name
          senderName: getSenderName(connectionId, myPresence, others),
          timestamp: Date.now(),
        },
      ]);
    }
  });

  const handleManualSend = useCallback(() => {
    if (message.trim()) {
      broadcast({ type: 'CHAT_MESSAGE', data: { text: message } });
      // Add message locally immediately
      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          text: message,
          senderId: myPresence.connectionId,
          // Use getSenderName for self too
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

  return (
    <div
      className={`chat-sidebar`}
    >
      <div className="chat-header">Chat</div>

      <div className="chat-content-wrapper">
        {speechError && <div className="chat-error">{speechError}</div>}
        {transcriptLength !== null && (
          <div className="transcript-length-display">
            Transcript length: {transcriptLength}
          </div>
        )}
        <div className="chat-messages">
          {chatMessages.map((msg, index) => (
            <div
              key={`${msg.senderId}-${msg.timestamp}-${index}`}
              className={`chat-message ${msg.senderId === myPresence?.connectionId ? 'sent' : 'received'}`}
            >
              <div className="message-sender-name">{msg.senderName}</div>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          {recognition && (
            <button
                onClick={handleMicClick}
                className={`btn mic-btn ${isListening ? 'listening' : ''}`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
              🎤
            </button>
          )}
          <textarea
            className="chat-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type message or use mic..."
            rows={2}
          />
          <button onClick={handleManualSend} className="btn btn-send">Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatSidebar; 