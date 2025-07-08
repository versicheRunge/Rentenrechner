// src/main.tsx
// KORRIGIERTE VERSION

import React from 'react';
import ReactDOM from 'react-dom/client';
// DIESE ZEILE WURDE KORRIGIERT: .tsx wurde entfernt
import App from './App'; 
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
