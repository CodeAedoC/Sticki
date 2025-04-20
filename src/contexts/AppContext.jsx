import React, { createContext, useState, useContext } from 'react';

// // I'm creating a context to hold application state.
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // // I added state for the current drawing color, defaulting to black.
  const [color, setColor] = useState('#000000');
  // // I removed the generic sharedState as we have specific state now.
  // const [sharedState, setSharedState] = useState({});

  return (
    // // I provided the color state and setter function.
    <AppContext.Provider value={{ color, setColor }}>
      {children}
    </AppContext.Provider>
  );
};

// // I added a custom hook for easier context consumption.
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 