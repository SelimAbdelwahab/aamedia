import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import logo from "./images/Double A media.jpg"

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <>
    <nav id="nav" className='nav-bar immovable'>
      <div id="company-info-container">
        <img id='nav-logo' srcset={logo} alt="Company Logo" />
        <p id='company-name' className='hide'>AA Media</p>
      </div>
    </nav>
    <App />
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
