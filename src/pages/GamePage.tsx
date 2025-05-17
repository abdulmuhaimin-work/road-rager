import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { getAvailableEncounters, Encounter } from '../data/encounters';
import ResourcePanel from '../components/ui/ResourcePanel';
import CharacterPanel from '../components/ui/CharacterPanel';
import EncounterCard from '../components/encounters/EncounterCard';

const GamePage: React.FC = () => {
  const { gameState, advanceDay } = useGame();
  const { day, location, encountersCompleted, playerChoices, gameOver, endingType } = gameState;
  
  const [currentEncounter, setCurrentEncounter] = useState<Encounter | null>(null);
  const [showMap, setShowMap] = useState(false);
  
  // Available locations the player can travel to
  const availableLocations = [
    { id: 'downtown', name: 'Downtown', available: true },
    { id: 'city-edge', name: 'City Edge', available: day > 1 },
    { id: 'gas-station', name: 'Gas Station', available: encountersCompleted.includes('roadblock') || encountersCompleted.includes('delayed-departure') },
    { id: 'outskirts', name: 'Outskirts', available: encountersCompleted.includes('find-alternate-route') },
    { id: 'service-road', name: 'Service Road', available: encountersCompleted.includes('service-road') || (playerChoices['help-family'] === 'help-family') },
    { id: 'industrial-district', name: 'Industrial District', available: encountersCompleted.includes('approach-group') }
  ];
  
  // Check for available encounters when component mounts or gameState changes
  useEffect(() => {
    if (!gameOver && !currentEncounter && !showMap) {
      console.log('Looking for encounters:', { day, location, encountersCompleted, playerChoices });
      const availableEncounters = getAvailableEncounters(
        day,
        location,
        encountersCompleted,
        playerChoices
      );
      
      console.log('Available encounters:', availableEncounters);
      
      if (availableEncounters.length > 0) {
        // Pick the first available encounter
        setCurrentEncounter(availableEncounters[0]);
      } else {
        // If no encounters are available, show the map to travel
        setShowMap(true);
      }
    }
  }, [day, location, encountersCompleted, playerChoices, gameOver, currentEncounter, showMap]);
  
  // Handle encounter completion
  const handleEncounterComplete = () => {
    console.log('Encounter completed, setting currentEncounter to null');
    setCurrentEncounter(null);
  };
  
  // Handle location change
  const handleLocationChange = (newLocation: string) => {
    // We need to use the React state setter function with the gameState's location
    // This ensures we have the most up-to-date value
    console.log('Changing location to:', newLocation);
    
    // First close the map to prevent further clicks
    setShowMap(false);
    
    // Then advance the day which will update the location in the game state
    advanceDay(newLocation);
    
    // Set the encounter to null to trigger a search for encounters at the new location
    setCurrentEncounter(null);
  };
  
  // Handle game over and endings
  if (gameOver) {
    return (
      <GameOverContainer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <GameOverTitle>Game Over: {formatEndingType(endingType)}</GameOverTitle>
        <GameOverDescription>
          {getEndingDescription(endingType)}
        </GameOverDescription>
        <RestartButton onClick={() => window.location.reload()}>
          Start Again
        </RestartButton>
      </GameOverContainer>
    );
  }

  return (
    <GameContainer>
      {/* Background */}
      <BackgroundImage location={location} />
      
      {/* UI Components */}
      <ResourcePanel />
      <CharacterPanel />
      
      {/* Game Content */}
      <ContentArea>
        <AnimatePresence mode="wait">
          {currentEncounter && (
            <EncounterCard 
              key="encounter"
              encounter={currentEncounter}
              onComplete={handleEncounterComplete}
            />
          )}
          
          {showMap && (
            <MapContainer
              key="map"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
            >
              <MapTitle>Where to next?</MapTitle>
              <LocationsGrid>
                {availableLocations
                  .filter(loc => loc.available)
                  .map(loc => (
                    <LocationButton
                      key={loc.id}
                      onClick={() => handleLocationChange(loc.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={loc.id === location}
                      active={loc.id === location}
                    >
                      {loc.name}
                      {loc.id === location && " (Current)"}
                    </LocationButton>
                  ))
                }
              </LocationsGrid>
              <MapDescription>
                Traveling will advance to the next day. Your resources will be consumed.
              </MapDescription>
            </MapContainer>
          )}
        </AnimatePresence>
      </ContentArea>
    </GameContainer>
  );
};

// Helper function to format ending types
const formatEndingType = (endingType: string | null): string => {
  if (!endingType) return 'Unknown Ending';
  
  switch (endingType) {
    case 'lone-wolf': return 'Lone Wolf';
    case 'new-beginning': return 'New Beginning';
    case 'resistance': return 'The Resistance';
    case 'truth': return 'The Truth';
    case 'fall': return 'The Fall';
    default: return endingType.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
};

// Helper function to get ending descriptions
const getEndingDescription = (endingType: string | null): string => {
  if (!endingType) return 'Your journey has come to an end.';
  
  switch (endingType) {
    case 'lone-wolf':
      return "You managed to escape the city alone, trusting no one along the way. The road ahead is uncertain, but at least you're still alive and free. Behind you, Meridian City burns, its secrets intact.";
    
    case 'new-beginning':
      return "You escaped with a small group of people you chose to trust. Together, you've formed a tight-knit community of survivors, looking out for each other in this new world. Your shared experiences in Meridian have created an unbreakable bond.";
    
    case 'resistance':
      return "Instead of escaping, you joined the resistance against NeoCorp. Your knowledge and allies have made you a key figure in the fight to reclaim the city and expose the truth. The battle will be long, but you're no longer running.";
    
    case 'truth':
      return "You discovered the full extent of NeoCorp's experiments and managed to escape with proof. The world now knows what happened in Meridian City, and the conspiracy has been exposed. Your name will go down in history as the whistleblower who revealed the truth.";
    
    case 'fall':
      return "The paranoia was too much. In the end, you couldn't tell friend from foe, and your suspicion led to your downfall. You're still alive, but trapped within the quarantine zone, forever changed by what happened in Meridian City.";
    
    case 'starvation':
      return "Your supplies ran out. Weak from hunger, you couldn't continue your journey. The struggle to survive in Meridian City proved too difficult without adequate resources. Remember: in a crisis, managing your supplies is just as important as choosing your allies.";
    
    case 'stranded':
      return "Your vehicle ran out of fuel in the middle of nowhere. With no way to continue and miles from any safe location, you're stranded in dangerous territory. The distant sounds of approaching vehicles signal that your journey has come to an end.";
    
    case 'breakdown':
      return "Your car finally gave out. The damage it sustained was too much, and now you're forced to continue on foot. In this dangerous landscape, being without transportation is a death sentence. You should have taken better care of your only means of escape.";
    
    default:
      return 'Your journey has come to an end.';
  }
};

// Styled components
const GameContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface BackgroundImageProps {
  location: string;
}

const BackgroundImage = styled.div<BackgroundImageProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => getLocationImage(props.location)});
  background-size: cover;
  background-position: center;
  filter: brightness(0.4);
  transition: background-image 1s ease;
  z-index: -1;
`;

const ContentArea = styled.div`
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const MapContainer = styled(motion.div)`
  background-color: rgba(0, 0, 0, 0.8);
  color: #f0f0f0;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MapTitle = styled.h2`
  font-size: 1.8rem;
  margin: 0;
  color: #ff5555;
  border-bottom: 1px solid rgba(255, 85, 85, 0.3);
  padding-bottom: 0.5rem;
`;

const LocationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

interface LocationButtonProps {
  active: boolean;
  disabled: boolean;
}

const LocationButton = styled(motion.button)<LocationButtonProps>`
  background-color: ${props => props.active ? 'rgba(255, 85, 85, 0.7)' : 'rgba(255, 85, 85, 0.2)'};
  color: #f0f0f0;
  border: 1px solid #ff5555;
  border-radius: 4px;
  padding: 1rem;
  font-size: 1rem;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.disabled ? 'rgba(255, 85, 85, 0.7)' : 'rgba(255, 85, 85, 0.4)'};
  }
