import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';

const HomePage: React.FC = () => {
  const { resetGame } = useGame();
  
  // Reset game state when starting a new game
  const handleStartGame = () => {
    resetGame();
  };

  return (
    <HomeContainer>
      <Content>
        <Title
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          ROAD RAGER
        </Title>
        
        <Subtitle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          TRUST NO ONE
        </Subtitle>
        
        <Description
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          In a city gripped by chaos, your only goal is to escape. 
          But in a world where everyone has their own agenda, who can you trust?
          Your choices will determine your fate.
        </Description>
        
        <ButtonContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <StartButton 
            as={Link} 
            to="/game"
            onClick={handleStartGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            START JOURNEY
          </StartButton>
        </ButtonContainer>
      </Content>
      
      <BackgroundOverlay />
    </HomeContainer>
  );
};

const HomeContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-image: url('/assets/background.jpg');
  background-size: cover;
  background-position: center;
  color: #fff;
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(20, 20, 20, 0.9));
  z-index: 1;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
  padding: 2rem;
  z-index: 2;
`;

const Title = styled(motion.h1)`
  font-size: 5rem;
  margin: 0;
  color: #ff5555;
  font-weight: 800;
  letter-spacing: 4px;
  text-shadow: 0 0 10px rgba(255, 85, 85, 0.5);

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled(motion.h2)`
  font-size: 2rem;
  margin: 0.5rem 0 2rem;
  letter-spacing: 8px;
  font-weight: 400;
  color: #aaa;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    letter-spacing: 5px;
  }
`;

const Description = styled(motion.p)`
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 600px;
  color: #ddd;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const ButtonContainer = styled(motion.div)`
  display: flex;
  gap: 1rem;
`;

const StartButton = styled(motion.button)`
  background-color: #ff5555;
  color: #000;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ff7777;
  }
`;

export default HomePage; 