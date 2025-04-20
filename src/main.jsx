import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { RoomProvider } from './liveblocks.config'
import { LiveList, LiveMap } from "@liveblocks/client"
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RoomProvider
      id="my-whiteboard-room"
      initialPresence={{ cursor: null, color: '#000000', isDrawing: false }}
      initialStorage={{
        paths: new LiveList([]),
        notes: new LiveMap()
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RoomProvider>
  </React.StrictMode>,
)
