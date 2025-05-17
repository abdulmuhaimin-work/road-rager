import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export type Resource = {
  fuel: number;
  food: number;
  medicine: number;
  parts: number;
};

export type Character = {
  id: string;
  name: string;
  trustLevel: number; // -100 to 100
  isTrustworthy: boolean; // Hidden from player
  faction: 'guardians' | 'scavengers' | 'truthers' | 'neocorp' | 'none';
  description: string;
  metAt: string | null; // Location where player first met character
};

export type GameState = {
  day: number;
  location: string;
  resources: Resource;
  carHealth: number; // 0-100
  characters: Character[];
  encountersCompleted: string[];
  playerChoices: Record<string, string>; // Key: choiceId, Value: option chosen
  gameOver: boolean;
  endingType: string | null;
};

// Initial game state
const initialGameState: GameState = {
  day: 1,
  location: 'apartment', // Starting at apartment instead of downtown
  resources: {
    fuel: 50,
    food: 70,
    medicine: 30,
    parts: 20,
  },
  carHealth: 80,
  characters: [],
  encountersCompleted: [],
  playerChoices: {},
  gameOver: false,
  endingType: null,
};

// Context type
type GameContextType = {
  gameState: GameState;
  updateResources: (changes: Partial<Resource>) => void;
  updateCarHealth: (amount: number) => void;
  addCharacter: (character: Character) => void;
  updateCharacterTrust: (characterId: string, amount: number) => void;
  completeEncounter: (encounterId: string) => void;
  makeChoice: (choiceId: string, option: string) => void;
  advanceDay: (newLocation?: string) => void;
  triggerEnding: (endingType: string) => void;
  resetGame: () => void;
};

// Create context
const GameContext = createContext<GameContextType | null>(null);

// Provider component
type GameProviderProps = {
  children: ReactNode;
};

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  // Load game state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('roadRagerGameState');
    if (savedState) {
      setGameState(JSON.parse(savedState));
    }
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('roadRagerGameState', JSON.stringify(gameState));
  }, [gameState]);

  // Update resources
  const updateResources = (changes: Partial<Resource>) => {
    setGameState(prevState => ({
      ...prevState,
      resources: {
        ...prevState.resources,
        ...changes
      }
    }));
  };

  // Update car health
  const updateCarHealth = (amount: number) => {
    setGameState(prevState => ({
      ...prevState,
      carHealth: Math.max(0, Math.min(100, prevState.carHealth + amount))
    }));
  };

  // Add a new character
  const addCharacter = (character: Character) => {
    setGameState(prevState => ({
      ...prevState,
      characters: [...prevState.characters, character]
    }));
  };

  // Update character trust level
  const updateCharacterTrust = (characterId: string, amount: number) => {
    setGameState(prevState => ({
      ...prevState,
      characters: prevState.characters.map(char => 
        char.id === characterId 
        ? { 
            ...char, 
            trustLevel: Math.max(-100, Math.min(100, char.trustLevel + amount)) 
          } 
        : char
      )
    }));
  };

  // Mark an encounter as completed
  const completeEncounter = (encounterId: string) => {
    console.log('Completing encounter:', encounterId);
    if (!gameState.encountersCompleted.includes(encounterId)) {
      setGameState(prevState => ({
        ...prevState,
        encountersCompleted: [...prevState.encountersCompleted, encounterId]
      }));
    }
  };

  // Record a player choice
  const makeChoice = (choiceId: string, option: string) => {
    console.log('Making choice:', choiceId, option);
    setGameState(prevState => ({
      ...prevState,
      playerChoices: {
        ...prevState.playerChoices,
        [choiceId]: option
      }
    }));
  };

  // Advance to the next day, optionally with a new location
  const advanceDay = (newLocation?: string) => {
    console.log('Advancing day, new location:', newLocation);
    setGameState(prevState => {
      // Calculate new resource values
      const newFood = Math.max(0, prevState.resources.food - 10);
      const newFuel = Math.max(0, prevState.resources.fuel - 5);
      
      // Check for game over conditions
      if (newFood <= 0) {
        return {
          ...prevState,
          gameOver: true,
          endingType: 'starvation',
          resources: {
            ...prevState.resources,
            food: 0
          }
        };
      }
      
      if (newFuel <= 0 && newLocation !== prevState.location) {
        return {
          ...prevState,
          gameOver: true,
          endingType: 'stranded',
          resources: {
            ...prevState.resources,
            fuel: 0
          }
        };
      }
      
      if (prevState.carHealth <= 0) {
        return {
          ...prevState,
          gameOver: true,
          endingType: 'breakdown',
          carHealth: 0
        };
      }
      
      // If no game over condition, return updated state
      return {
        ...prevState,
        day: prevState.day + 1,
        location: newLocation || prevState.location,
        resources: {
          ...prevState.resources,
          food: newFood,
          fuel: newFuel
        }
      };
    });
  };

  // Trigger a game ending
  const triggerEnding = (endingType: string) => {
    setGameState(prevState => ({
      ...prevState,
      gameOver: true,
      endingType
    }));
  };

  // Reset the game to initial state
  const resetGame = () => {
    setGameState(initialGameState);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        updateResources,
        updateCarHealth,
        addCharacter,
        updateCharacterTrust,
        completeEncounter,
        makeChoice,
        advanceDay,
        triggerEnding,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 