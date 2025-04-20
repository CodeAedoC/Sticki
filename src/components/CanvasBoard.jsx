import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useStorage,
  useMutation,
  useOthers,
  useBroadcastEvent,
  useEventListener,
} from '../liveblocks.config';
import { LiveObject } from "@liveblocks/client";
import Cursor from './Cursor';

// Helper function to draw a path on the canvas
const drawPath = (context, pathData) => {
  context.beginPath();
  context.strokeStyle = pathData.color;
  context.lineWidth = 5;
  if (pathData.points.length > 0) {
    context.moveTo(pathData.points[0][0], pathData.points[0][1]);
    for (let i = 1; i < pathData.points.length; i++) {
      context.lineTo(pathData.points[i][0], pathData.points[i][1]);
    }
  }
  context.stroke();
  context.closePath();
};

function CanvasBoard({ color }) {
  const canvasRef = useRef(null);

  // Liveblocks Hooks
  const room = useRoom(); // // Get the room instance to check status
  const [{ isDrawing, cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const broadcast = useBroadcastEvent();
  const paths = useStorage((root) => root.paths);
  const currentPathRef = useRef(null);

  // Mutation to add a completed path to the shared LiveList storage.
  const addPath = useMutation(({ storage }, newPath) => {
    const livePaths = storage.get('paths');
    livePaths.push(new LiveObject(newPath));
  }, []);

  // Setup canvas and draw existing paths
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 5;

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (paths) {
      paths.forEach((livePath) => {
        const pathData = livePath.toObject ? livePath.toObject() : livePath;
        drawPath(context, pathData);
      });
    }
  }, [paths]);

  const getMousePos = useCallback((canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }, []);

  // // I added a check for room connection status before starting to draw.
  const startDrawing = useCallback((event) => {
    if (room.getStatus() !== 'connected') return; // // Don't start if not connected

    const canvas = canvasRef.current;
    const pos = getMousePos(canvas, event);
    updateMyPresence({ isDrawing: true, cursor: pos, color });
    currentPathRef.current = { color, points: [[pos.x, pos.y]] };
  }, [room, getMousePos, updateMyPresence, color]);

  // // I added a check for room connection status before drawing.
  const draw = useCallback((event) => {
    if (room.getStatus() !== 'connected' || !isDrawing) return; // // Don't draw if not connected or not drawing

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const pos = getMousePos(canvas, event);

    updateMyPresence({ cursor: pos });

    if (currentPathRef.current && currentPathRef.current.points.length > 0) {
        context.beginPath();
        context.strokeStyle = currentPathRef.current.color;
        context.lineWidth = 5;
        const lastPoint = currentPathRef.current.points[currentPathRef.current.points.length - 1];
        context.moveTo(lastPoint[0], lastPoint[1]);
        context.lineTo(pos.x, pos.y);
        context.stroke();
        context.closePath();
    }

    currentPathRef.current?.points.push([pos.x, pos.y]);

  }, [room, isDrawing, getMousePos, updateMyPresence]); // Removed broadcast dependency as it was commented out

  // // I added a check for room connection status before stopping drawing / mutating storage.
  const stopDrawing = useCallback(() => {
    if (room.getStatus() !== 'connected') return; // // Don't stop/mutate if not connected

    updateMyPresence({ isDrawing: false });

    if (currentPathRef.current && currentPathRef.current.points.length > 1) {
      addPath(currentPathRef.current);
    }

    currentPathRef.current = null;
  }, [room, updateMyPresence, addPath]);

  // // I added a check for room connection status before handling pointer leave.
  const handlePointerLeave = useCallback(() => {
    if (room.getStatus() !== 'connected') return; // // Don't update presence/stop if not connected

    updateMyPresence({ cursor: null });
    if (isDrawing) {
        stopDrawing();
    }
  }, [room, updateMyPresence, isDrawing, stopDrawing]);


  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className={`bg-white border border-gray-400 shadow-md ${room.getStatus() === 'connected' ? 'cursor-crosshair' : 'cursor-wait'}`} // // Change cursor while connecting
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={handlePointerLeave}
      />
      {/* Render cursors for other users */}
      {/* // I also check connection status before mapping others, although less critical here */}
      {room.getStatus() === 'connected' && others.map(({ connectionId, presence }) => {
        if (presence.cursor) {
          return (
            <Cursor
              key={connectionId}
              x={presence.cursor.x}
              y={presence.cursor.y}
              color={presence.color}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

export default CanvasBoard;