import React from 'react';

const CursorSvg = ({ color }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
      fill={color} // // Use the user's color for the cursor
    />
  </svg>
);

const Cursor = ({ x, y, color }) => {
  return (
    <div
      style={{ position: 'absolute', left: 0, top: 0, transform: `translateX(${x}px) translateY(${y}px)` }}
      className="pointer-events-none" 
    >
      <CursorSvg color={color} />
      <div style={{ backgroundColor: color, color: 'white', padding: '2px 4px', borderRadius: '2px', fontSize: '10px', whiteSpace: 'nowrap' }}>User Name</div>
    </div>
  );
};

export default Cursor; 