export interface Character {
  id: string;
  name: string;
  avatar: string;
  faction: 'guardians' | 'scavengers' | 'truthers' | 'neocorp' | 'none';
  description: string;
  metAt: string;
  trustLevel: number;
  isTrustworthy: boolean;
  background?: string;
}

export const characters: Character[] = [
  {
    id: 'player-sister',
    name: 'Dr. Emily Chen',
    avatar: '/assets/avatars/sister.png',
    faction: 'truthers',
    description: 'Your sister, a brilliant researcher at NeoCorp. She discovered something terrible about Project Phoenix.',
    metAt: 'apartment',
    trustLevel: 100,
    isTrustworthy: true,
    background: 'A leading researcher in behavioral neuroscience, Emily was one of the first to discover the true nature of Project Phoenix.'
  },
  {
    id: 'dr-chen',
    name: 'Dr. Sarah Chen',
    avatar: '/assets/avatars/dr-chen.png',
    faction: 'neocorp',
    description: 'A NeoCorp scientist who claims to have defected. But can you trust someone who helped create this nightmare?',
    metAt: 'downtown',
    trustLevel: 0,
    isTrustworthy: false,
    background: 'Former head of Project Phoenix\'s behavioral modification division. Claims to have had a change of heart.'
  },
  {
    id: 'martinez-family',
    name: 'Carlos Martinez',
    avatar: '/assets/avatars/martinez.png',
    faction: 'guardians',
    description: 'A family of four trying to escape. The father, a former NeoCorp security guard, knows more than he\'s saying.',
    metAt: 'city-edge',
    trustLevel: 20,
    isTrustworthy: true,
    background: 'Former NeoCorp security guard who witnessed the early stages of Project Phoenix. Fled with his family when he realized what was happening.'
  },
  {
    id: 'mike',
    name: 'Mike the Mechanic',
    avatar: '/assets/avatars/mike.png',
    faction: 'neocorp',
    description: 'Claims to be a mechanic, but his knowledge of NeoCorp systems is suspiciously detailed. Is he a defector, or a plant?',
    metAt: 'outskirts',
    trustLevel: 10,
    isTrustworthy: false,
    background: 'A mysterious figure who seems to know too much about NeoCorp\'s systems. His true allegiance is unclear.'
  },
  {
    id: 'marcus',
    name: 'Marcus',
    avatar: '/assets/avatars/marcus.png',
    faction: 'truthers',
    description: 'A former NeoCorp researcher who claims to have found a way to reverse the effects of Project Phoenix.',
    metAt: 'safe-zone',
    trustLevel: 0,
    isTrustworthy: false,
    background: 'One of the original architects of Project Phoenix. Disappeared after the project was weaponized. Some say he\'s trying to atone, others believe he\'s still working for NeoCorp.'
  }
];

// Helper function to get character by ID
export const getCharacterById = (id: string): Character | undefined => {
  return characters.find(char => char.id === id);
};

// Helper function to get all characters by faction
export const getCharactersByFaction = (faction: string): Character[] => {
  return characters.filter(char => char.faction === faction);
}; 