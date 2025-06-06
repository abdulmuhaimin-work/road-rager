import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import DrivingGame from './DrivingGame';
import RepairGame from './RepairGame';
import ScavengeGame from './ScavengeGame';
import { useGame } from '../../contexts/GameContext';

export type MinigameType = 'driving' | 'repair' | 'scavenge' | null;

interface MinigameManagerProps {
  minigameType: MinigameType;
  difficulty?: 'easy' | 'medium' | 'hard';
  onComplete: (success: boolean) => void;
}

const MinigameManager: React.FC<MinigameManagerProps> = ({   minigameType,   difficulty = 'medium',  onComplete }) => {  const [loading, setLoading] = useState(true);  const contextLossHandledRef = useRef(false);  const completionHandledRef = useRef(false);  const { updateResources, updateCarHealth } = useGame();    // WebGL context loss fallback with useRef to prevent race conditions  useEffect(() => {    const handleContextLoss = () => {      // Use ref to prevent multiple completions      if (contextLossHandledRef.current) return;      contextLossHandledRef.current = true;      
      console.log("WebGL context lost in MinigameManager, skipping minigame");      
      // Award a default score based on difficulty when WebGL fails      const defaultScore = difficulty === 'easy' ? 60 : difficulty === 'medium' ? 40 : 20;      
      // Process rewards as if the game completed with the default score      if (minigameType === 'driving') {        updateCarHealth(Math.floor(defaultScore / 20));      } else if (minigameType === 'repair') {        updateCarHealth(Math.floor(defaultScore / 10));        updateResources({ parts: -Math.floor(defaultScore / 50) });      } else if (minigameType === 'scavenge') {        updateResources({          food: Math.floor(defaultScore / 30),          medicine: Math.floor(defaultScore / 40),          parts: Math.floor(defaultScore / 50),          fuel: Math.floor(defaultScore / 60)        });      }      
      // Small delay for better UX      setTimeout(() => {        onComplete(true);      }, 500);    };        window.addEventListener('webglcontextlost', handleContextLoss);    return () => window.removeEventListener('webglcontextlost', handleContextLoss);  }, [onComplete, difficulty, minigameType, updateCarHealth, updateResources]);
  
  // Handle game completion with rewards based on success and game type
  const handleGameComplete = (success: boolean, score: number) => {
    // Prevent duplicate completion calls
    if (completionHandledRef.current || contextLossHandledRef.current) {
      console.log('Game completion already handled, ignoring duplicate call');
      return;
    }
    
    completionHandledRef.current = true;
    console.log(`Minigame completed: ${minigameType}, success: ${success}, score: ${score}`);
    
    if (success) {
      // Award resources based on game type and score
      switch(minigameType) {
        case 'driving':
          // Less car damage for successful driving
          updateCarHealth(Math.floor(score / 20));
          break;
        case 'repair':
          // Better car repair for successful repair game
          updateCarHealth(Math.floor(score / 10));
          updateResources({ parts: -Math.floor(score / 50) }); // Use some parts
          break;
        case 'scavenge':
          // Find resources when scavenging
          updateResources({
            food: Math.floor(score / 30),
            medicine: Math.floor(score / 40),
            parts: Math.floor(score / 50),
            fuel: Math.floor(score / 60)
          });
          break;
      }
    } else {
      // Penalties for failure
      switch(minigameType) {
        case 'driving':
          // Car takes damage
          updateCarHealth(-10);
          break;
        case 'repair':
          // Wasted parts
          updateResources({ parts: -3 });
          break;
        case 'scavenge':
          // Small chance of injury (no resources gained)
          break;
      }
    }
    
    // Signal completion
    onComplete(success);
  };
  
  // Simulate loading for better transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingText>Loading Minigame...</LoadingText>
        <LoadingBar>
          <LoadingProgress />
        </LoadingBar>
      </LoadingContainer>
    );
  }

  switch (minigameType) {
    case 'driving':
      return <DrivingGame difficulty={difficulty} onComplete={handleGameComplete} />;
    case 'repair':
      return <RepairGame difficulty={difficulty} onComplete={handleGameComplete} />;
    case 'scavenge':
      return <ScavengeGame difficulty={difficulty} onComplete={handleGameComplete} />;
    default:
      return null;
  }
};

const LoadingContainer = styled.div`
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
`;

const LoadingText = styled.div`
  font-size: 1.5rem;
  color: #ff5555;
  margin-bottom: 1rem;
`;

const LoadingBar = styled.div`
  width: 80%;
  height: 8px;
  background-color: #333;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const LoadingProgress = styled(motion.div).attrs({
  initial: { width: 0 },
  animate: { width: '100%' },
  transition: { duration: 1, ease: "easeInOut" },
})`
  height: 100%;
  background-color: #ff5555;
  position: absolute;
  top: 0;
  left: 0;
`;

export default MinigameManager; 