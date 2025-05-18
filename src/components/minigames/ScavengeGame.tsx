import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Vector3 } from 'three';
import styled from 'styled-components';

interface ScavengeGameProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (success: boolean, score: number) => void;
}

interface Resource {
  id: number;
  type: 'food' | 'medicine' | 'fuel' | 'parts';
  position: Vector3;
  collected: boolean;
  value: number;
}

const ScavengeGame: React.FC<ScavengeGameProps> = ({ difficulty, onComplete }) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [resources, setResources] = useState<Resource[]>([]);
  const [playerPosition, setPlayerPosition] = useState(new Vector3(0, 0, 0));
  const [message, setMessage] = useState('Find and collect resources before time runs out!');
  
  // Game difficulty settings
  const difficultySettings = {
    easy: { resourceCount: 10, timeLimit: 40, area: 15 },
    medium: { resourceCount: 15, timeLimit: 30, area: 20 },
    hard: { resourceCount: 20, timeLimit: 25, area: 25 }
  };
  
  const settings = difficultySettings[difficulty];
  
  // Initialize resources
  useEffect(() => {
    const newResources: Resource[] = [];
    const resourceTypes: ('food' | 'medicine' | 'fuel' | 'parts')[] = ['food', 'medicine', 'fuel', 'parts'];
    
    for (let i = 0; i < settings.resourceCount; i++) {
      // Random position within the area
      const x = (Math.random() * 2 - 1) * settings.area;
      const z = (Math.random() * 2 - 1) * settings.area;
      
      // Random resource type
      const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      
      // Random value based on difficulty
      const baseValue = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
      const value = baseValue + Math.floor(Math.random() * baseValue);
      
      newResources.push({
        id: i,
        type,
        position: new Vector3(x, 0.5, z),
        collected: false,
        value
      });
    }
    
    setResources(newResources);
  }, [difficulty, settings.resourceCount, settings.area]);
  
  // Set up game timer
  useEffect(() => {
    setTimeLeft(settings.timeLimit);
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameOver(true);
          // Determine success based on score
          const threshold = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 150;
          onComplete(score >= threshold, score);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [difficulty, onComplete, score, settings.timeLimit]);
  
  // Handle collection of a resource
  const collectResource = (resourceId: number) => {
    const resourceIndex = resources.findIndex(r => r.id === resourceId);
    if (resourceIndex === -1 || resources[resourceIndex].collected) return;
    
    const resource = resources[resourceIndex];
    
    // Update resources
    const newResources = [...resources];
    newResources[resourceIndex].collected = true;
    setResources(newResources);
    
    // Update score
    const points = resource.value;
    setScore(prev => prev + points);
    
    // Show message
    setMessage(`Collected ${resource.type} worth ${points} points!`);
    
    // Check if all resources are collected
    const allCollected = newResources.every(r => r.collected);
    if (allCollected) {
      setGameOver(true);
      onComplete(true, score + points);
    }
  };
  
  // Handle player movement
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = 0.5;
    let newPosition = new Vector3().copy(playerPosition);
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        newPosition.z -= step;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        newPosition.z += step;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        newPosition.x -= step;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        newPosition.x += step;
        break;
    }
    
    // Limit player position to the area
    newPosition.x = Math.max(Math.min(newPosition.x, settings.area), -settings.area);
    newPosition.z = Math.max(Math.min(newPosition.z, settings.area), -settings.area);
    
    setPlayerPosition(newPosition);
    
    // Check for resource collection
    resources.forEach(resource => {
      if (!resource.collected && resource.position.distanceTo(newPosition) < 1) {
        collectResource(resource.id);
      }
    });
  };

  return (
    <GameContainer tabIndex={0} onKeyDown={handleKeyDown}>
      <HUD>
        <ScoreDisplay>Score: {score}</ScoreDisplay>
        <TimeDisplay>Time: {timeLeft}s</TimeDisplay>
        <ResourcesDisplay>
          Found: {resources.filter(r => r.collected).length}/{resources.length}
        </ResourcesDisplay>
      </HUD>
      
      <MessageBox>{message}</MessageBox>
      
      <Canvas shadows camera={{ position: [0, 20, 0], fov: 60 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[settings.area * 2, settings.area * 2]} />
          <meshStandardMaterial color="#3a5e3a" />
        </mesh>
        
        {/* Player */}
        <mesh position={[playerPosition.x, playerPosition.y, playerPosition.z]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#ff5555" />
        </mesh>
        
        {/* Resources */}
        {resources.map(resource => !resource.collected && (
          <mesh
            key={resource.id}
            position={resource.position}
            onClick={() => collectResource(resource.id)}
          >
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial 
              color={
                resource.type === 'food' ? '#8bc34a' : 
                resource.type === 'medicine' ? '#03a9f4' : 
                resource.type === 'fuel' ? '#ffc107' : 
                '#9c27b0'
              } 
            />
            <Text
              position={[0, 1, 0]}
              fontSize={0.3}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {resource.type}
            </Text>
          </mesh>
        ))}
        
        {gameOver && (
          <Text
            position={[0, 10, 0]}
            fontSize={1}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {`Game Over! Score: ${score}`}
          </Text>
        )}
        
        <OrbitControls target={[playerPosition.x, 0, playerPosition.z]} maxPolarAngle={Math.PI / 2.5} />
      </Canvas>
      
      <Instructions>
        Use WASD or Arrow Keys to move. Collect resources before time runs out!
      </Instructions>
    </GameContainer>
  );
};

const GameContainer = styled.div`
  width: 100%;
  height: 70vh;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  outline: none;
`;

const HUD = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ScoreDisplay = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: bold;
`;

const TimeDisplay = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: bold;
`;

const ResourcesDisplay = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: bold;
`;

const MessageBox = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 1.1rem;
  text-align: center;
  z-index: 10;
`;

const Instructions = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 0.9rem;
  z-index: 10;
  max-width: 250px;
`;

export default ScavengeGame; 