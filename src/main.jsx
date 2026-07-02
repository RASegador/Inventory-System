import React from 'react';
import ReactDOM from 'react-dom/client';
import InventorySystem from './InventorySystem.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ padding: 24, minHeight: '100vh', boxSizing: 'border-box' }}>
      <InventorySystem />
    </div>
  </React.StrictMode>
);
