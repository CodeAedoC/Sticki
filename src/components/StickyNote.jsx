import React, { useState, useEffect, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import { useMutation, useStorage } from '../liveblocks.config';

const THROTTLE_MS = 50; // Throttle updates to 50ms

function StickyNote({ id }) {
  const nodeRef = useRef(null); // Ref for react-draggable
  const throttleTimeoutRef = useRef(null); // Ref for throttle timeout ID
  const textAreaRef = useRef(null); // Ref for the textarea

  // Get live note data from storage
  const note = useStorage(root => root.notes.get(id));

  // Separate state for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(note?.text || '');

  // Update local text if note changes externally (and not currently editing)
  useEffect(() => {
    if (note && note.text !== textValue && !isEditing) {
      setTextValue(note.text);
    }
  }, [note?.text, isEditing]); // Re-run if note text changes OR editing state changes

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
      // Optionally, select text: textAreaRef.current.select();
    }
    // Cleanup throttle timeout on unmount
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [isEditing]); // Re-run only when editing state changes

  // Mutation to update note position
  const updatePosition = useMutation(({ storage }, x, y) => {
    const note = storage.get('notes').get(id);
    note?.update({ x, y });
  }, [id]);

  // Mutation to update note text
  const updateText = useMutation(({ storage }, newText) => {
    storage.get('notes').get(id)?.update({ text: newText });
  }, [id]);

  // Mutation to delete the note
  const deleteNote = useMutation(({ storage }) => {
    storage.get('notes').delete(id);
  }, [id]);

  // Throttled position update for use in onDrag
  const throttledUpdatePosition = useCallback((x, y) => {
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
    }
    throttleTimeoutRef.current = setTimeout(() => {
      updatePosition(x, y);
      throttleTimeoutRef.current = null;
    }, THROTTLE_MS);
  }, [updatePosition]);

  // Handler for drag event - uses throttled update
  const handleDrag = (e, data) => {
    throttledUpdatePosition(data.x, data.y);
  };

  // Handler for drag stop event - ensures final position is saved
  const handleStop = (e, data) => {
    // Clear any pending throttled update
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
      throttleTimeoutRef.current = null;
    }
    // Ensure final position is updated immediately
    updatePosition(data.x, data.y);
  };

  // Handler for textarea change (updates local state)
  const handleTextChange = (e) => {
    setTextValue(e.target.value);
  };

  // Save text and exit editing mode on blur
  const handleBlur = () => {
    if (note && textValue !== note.text) {
      updateText(textValue);
    }
    setIsEditing(false);
  };

  // Save text and exit editing mode on Enter (without Shift)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      if (note && textValue !== note.text) {
        updateText(textValue);
      }
      setIsEditing(false);
    }
  };

  // Start editing when the note content area is clicked
  const handleContentClick = () => {
    setIsEditing(true);
  };

  if (!note) {
    return null; // Don't render if note data isn't loaded yet or deleted
  }

  return (
    <Draggable
      handle=".note-handle" // Only allow dragging from the handle
      bounds="parent" // Keep notes within the parent container
      nodeRef={nodeRef} // Pass ref to Draggable
      position={{ x: note.x, y: note.y }} // Controlled position from storage
      onDrag={handleDrag} // Call throttled update during drag
      onStop={handleStop} // Call final update on stop
      // grid={[25, 25]} // Optional: Snap to grid
    >
      <div
        ref={nodeRef}
        className="absolute p-2 w-40 h-40 shadow-xl flex flex-col cursor-default overflow-hidden border border-gray-300 rounded-lg bg-opacity-90 hover:scale-105 transition-transform z-10"
        style={{ backgroundColor: note.fill || '#ffffa5' }}
      >
        <div className="note-handle w-full h-5 bg-gray-300 bg-opacity-50 flex justify-end items-center cursor-grab mb-1 flex-shrink-0">
          <button
            onClick={deleteNote}
            className="text-red-500 hover:text-red-700 font-bold px-1 text-xs"
            title="Delete Note"
          >
            ✕
          </button>
        </div>
        {/* // Conditionally render textarea or text view */}
        {isEditing ? (
          <textarea
            ref={textAreaRef}
            value={textValue}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent resize-none outline-none text-sm p-1 w-full h-full"
            placeholder="Type here..."
          />
        ) : (
          <div
            onClick={handleContentClick} // Click note body to edit
            className="flex-grow text-sm p-1 w-full h-full overflow-y-auto cursor-text whitespace-pre-wrap break-words"
          >
            {textValue || <span className="text-gray-400">Click to edit...</span>}
          </div>
        )}
      </div>
    </Draggable>
  );
}

export default StickyNote; 