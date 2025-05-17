import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';

const ResourcePanel: React.FC = () => {
  const { gameState } = useGame();
  const { resources, carHealth, day, location } = gameState;

  return (
    <PanelContainer 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <StatusSection>
        <StatusItem>
          <StatusLabel>Day</StatusLabel>
          <StatusValue>{day}</StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Location</StatusLabel>
          <StatusValue>{formatLocation(location)}</StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Car Health</StatusLabel>
          <ProgressBar>
            <ProgressFill 
              style={{ 
                width: `${carHealth}%`,
                backgroundColor: getHealthColor(carHealth) 
              }} 
            />
          </ProgressBar>
        </StatusItem>
      </StatusSection>

      <ResourcesSection>
        <ResourceItem>
          <ResourceIcon>⛽</ResourceIcon>
          <ResourceLabel>Fuel</ResourceLabel>
          <ResourceValue>{resources.fuel}</ResourceValue>
        </ResourceItem>
        <ResourceItem>
          <ResourceIcon>🍗</ResourceIcon>
          <ResourceLabel>Food</ResourceLabel>
          <ResourceValue>{resources.food}</ResourceValue>
        </ResourceItem>
        <ResourceItem>
          <ResourceIcon>💊</ResourceIcon>
          <ResourceLabel>Medicine</ResourceLabel>
          <ResourceValue>{resources.medicine}</ResourceValue>
        </ResourceItem>
        <ResourceItem>
          <ResourceIcon>🔧</ResourceIcon>
          <ResourceLabel>Parts</ResourceLabel>
          <ResourceValue>{resources.parts}</ResourceValue>
        </ResourceItem>
      </ResourcesSection>
    </PanelContainer>
  );
};

// Helper function to format location string
const formatLocation = (location: string): string => {
  return location
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to get color based on health value
const getHealthColor = (health: number): string => {
  if (health > 70) return '#4caf50'; // Green
  if (health > 30) return '#ff9800'; // Orange
  return '#f44336'; // Red
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
  left: 2rem;
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StatusItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const StatusLabel = styled.span`
  font-size: 0.8rem;
  color: #aaa;
`;

const StatusValue = styled.span`
  font-size: 1.1rem;
  font-weight: bold;
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: #333;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
`;

const ResourcesSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
`;

const ResourceItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
`;

const ResourceIcon = styled.span`
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
`;

const ResourceLabel = styled.span`
  font-size: 0.7rem;
  color: #aaa;
`;

const ResourceValue = styled.span`
  font-size: 1.1rem;
  font-weight: bold;
`;

export default ResourcePanel; 