`;

const MapDescription = styled.p`
  font-size: 0.9rem;
  color: #aaa;
  font-style: italic;
  text-align: center;
  margin: 0;
`;

const GameOverContainer = styled(motion.div)`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.9);
  color: #f0f0f0;
  padding: 2rem;
  gap: 2rem;
`;

const GameOverTitle = styled.h1`
  font-size: 3rem;
  color: #ff5555;
  margin: 0;
  text-align: center;
`;

const GameOverDescription = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  max-width: 600px;
  text-align: center;
`;

const RestartButton = styled.button`
  background-color: #ff5555;
  color: #000;
  border: none;
  border-radius: 4px;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ff7777;
  }
`;

// Helper function to get background image based on location
const getLocationImage = (location: string): string => {
  // In a real app, you would import and use actual image files here
  // For MVP purposes, we'll just return placeholders
  switch (location) {
    case 'apartment':
      return '/assets/apartment.jpg';
    case 'downtown':
      return '/assets/downtown.jpg';
    case 'city-edge':
      return '/assets/city-edge.jpg';
    case 'gas-station':
      return '/assets/gas-station.jpg';
    case 'outskirts':
      return '/assets/outskirts.jpg';
    case 'service-road':
      return '/assets/service-road.jpg';
    case 'industrial-district':
      return '/assets/industrial-district.jpg';
    default:
      return '/assets/road.jpg';
  }
};

export default GamePage; 