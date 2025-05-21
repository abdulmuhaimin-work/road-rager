import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import GamePage from './pages/GamePage';
import HomePage from './pages/HomePage';
import VoiceSettingsPage from './pages/VoiceSettingsPage';
import { loadVoices } from './utils/speechSynthesis';
import { setupVoiceIndices } from './data/voiceConfig';
import './App.css';

const App: React.FC = () => {
  // Initialize voices when the app loads
  useEffect(() => {
    const initVoices = async () => {
      try {
        // Load voices and set up voice indices for characters
        await loadVoices();
        setupVoiceIndices();
        console.log('Voice synthesis initialized');
      } catch (error) {
        console.error('Failed to initialize voice synthesis:', error);
      }
    };
    
    initVoices();
  }, []);

  return (
    <Router>
      <GameProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/voice-settings" element={<VoiceSettingsPage />} />
        </Routes>
      </GameProvider>
    </Router>
  );
};

export default App;
