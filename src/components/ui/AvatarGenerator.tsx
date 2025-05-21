import React from 'react';
import styled from 'styled-components';

interface AvatarGeneratorProps {
  name: string;
  faction: string;
  size?: number;
}

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ name, faction, size = 50 }) => {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();

  // Get background color based on faction
  const getBackgroundColor = () => {
    switch (faction) {
      case 'guardians': return '#4caf50';
      case 'scavengers': return '#ff9800';
      case 'truthers': return '#2196f3';
      case 'neocorp': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <AvatarContainer size={size} backgroundColor={getBackgroundColor()}>
      {initials}
    </AvatarContainer>
  );
};

interface AvatarContainerProps {
  size: number;
  backgroundColor: string;
}

const AvatarContainer = styled.div<AvatarContainerProps>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background-color: ${props => props.backgroundColor};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: ${props => props.size * 0.4}px;
  border: 2px solid #ff5555;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export default AvatarGenerator; 