import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n';

// Suppress console warnings in production
if (process.env.NODE_ENV === 'production') {
  console.warn = () => {};
  console.error = () => {};
}

// Suppress specific deprecation warnings in development
const originalWarn = console.warn;
console.warn = (...args) => {
  const arg = args[0];
  if (
    typeof arg === 'string' &&
    (arg.includes('DeprecationWarning') ||
      arg.includes('DEP_WEBPACK') ||
      arg.includes('DEP0060') ||
      arg.includes('DEP0176') ||
      arg.includes('util._extend'))
  ) {
    return;
  }
  originalWarn(...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
