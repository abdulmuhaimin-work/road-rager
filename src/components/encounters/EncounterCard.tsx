import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Encounter, EncounterOption } from '../../data/encounters';
import { useGame } from '../../contexts/GameContext';
import MinigameManager, { MinigameType } from '../minigames/MinigameManager';

interface EncounterCardProps {
  encounter: Encounter;
  onComplete: () => void;
}

const EncounterCard: React.FC<EncounterCardProps> = ({ encounter, onComplete }) => {
  const [showOutcome, setShowOutcome] = useState(false);
  const [selectedOption, setSelectedOption] = useState<EncounterOption | null>(null);
  const [resourceWarning, setResourceWarning] = useState<string | null>(null);
  const [currentMinigame, setCurrentMinigame] = useState<MinigameType>(null);
  const [minigameCompleted, setMinigameCompleted] = useState(false);
  
  const { 
    gameState,
    updateResources, 
    updateCarHealth, 
    addCharacter, 
    updateCharacterTrust,
    completeEncounter,
    makeChoice,
    triggerEnding
  } = useGame();
  
  const { resources, carHealth } = gameState;
  
  // Start minigame if this encounter has one
  useEffect(() => {
    if (encounter.minigame && !showOutcome && !currentMinigame && !minigameCompleted) {
      console.log('Starting minigame:', encounter.minigame.type);
      setCurrentMinigame(encounter.minigame.type);
    }
  }, [encounter, showOutcome, currentMinigame, minigameCompleted]);
  
  // Check for critical resource levels
  useEffect(() => {
    if (resources.food <= 10) {
      setResourceWarning("Your food supplies are critically low!");
    } else if (resources.fuel <= 10) {
      setResourceWarning("You're almost out of fuel!");
    } else if (carHealth <= 20) {
      setResourceWarning("Your car is severely damaged and might break down!");
    } else {
      setResourceWarning(null);
    }
  }, [resources, carHealth]);

  const handleOptionSelect = (option: EncounterOption) => {
    console.log('Selected option:', option);
    setSelectedOption(option);
    
    // Record the choice
    makeChoice(option.id, option.id);
    
    // Apply resource effects
    if (option.resourceEffect) {
      console.log('Applying resource effects:', option.resourceEffect);
      updateResources(option.resourceEffect);
    }
    
    // Apply car health effects
    if (option.carHealthEffect) {
      console.log('Applying car health effect:', option.carHealthEffect);
      updateCarHealth(option.carHealthEffect);
    }
    
    // Apply trust effects
    if (option.trustEffect) {
      console.log('Applying trust effects:', option.trustEffect);
      option.trustEffect.forEach(effect => {
        updateCharacterTrust(effect.characterId, effect.amount);
      });
    }
    
    // Add new character if needed
    if (option.outcomes.addCharacter) {
      console.log('Adding character:', option.outcomes.addCharacter);
      addCharacter(option.outcomes.addCharacter);
    }
    
    // Handle game over
    if (option.outcomes.gameOver && option.outcomes.endingType) {
      console.log('Triggering ending:', option.outcomes.endingType);
      triggerEnding(option.outcomes.endingType);
    }
    
    // Mark encounter as completed
    console.log('Completing encounter:', encounter.id);
    completeEncounter(encounter.id);
    
    // If this option leads to another encounter, add it to completed as well
    // This is necessary for proper encounter chaining
    if (option.outcomes.nextEncounterId) {
      console.log('Next encounter ID:', option.outcomes.nextEncounterId);
    }
    
    // Show the outcome
    setShowOutcome(true);
  };

  const handleContinue = () => {
    console.log('Continuing after encounter');
    onComplete();
  };
  
  // Handle minigame completion
  const handleMinigameComplete = (success: boolean) => {
    console.log('EncounterCard: Minigame completed, success:', success);
    console.log('Current encounter state:', { showOutcome, currentMinigame, id: encounter.id });
    console.log('Auto progress flag:', encounter.autoProgressAfterMinigame);
    
    // Important: First set minigameCompleted to prevent restart  
    setMinigameCompleted(true);
    
    // Then immediately clear the current minigame
    setCurrentMinigame(null);
    
    // Use setTimeout to ensure state updates have been processed
    setTimeout(() => {
      // If we've been asked to auto-progress after the minigame, complete the encounter
      if (encounter.autoProgressAfterMinigame) {
        console.log('Auto-progressing after minigame');
        completeEncounter(encounter.id);
        onComplete();
      } else {
        console.log('Showing encounter options after minigame');
        // If there are additional rewards for the minigame success, you could add them here
      }
    }, 50); // Short timeout to ensure state updates happen
  };
  
  // If a minigame is in progress, render the MinigameManager
  if (currentMinigame) {
    return (
      <MinigameManager
        key={`${encounter.id}-${currentMinigame}`}
        minigameType={currentMinigame}
        difficulty={encounter.minigame?.difficulty || 'medium'}
        onComplete={handleMinigameComplete}
      />
    );
  }

  return (
    <CardContainer 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      <CardTitle>{encounter.title}</CardTitle>
      
      {resourceWarning && (
        <ResourceWarning>
          ⚠️ {resourceWarning}
        </ResourceWarning>
      )}
      
      {!showOutcome && (
        <>
          <CardDescription>{encounter.description}</CardDescription>
          
          <OptionsContainer>
            {encounter.options.map(option => (
              <OptionButton 
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                // Show resource impact for options that affect resources
                $hasResourceEffect={!!option.resourceEffect || option.carHealthEffect !== undefined}
              >
                <OptionText>{option.text}</OptionText>
                
                {/* Show resource effects preview */}
                {(option.resourceEffect || option.carHealthEffect !== undefined) && (
                  <ResourceEffects>
                    {option.resourceEffect?.fuel !== undefined && (
                      <ResourceEffect $positive={option.resourceEffect.fuel > 0}>
                        Fuel: {option.resourceEffect.fuel > 0 ? '+' : ''}{option.resourceEffect.fuel}
                      </ResourceEffect>
                    )}
                    {option.resourceEffect?.food !== undefined && (
                      <ResourceEffect $positive={option.resourceEffect.food > 0}>
                        Food: {option.resourceEffect.food > 0 ? '+' : ''}{option.resourceEffect.food}
                      </ResourceEffect>
                    )}
                    {option.resourceEffect?.medicine !== undefined && (
                      <ResourceEffect $positive={option.resourceEffect.medicine > 0}>
                        Medicine: {option.resourceEffect.medicine > 0 ? '+' : ''}{option.resourceEffect.medicine}
                      </ResourceEffect>
                    )}
                    {option.resourceEffect?.parts !== undefined && (
                      <ResourceEffect $positive={option.resourceEffect.parts > 0}>
                        Parts: {option.resourceEffect.parts > 0 ? '+' : ''}{option.resourceEffect.parts}
                      </ResourceEffect>
                    )}
                    {option.carHealthEffect !== undefined && (
                      <ResourceEffect $positive={option.carHealthEffect > 0}>
                        Car Health: {option.carHealthEffect > 0 ? '+' : ''}{option.carHealthEffect}
                      </ResourceEffect>
                    )}
                  </ResourceEffects>
                )}
              </OptionButton>
            ))}
          </OptionsContainer>
        </>
      )}
      
      {showOutcome && (
        <>
          <CardDescription>
            {selectedOption?.outcomes.text}
          </CardDescription>
          
          <ContinueButton 
            onClick={handleContinue}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue
          </ContinueButton>
        </>
      )}
    </CardContainer>
  );
};

