import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { Character } from '../../contexts/GameContext';

const CharacterPanel: React.FC = () => {
  const { gameState } = useGame();
  const { characters } = gameState;
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  // If no characters have been met yet
  if (characters.length === 0) {
    return (
      <PanelContainer 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <PanelTitle>Relationships</PanelTitle>
        <NoCharactersMessage>
          You haven't met anyone yet. Encounters with others will be displayed here.
        </NoCharactersMessage>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <PanelTitle>Relationships</PanelTitle>
      
      <CharactersGrid>
        {characters.map(character => (
          <CharacterAvatar 
            key={character.id}
            onClick={() => setSelectedCharacter(character)}
            $active={selectedCharacter?.id === character.id}
            trustLevel={character.trustLevel}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {character.name.charAt(0)}
          </CharacterAvatar>
        ))}
      </CharactersGrid>
      
      <AnimatePresence mode="wait">
        {selectedCharacter && (
          <CharacterDetails
            key={selectedCharacter.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CharacterName>{selectedCharacter.name}</CharacterName>
            <FactionBadge faction={selectedCharacter.faction}>
              {formatFaction(selectedCharacter.faction)}
            </FactionBadge>
            <CharacterDescription>
              {selectedCharacter.description}
            </CharacterDescription>
            <MetLocation>
              Met at: {formatLocation(selectedCharacter.metAt || '')}
            </MetLocation>
            
            <TrustLevelContainer>
              <TrustLevelLabel>Trust Level</TrustLevelLabel>
              <TrustLevelBar>
                <TrustLevelFill 
                  style={{ 
                    width: `${Math.abs(selectedCharacter.trustLevel)}%`,
                    marginLeft: selectedCharacter.trustLevel < 0 ? '0' : '50%',
                    marginRight: selectedCharacter.trustLevel < 0 ? '50%' : '0',
                    backgroundColor: getTrustColor(selectedCharacter.trustLevel)
                  }} 
                />
                <TrustLevelMidpoint />
              </TrustLevelBar>
              <TrustLevelScale>
                <span>Hostile</span>
                <span>Neutral</span>
                <span>Ally</span>
              </TrustLevelScale>
            </TrustLevelContainer>
            
            <CloseButton onClick={() => setSelectedCharacter(null)}>
              Close
            </CloseButton>
          </CharacterDetails>
        )}
      </AnimatePresence>
    </PanelContainer>
  );
};

// Helper function to format faction names
const formatFaction = (faction: string): string => {
  switch (faction) {
    case 'guardians': return 'The Guardians';
    case 'scavengers': return 'The Scavengers';
    case 'truthers': return 'The Truthers';
    case 'neocorp': return 'NeoCorp';
    default: return 'Unaffiliated';
  }
};

// Helper function to format location names
const formatLocation = (location: string): string => {
  return location
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to get color based on trust level
const getTrustColor = (trust: number): string => {
  if (trust > 50) return '#4caf50'; // Green for strong trust
  if (trust > 0) return '#8bc34a'; // Light green for mild trust
  if (trust > -50) return '#ff9800'; // Orange for mild distrust
  return '#f44336'; // Red for strong distrust
};

const PanelContainer = styled(motion.div)`
  background-color: rgba(0, 0, 0, 0.8);
  color: #f0f0f0;
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: fixed;
  top: 2rem;
  right: 2rem;
  overflow: hidden;
`;

const PanelTitle = styled.h3`
  font-size: 1.3rem;
  margin: 0;
  color: #ff5555;
  border-bottom: 1px solid rgba(255, 85, 85, 0.3);
  padding-bottom: 0.5rem;
`;

const NoCharactersMessage = styled.p`
  font-size: 0.9rem;
  color: #aaa;
  font-style: italic;
  margin: 0;
`;

const CharactersGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
`;

interface CharacterAvatarProps {
  $active: boolean;
  trustLevel: number;
}

const CharacterAvatar = styled(motion.div)<CharacterAvatarProps>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${props => getTrustColor(props.trustLevel)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #000;
  cursor: pointer;
  border: 3px solid ${props => props.$active ? '#fff' : 'transparent'};
  transition: border-color 0.3s;
`;

const CharacterDetails = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  overflow: hidden;
`;

const CharacterName = styled.h4`
  font-size: 1.2rem;
  margin: 0;
`;

interface FactionBadgeProps {
  faction: string;
}

const FactionBadge = styled.span<FactionBadgeProps>`
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  align-self: flex-start;
  background-color: ${props => {
    switch (props.faction) {
      case 'guardians': return 'rgba(76, 175, 80, 0.7)'; // Green
      case 'scavengers': return 'rgba(255, 152, 0, 0.7)'; // Orange
      case 'truthers': return 'rgba(33, 150, 243, 0.7)'; // Blue
      case 'neocorp': return 'rgba(156, 39, 176, 0.7)'; // Purple
      default: return 'rgba(158, 158, 158, 0.7)'; // Grey
    }
  }};
`;

const CharacterDescription = styled.p`
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
`;

const MetLocation = styled.span`
  font-size: 0.8rem;
  color: #aaa;
  font-style: italic;
`;

const TrustLevelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.5rem;
`;

const TrustLevelLabel = styled.span`
  font-size: 0.9rem;
  color: #ccc;
`;

const TrustLevelBar = styled.div`
  height: 8px;
  background-color: #333;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const TrustLevelFill = styled.div`
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  position: absolute;
  top: 0;
`;

const TrustLevelMidpoint = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  height: 100%;
  width: 2px;
  background-color: #ccc;
  transform: translateX(-50%);
`;

const TrustLevelScale = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #aaa;
`;

const CloseButton = styled.button`
  background-color: transparent;
  color: #ccc;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

export default CharacterPanel; 