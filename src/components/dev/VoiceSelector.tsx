import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getAvailableVoices, speakText, loadVoices } from '../../utils/speechSynthesis';
import { characterVoiceConfig } from '../../data/voiceConfig';

const VoiceSelector: React.FC = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<number>(0);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('player-sister');
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [text, setText] = useState<string>("This is a test of the speech synthesis.");
  const [voicesLoaded, setVoicesLoaded] = useState<boolean>(false);
  
  // Load voices on component mount
  useEffect(() => {
    const initVoices = async () => {
      try {
        const availableVoices = await loadVoices();
        setVoices(availableVoices);
        setVoicesLoaded(true);
        
        // Set initial values based on the first character
        if (characterVoiceConfig[selectedCharacter]) {
          const config = characterVoiceConfig[selectedCharacter];
          setSelectedVoice(config.voiceIndex);
          setRate(config.rate);
          setPitch(config.pitch);
        }
      } catch (error) {
        console.error('Failed to load voices:', error);
      }
    };
    
    initVoices();
    
    // Set up event listener for voices changing
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoices(getAvailableVoices());
      };
    }
  }, [selectedCharacter]);
  
  // Update form when a different character is selected
  const handleCharacterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const characterId = e.target.value;
    setSelectedCharacter(characterId);
    
    if (characterVoiceConfig[characterId]) {
      const config = characterVoiceConfig[characterId];
      setSelectedVoice(config.voiceIndex);
      setRate(config.rate);
      setPitch(config.pitch);
    }
  };
  
  // Test the selected voice
  const handlePlay = () => {
    speakText(text, selectedVoice, rate, pitch);
  };
  
  // Update character voice config
  const updateCharacterVoice = () => {
    if (characterVoiceConfig[selectedCharacter]) {
      characterVoiceConfig[selectedCharacter] = {
        ...characterVoiceConfig[selectedCharacter],
        voiceIndex: selectedVoice,
        rate,
        pitch
      };
      
      alert(`Updated voice configuration for ${selectedCharacter}`);
    }
  };
  
  // Sample lines for characters
  const getSampleLine = () => {
    switch (selectedCharacter) {
      case 'player-sister':
        return "Wake up! NeoCorp has weaponized Project Phoenix. We need to leave now!";
      case 'martinez-family':
        return "Please help us! Our car broke down and we need to get out of the city.";
      case 'dr-chen':
        return "I've defected from NeoCorp. I can help you escape, but we need to move quickly.";
      case 'mike':
        return "Hey there! I'm Mike. I can help fix up that car of yours.";
      case 'marcus':
        return "Welcome to the safe zone. I'm Marcus, former NeoCorp researcher.";
      default:
        return "This is a sample voice line.";
    }
  };
  
  // Use sample line
  const useSampleLine = () => {
    const line = getSampleLine();
    setText(line);
  };
  
  if (!('speechSynthesis' in window)) {
    return (
      <Container>
        <h2>Voice Selector Tool</h2>
        <p>Your browser does not support the Speech Synthesis API.</p>
      </Container>
    );
  }
  
  return (
    <Container>
      <h2>Voice Selector Tool</h2>
      
      {!voicesLoaded ? (
        <p>Loading voices...</p>
      ) : (
        <>
          <Section>
            <Label>Character:</Label>
            <Select 
              value={selectedCharacter} 
              onChange={handleCharacterChange}
            >
              <option value="player-sister">Dr. Emily Chen (Player's Sister)</option>
              <option value="martinez-family">Martinez Family</option>
              <option value="dr-chen">Dr. Sarah Chen</option>
              <option value="mike">Mike (Mechanic)</option>
              <option value="marcus">Marcus</option>
            </Select>
          </Section>
          
          <Section>
            <Label>Text to speak:</Label>
            <TextArea 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              rows={3} 
            />
            <Button onClick={useSampleLine}>Use Sample Line</Button>
          </Section>
          
          <Section>
            <Label>Voice ({voices.length} available):</Label>
            <Select 
              value={selectedVoice} 
              onChange={(e) => setSelectedVoice(Number(e.target.value))}
            >
              {voices.map((voice, index) => (
                <option key={index} value={index}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </Select>
          </Section>
          
          <Section>
            <Label>Rate: {rate.toFixed(1)}</Label>
            <RangeInput 
              type="range" 
              min="0.1" 
              max="2" 
              step="0.1" 
              value={rate} 
              onChange={(e) => setRate(Number(e.target.value))} 
            />
          </Section>
          
          <Section>
            <Label>Pitch: {pitch.toFixed(1)}</Label>
            <RangeInput 
              type="range" 
              min="0.1" 
              max="2" 
              step="0.1" 
              value={pitch} 
              onChange={(e) => setPitch(Number(e.target.value))} 
            />
          </Section>
          
          <ButtonGroup>
            <Button onClick={handlePlay}>Test Voice</Button>
            <Button onClick={updateCharacterVoice}>Save Configuration</Button>
          </ButtonGroup>
          
          <ConfigDisplay>
            <h3>Current Voice Configuration:</h3>
            <pre>
              {JSON.stringify({
                character: selectedCharacter,
                voiceIndex: selectedVoice,
                voiceName: voices[selectedVoice]?.name || 'Unknown',
                rate,
                pitch
              }, null, 2)}
            </pre>
          </ConfigDisplay>
        </>
      )}
    </Container>
  );
};

// Styled components
const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #1a1a1a;
  border-radius: 8px;
  color: #f0f0f0;
  font-family: Arial, sans-serif;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: #333;
  color: #f0f0f0;
  border: 1px solid #555;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: #333;
  color: #f0f0f0;
  border: 1px solid #555;
  resize: vertical;
  font-family: Arial, sans-serif;
`;

const RangeInput = styled.input`
  width: 100%;
  background-color: #333;
  &::-webkit-slider-thumb {
    background-color: #ff5555;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  margin-top: 0.5rem;
  background-color: #ff5555;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background-color: #ff3333;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ConfigDisplay = styled.div`
  background-color: #333;
  padding: 1rem;
  border-radius: 4px;
  
  pre {
    margin: 0;
    white-space: pre-wrap;
  }
`;

export default VoiceSelector; 