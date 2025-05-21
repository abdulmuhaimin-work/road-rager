import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import AvatarGenerator from './AvatarGenerator';
import AudioManager from './AudioManager';
import { speakText } from '../../utils/speechSynthesis';
import { getVoiceConfigForCharacter } from '../../data/voiceConfig';

interface Character {
  id: string;
  name: string;
  avatar: string;
  faction: 'guardians' | 'scavengers' | 'truthers' | 'neocorp' | 'none';
}

interface NarrationPanelProps {
  text: string;
  character?: Character;
  onComplete?: () => void;
  isTyping?: boolean;
  ambientSound?: string;
  voiceLine?: string;
  useSpeechSynthesis?: boolean;
}

const NarrationPanel: React.FC<NarrationPanelProps> = ({ 
  text, 
  character,
  onComplete,
  isTyping = true,
  ambientSound,
  voiceLine,
  useSpeechSynthesis = true
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const speechRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(prev => prev + text[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, 30); // Adjust typing speed here

    return () => clearInterval(interval);
  }, [text, isTyping, onComplete]);

  // Use speech synthesis for character dialog
  useEffect(() => {
    // Only speak if we have a character and speech synthesis is enabled
    if (character && useSpeechSynthesis && 'speechSynthesis' in window) {
      // Stop any previous speech
      if (speechRef.current) {
        speechRef.current.stop();
        speechRef.current = null;
      }

      // Get voice settings for this character
      const voiceConfig = getVoiceConfigForCharacter(character.id);
      
      // Start speaking with a slight delay to allow audio to initialize
      setTimeout(() => {
        speechRef.current = speakText(
          text,
          voiceConfig.voiceIndex,
          voiceConfig.rate,
          voiceConfig.pitch
        );
      }, 100);
    }

    // Cleanup speech when component unmounts
    return () => {
      if (speechRef.current) {
        speechRef.current.stop();
      }
    };
  }, [character, text, useSpeechSynthesis]);

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      setIsPlaying(false);
    };
  }, []);

  return (
    <AnimatePresence>
      <PanelContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        {/* Only use AudioManager for ambient sounds if not using speech synthesis */}
        {(!useSpeechSynthesis || !character) && (
          <AudioManager
            ambientSound={ambientSound}
            voiceLine={voiceLine}
            isPlaying={isPlaying}
          />
        )}
        
        {character && (
          <CharacterContainer>
            {!avatarError ? (
              <AvatarImage 
                src={character.avatar} 
                alt={character.name}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <AvatarGenerator 
                name={character.name}
                faction={character.faction}
                size={50}
              />
            )}
            <CharacterName faction={character.faction}>
              {character.name}
            </CharacterName>
          </CharacterContainer>
        )}
        
        <NarrationText>
          {displayedText}
          {!isComplete && <TypingCursor>|</TypingCursor>}
        </NarrationText>
      </PanelContainer>
    </AnimatePresence>
  );
};

const PanelContainer = styled(motion.div)`
  background-color: rgba(0, 0, 0, 0.85);
  border: 1px solid #ff5555;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  position: relative;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CharacterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const AvatarImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #ff5555;
  object-fit: cover;
`;

interface CharacterNameProps {
  faction: string;
}

const CharacterName = styled.div<CharacterNameProps>`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => {
    switch (props.faction) {
      case 'guardians': return '#4caf50';
      case 'scavengers': return '#ff9800';
      case 'truthers': return '#2196f3';
      case 'neocorp': return '#f44336';
      default: return '#ffffff';
    }
  }};
`;

const NarrationText = styled.div`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #f0f0f0;
  position: relative;
`;

const TypingCursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background-color: #ff5555;
  margin-left: 2px;
  animation: blink 1s infinite;
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

export default NarrationPanel; 