const CardContainer = styled(motion.div)`
  background-color: rgba(0, 0, 0, 0.8);
  color: #f0f0f0;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.8rem;
  margin: 0;
  color: #ff5555;
  border-bottom: 1px solid rgba(255, 85, 85, 0.3);
  padding-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
`;

const ResourceWarning = styled.div`
  background-color: rgba(255, 193, 7, 0.2);
  border: 1px solid #ffc107;
  color: #ffc107;
  padding: 0.8rem;
  border-radius: 4px;
  font-weight: bold;
  text-align: center;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

interface OptionButtonProps {
  $hasResourceEffect: boolean;
}

const OptionButton = styled(motion.button)<OptionButtonProps>`
  background-color: rgba(255, 85, 85, 0.2);
  color: #f0f0f0;
  border: 1px solid #ff5555;
  border-radius: 4px;
  padding: 1rem;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  
  /* Add a subtle indicator for options with resource effects */
  ${props => props.$hasResourceEffect && `
    border-left: 4px solid #ff9800;
  `}

  &:hover {
    background-color: rgba(255, 85, 85, 0.4);
  }
`;

const OptionText = styled.span`
  /* Main option text */
`;

const ResourceEffects = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

interface ResourceEffectProps {
  $positive: boolean;
}

const ResourceEffect = styled.span<ResourceEffectProps>`
  font-size: 0.8rem;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  background-color: ${props => props.$positive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  color: ${props => props.$positive ? '#4caf50' : '#f44336'};
  font-weight: bold;
`;

const ContinueButton = styled(motion.button)`
  background-color: #ff5555;
  color: #000;
  border: none;
  border-radius: 4px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  align-self: center;
  min-width: 150px;
`;

export default EncounterCard; 