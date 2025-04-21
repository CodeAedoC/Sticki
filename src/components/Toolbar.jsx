import React from 'react';
import { useHistory, useRoom, useMutation } from '../liveblocks.config';

// Toolbar component receives necessary state and functions as props
function Toolbar({ color, setColor, addNote }) {
  const history = useHistory();
  const room = useRoom();

  // Clear canvas mutation can live here as it's a toolbar action
  const clearCanvas = useMutation(({ storage }) => {
    storage.get('paths').clear();
  }, []);

  return (
    <div className="toolbar">
      {/* Draw Group */}
      <div className="toolbar-group">
        <label htmlFor="colorPicker" title="Drawing Color">Draw:</label>
        <input
          type="color"
          id="colorPicker"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="color-picker"
        />
      </div>

      <div className="toolbar-separator"></div>

      {/* Objects Group */}
      <div className="toolbar-group">
        <button
          onClick={addNote}
          className="btn btn-primary"
          title="Add Sticky Note"
          disabled={room.getStatus() !== 'connected'}
        >
          + Note
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* History Group */}
      <div className="toolbar-group">
        <button
          onClick={() => history.undo()}
          className="btn btn-secondary"
          title="Undo"
          disabled={room.getStatus() !== 'connected'}
        >
          Undo
        </button>
        <button
          onClick={() => history.redo()}
          className="btn btn-secondary"
          title="Redo"
          disabled={room.getStatus() !== 'connected'}
        >
          Redo
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Clear Group */}
      <div className="toolbar-group">
        <button
          onClick={clearCanvas} // Use mutation defined in this component
          className="btn btn-secondary"
          title="Clear Canvas"
          disabled={room.getStatus() !== 'connected'}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default Toolbar; 