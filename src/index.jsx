import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css'; // 有就載，沒有可先註解

const container = document.getElementById('root');
if (!container) {
  throw new Error('index.html 裡找不到 <div id="root"></div>');
}
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
