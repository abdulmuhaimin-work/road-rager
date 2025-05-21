import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Vector3 } from 'three';
import styled from 'styled-components';

interface DrivingGameProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (success: boolean, score: number) => void;
}

// Add interface for DrivingScene props
interface DrivingSceneProps {
  speed: number;
  obstacleFrequency: number;
  onCollision: () => void;
  onScore: (points: number) => void;
}

interface Obstacle {
  id: number;
  position: Vector3;
  scale: Vector3;
  type: 'rock' | 'debris' | 'car';
  color: string;
}

type GameStatus = 'playing' | 'success' | 'failed';

const DrivingGame: React.FC<DrivingGameProps> = ({ difficulty, onComplete }) => {
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0); // Add ref to track score
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to complete
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const completionSentRef = useRef(false);
  
  // Game difficulty settings
  const difficultySettings = useMemo(() => ({
    easy: { obstacleSpeed: 0.1, obstacleFrequency: 0.008, timeLimit: 40 },
    medium: { obstacleSpeed: 0.15, obstacleFrequency: 0.012, timeLimit: 30 },
    hard: { obstacleSpeed: 0.2, obstacleFrequency: 0.015, timeLimit: 25 }
  }), []);
  
  const settings = difficultySettings[difficulty];
  
  // Update score ref whenever score changes
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  
  // Set up the game timer
  useEffect(() => {
    setTimeLeft(settings.timeLimit);
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameOver(true);
          // Complete with success if score is high enough
          const threshold = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 75 : 100;
          const success = scoreRef.current >= threshold; // Use ref instead of state
          setGameStatus(success ? 'success' : 'failed');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [difficulty, settings.timeLimit]); // Remove score from dependencies

  // Handle game completion
  const handleGameComplete = () => {
    setGameOver(true);
    setGameStatus('success');
  };
  
  // Handle collision with obstacle
  const handleCollision = () => {
    setGameOver(true);
    setGameStatus('failed');
  };
  
  // Add points to score
  const addPoints = (points: number) => {
    setScore(prev => prev + points);
  };

  // Handle the game completion after status is set
  useEffect(() => {
    if (gameOver && !completionSentRef.current) {
      completionSentRef.current = true; // Mark as sent to prevent multiple completions
      
      const timer = setTimeout(() => {
        console.log('DrivingGame: Sending completion with status:', gameStatus, 'score:', score);
        onComplete(gameStatus === 'success', score);
      }, 2000); // Wait 2 seconds before sending the game completion callback
      
      return () => clearTimeout(timer);
    }
  }, [gameOver, gameStatus, onComplete, score]);

  return (
    <GameContainer>
      <HUD>
        <ScoreDisplay>Score: {score}</ScoreDisplay>
        <TimeDisplay>Time: {timeLeft}s</TimeDisplay>
      </HUD>
      
      <Canvas 
        shadows 
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: '#1a1a2e' }}
        gl={{ 
          powerPreference: 'default',
          antialias: false, 
          depth: true,
          alpha: false,
          stencil: false,
          precision: 'lowp'
        }}
        dpr={1} // Set to 1 for best performance
        frameloop="demand"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        
        {!gameOver && (
          <DrivingScene 
            speed={settings.obstacleSpeed}
            obstacleFrequency={settings.obstacleFrequency}
            onCollision={handleCollision}
            onScore={addPoints}
          />
        )}
        
        {gameOver && (
          <GameOverDisplay score={score} status={gameStatus} />
        )}
        
        <Ground />
        <OrbitControls enabled={false} />
      </Canvas>
      
      {!gameOver && (
        <Controls>
          <ControlButton onClick={handleGameComplete}>
            Finish Early
          </ControlButton>
          <ControlsText>Use A/D or Left/Right Arrow Keys to move your car</ControlsText>
        </Controls>
      )}
      
      {gameOver && (
        <GameOverMessage status={gameStatus}>
          {gameStatus === 'success' 
            ? "Success! You navigated safely." 
            : "You crashed! Better luck next time."}
          <ContinueText>Continuing to the next part of your journey...</ContinueText>
        </GameOverMessage>
      )}
    </GameContainer>
  );
};

