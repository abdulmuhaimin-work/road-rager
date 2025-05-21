import React, { useEffect } from 'react';
import styled from 'styled-components';
import VoiceSelector from '../components/dev/VoiceSelector';
import { setupVoiceIndices } from '../data/voiceConfig';
import { loadVoices } from '../utils/speechSynthesis';

const VoiceSettingsPage: React.FC = () => {
  useEffect(() => {
    const initVoices = async () => {
      try {
        await loadVoices();
        setupVoiceIndices();
      } catch (error) {
        console.error('Failed to initialize voices:', error);
      }
    };
    
    initVoices();
  }, []);
  
  return (
    <PageContainer>
      <Header>
        <h1>Voice Settings</h1>
        <Description>
          Configure the voice settings for each character in the game. Select a character, 
          adjust their voice, rate, and pitch, then test and save the configuration.
        </Description>
      </Header>
      
      <VoiceSelector />
      
      <InfoSection>
        <h2>About Speech Synthesis</h2>
        <p>
          This tool uses the Web Speech API built into your browser to generate character voices.
          The available voices depend on your browser and operating system.
        </p>
        <p>
          For the best experience, we recommend using Chrome, Edge, or Safari, which typically
          have more voice options available.
        </p>
        <p>
          <strong>Note:</strong> Voice configurations are saved to memory only and will reset
          when you refresh the page. In a production version, these would be saved to local storage
          or a database.
        </p>
      </InfoSection>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #f0f0f0;
`;

const Header = styled.header`
  margin-bottom: 2rem;
  
  h1 {
    color: #ff5555;
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.5;
  max-width: 800px;
`;

const InfoSection = styled.section`
  margin-top: 3rem;
  padding: 1.5rem;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid #555;
  
  h2 {
    color: #ff5555;
    margin-top: 0;
  }
  
  p {
    margin-bottom: 1rem;
    line-height: 1.5;
  }
`;

export default VoiceSettingsPage; 