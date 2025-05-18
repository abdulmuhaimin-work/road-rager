import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import styled from 'styled-components';

interface RepairGameProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (success: boolean, score: number) => void;
}

interface RepairPart {
  id: number;
  name: string;
  position: [number, number, number];
  repaired: boolean;
  correctOrderIndex: number;
}

const RepairGame: React.FC<RepairGameProps> = ({ difficulty, onComplete }) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [repairSequence, setRepairSequence] = useState<RepairPart[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [message, setMessage] = useState('Repair the car in the correct order!');
  
  // Game difficulty settings
  const difficultySettings = {
    easy: { partCount: 5, timeLimit: 40 },
    medium: { partCount: 7, timeLimit: 30 },
    hard: { partCount: 10, timeLimit: 25 }
  };
  
  const settings = difficultySettings[difficulty];
  
  // Initialize repair parts
  useEffect(() => {
    const parts: RepairPart[] = [];
    const partNames = [
      'Engine', 'Transmission', 'Brakes', 'Suspension', 
      'Cooling System', 'Fuel System', 'Exhaust', 'Battery',
      'Alternator', 'Starter Motor', 'Radiator', 'Air Filter'
    ];
    
    // Shuffle array for random order
    const shuffledNames = [...partNames].sort(() => 0.5 - Math.random());
    
    // Create parts based on difficulty
    for (let i = 0; i < settings.partCount; i++) {
      // Arrange in a circle around the car
      const angle = (Math.PI * 2 * i) / settings.partCount;
      const radius = 3;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      
      parts.push({
        id: i,
        name: shuffledNames[i],
        position: [x, 0.5, z],
        repaired: false,
        correctOrderIndex: i
      });
    }
    
    setRepairSequence(parts);
  }, [difficulty, settings.partCount]);
  
  // Set up the game timer
  useEffect(() => {
    setTimeLeft(settings.timeLimit);
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameOver(true);
          // Determine success based on progress
          const success = currentStep >= repairSequence.length * 0.7;
          onComplete(success, score);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [settings.timeLimit, onComplete, currentStep, repairSequence.length, score]);
  
  // Handle repair attempt
  const handleRepairAttempt = (partId: number) => {
    // Find the clicked part
    const partIndex = repairSequence.findIndex(part => part.id === partId);
    if (partIndex === -1) return;
    
    // Check if it's already repaired
    if (repairSequence[partIndex].repaired) {
      setMessage('This part is already repaired!');
      return;
    }
    
    // Check if it's the correct next part in sequence
    if (repairSequence[partIndex].correctOrderIndex === currentStep) {
      // Correct part
      const newParts = [...repairSequence];
      newParts[partIndex].repaired = true;
      setRepairSequence(newParts);
      
      // Update progress
      setCurrentStep(prev => prev + 1);
      
      // Add points
      const points = 10 + Math.floor(timeLeft / 2);
      setScore(prev => prev + points);
      
      setMessage(`Good job! ${repairSequence[partIndex].name} repaired!`);
      
      // Check if all parts are repaired
      if (currentStep + 1 >= repairSequence.length) {
        setGameOver(true);
        onComplete(true, score + points);
      }
    } else {
      // Wrong part
      setMessage('Wrong part! Check the repair manual for the correct order.');
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  return (
    <GameContainer>
      <HUD>
        <ScoreDisplay>Score: {score}</ScoreDisplay>
        <TimeDisplay>Time: {timeLeft}s</TimeDisplay>
        <ProgressDisplay>
          Repairs: {currentStep}/{repairSequence.length}
        </ProgressDisplay>
      </HUD>
      
      <MessageBox>{message}</MessageBox>
      
      <RepairManual>
        <ManualTitle>Repair Manual</ManualTitle>
        <PartList>
          {repairSequence.map((part, index) => (
            <PartItem key={part.id} repaired={part.repaired}>
              {index + 1}. {part.name}
            </PartItem>
          ))}
        </PartList>
      </RepairManual>
      
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 10, 5]} intensity={1} castShadow />
        
        {/* Car body */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 1, 5]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        
        {/* Repair parts */}
        {repairSequence.map(part => (
          <Part
            key={part.id}
            part={part}
            onClick={() => handleRepairAttempt(part.id)}
            isNextInSequence={part.correctOrderIndex === currentStep}
          />
        ))}
        
        {gameOver && (
          <Text
            position={[0, 3, 0]}
            fontSize={1}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {`Game Over! Score: ${score}`}
          </Text>
        )}
        
        <OrbitControls enableZoom={false} />
      </Canvas>
    </GameContainer>
  );
};

// Individual repair part component
interface PartProps {
  part: RepairPart;
  onClick: () => void;
  isNextInSequence: boolean;
}

const Part: React.FC<PartProps> = ({ part, onClick, isNextInSequence }) => {
  // Pulse animation for the next part in sequence
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    if (!isNextInSequence || part.repaired) return;
    
    let direction = 0.01;
    const animation = setInterval(() => {
      setScale(prev => {
        const next = prev + direction;
        if (next > 1.2) direction = -0.01;
        if (next < 0.9) direction = 0.01;
        return next;
      });
    }, 50);
    
    return () => clearInterval(animation);
  }, [isNextInSequence, part.repaired]);
  
  return (
    <mesh
      position={part.position}
      onClick={onClick}
      scale={part.repaired ? 0.7 : (isNextInSequence ? scale : 1)}
    >
      <sphereGeometry args={[0.6, 16, 16]} />
      <meshStandardMaterial
        color={part.repaired ? '#4caf50' : (isNextInSequence ? '#ff9800' : '#ff5555')}
        emissive={isNextInSequence ? '#ff9800' : 'black'}
        emissiveIntensity={isNextInSequence ? 0.5 : 0}
      />
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {part.name}
      </Text>
    </mesh>
  );
};

const GameContainer = styled.div`
  width: 100%;
  height: 70vh;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
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

const ProgressDisplay = styled.div`
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

const RepairManual = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 15px;
  border-radius: 4px;
  z-index: 10;
  max-height: 80%;
  overflow-y: auto;
`;

const ManualTitle = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid #ff5555;
  padding-bottom: 5px;
`;

const PartList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

interface PartItemProps {
  repaired: boolean;
}

const PartItem = styled.div<PartItemProps>`
  font-size: 0.9rem;
  padding: 5px;
  border-radius: 3px;
  background-color: ${props => props.repaired ? 'rgba(76, 175, 80, 0.3)' : 'transparent'};
  text-decoration: ${props => props.repaired ? 'line-through' : 'none'};
  color: ${props => props.repaired ? '#4caf50' : 'inherit'};
`;

export default RepairGame; 