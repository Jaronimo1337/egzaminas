import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import MainContextProvider from './contexts/MainContext.jsx';

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <MainContextProvider>
                <App />
            </MainContextProvider>
        </Router>
    </React.StrictMode>
);
