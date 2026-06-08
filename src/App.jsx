import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import AppRoutes from './routes';

function App() {
  return (
    <Router>
      <ChatProvider>
        <AppRoutes />
      </ChatProvider>
    </Router>
  );
}

export default App;