// 3D Scene for the driving game
const DrivingScene: React.FC<DrivingSceneProps> = ({ speed, obstacleFrequency, onCollision, onScore }) => {
  const [carPosition, setCarPosition] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [hasCollided, setHasCollided] = useState(false);
  
  // Create lane markers - static positions
  const laneMarkers = useMemo(() => {
    const markers = [];
    for (let i = 0; i < 10; i++) {
      markers.push(new Vector3(0, 0.01, -i * 10));
    }
    return markers;
  }, []);
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasCollided) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setCarPosition(prev => Math.max(prev - 0.5, -4));
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setCarPosition(prev => Math.min(prev + 0.5, 4));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasCollided]);
  
  // Main game loop
  useFrame((state, delta) => {
    if (hasCollided) return;
    
    // Add new obstacles occasionally with rate limiting
    if (Math.random() < obstacleFrequency * delta * 60 && obstacles.length < 10) {
      const obstacleTypes = ['rock', 'car'] as const; // Simplified to fewer types
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const colors = {
        rock: '#8B4513',
        car: '#4682B4',
        debris: '#808080'
      };
      
      const newObstacle = {
        id: Date.now(),
        position: new Vector3(Math.random() * 8 - 4, 0.5, -50),
        scale: type === 'car' 
          ? new Vector3(1, 1, 2) 
          : new Vector3(1, 1, 1),
        type,
        color: colors[type]
      };
      
      setObstacles(prev => [...prev, newObstacle]);
    }
    
    // Update obstacle positions and check collisions
    setObstacles(prev => {
      // Move obstacles
      const updated = prev.map(obstacle => {
        obstacle.position.z += speed * delta * 60;
        return obstacle;
      });
      
      // Check collisions
      for (const obstacle of updated) {
        const collisionThreshold = obstacle.type === 'car' ? 1.5 : 1;
        if (Math.abs(obstacle.position.x - carPosition) < collisionThreshold && 
            Math.abs(obstacle.position.z) < collisionThreshold && !hasCollided) {
          setHasCollided(true);
          onCollision();
          break;
        }
      }
      
      // Remove obstacles that are off-screen
      return updated.filter(obstacle => {
        if (obstacle.position.z > 10) {
          onScore(10);
          return false;
        }
        return true;
      });
    });
  });
  
  return (
    <>
      {/* Car */}
      <mesh position={[carPosition, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 0.6, 2]} />
        <meshStandardMaterial color="red" />
        
        {/* Car details */}
        <mesh position={[0, 0.35, 0.2]} castShadow>
          <boxGeometry args={[0.8, 0.3, 1]} />
          <meshStandardMaterial color="#880000" />
        </mesh>
        
        {/* Wheels - simplified to just 4 static elements */}
        {[
          [0.6, -0.3, 0.6] as [number, number, number],
          [-0.6, -0.3, 0.6] as [number, number, number],
          [0.6, -0.3, -0.6] as [number, number, number],
          [-0.6, -0.3, -0.6] as [number, number, number]
        ].map((pos, i) => (
          <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
            <meshStandardMaterial color="black" />
          </mesh>
        ))}
      </mesh>
      
      {/* Road - simplified */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 100]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Lane markers - reduced number */}
      {laneMarkers.map((marker, i) => (
        <mesh 
          key={i} 
          position={[0, 0.02, marker.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.2, 2]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      
      {/* Obstacles - simplified rendering */}
      {obstacles.map(obstacle => (
        <mesh
          key={obstacle.id}
          position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}
          scale={[obstacle.scale.x, obstacle.scale.y, obstacle.scale.z]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={obstacle.color} />
        </mesh>
      ))}
    </>
  );
};

// Ground plane - simplified
const Ground = () => {
  return (
    <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#555" />
    </mesh>
  );
};

// Game over display
interface GameOverDisplayProps {
  score: number;
  status: GameStatus;
}

const GameOverDisplay: React.FC<GameOverDisplayProps> = ({ score, status }) => {
  return (
    <Text
      position={[0, 2, 0]}
      fontSize={1}
      color={status === 'success' ? '#4caf50' : status === 'failed' ? '#ff5555' : '#ffffff'}
      anchorX="center"
      anchorY="middle"
    >
      {status === 'success' 
        ? `Success! Score: ${score}` 
        : status === 'failed'
          ? `Game Over! Score: ${score}`
          : `Score: ${score}`}
    </Text>
  );
};

const GameContainer = styled.div`
  width: 100%;
  height: 70vh;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  outline: none;
  &:focus {
    outline: none;
  }
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

const Controls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

interface GameOverMessageProps {
  status: GameStatus;
}

const GameOverMessage = styled.div<GameOverMessageProps>`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  background-color: ${props => 
    props.status === 'success' 
      ? 'rgba(76, 175, 80, 0.8)' 
      : props.status === 'failed'
        ? 'rgba(255, 85, 85, 0.8)'
        : 'rgba(0, 0, 0, 0.8)'
  };
  color: white;
  padding: 15px;
  font-size: 1.2rem;
  font-weight: bold;
`;

const ContinueText = styled.div`
  font-size: 0.9rem;
  margin-top: 10px;
  font-weight: normal;
`;

const ControlButton = styled.button`
  background-color: #ff5555;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background-color: #ff7777;
  }
`;

const ControlsText = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 0.9rem;
`;

export default DrivingGame; 