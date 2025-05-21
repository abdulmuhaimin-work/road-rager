import { MinigameType } from '../components/minigames/MinigameManager';

export interface Encounter {
  id: string;
  title: string;
  description: string;
  type: 'combat' | 'dialogue' | 'exploration' | 'resource' | 'story';
  isFirstAppearance?: boolean;
  character?: string;
  location: string;
  day?: number;
  requiredChoice?: {
    choiceId: string;
    value: string;
  };
  minigame?: {
    type: MinigameType;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  autoProgressAfterMinigame?: boolean;
  options: EncounterOption[];
  isDeceptive?: boolean;
}

export interface EncounterOption {
  id: string;
  text: string;
  resourceEffect?: {
    food?: number;
    fuel?: number;
    medicine?: number;
    parts?: number;
  };
  carHealthEffect?: number;
  trustEffect?: Array<{
    characterId: string;
    amount: number;
  }>;
  outcomes: {
    text: string;
    nextEncounterId?: string;
    addCharacter?: Character;
    gameOver?: boolean;
    endingType?: string;
  };
}

interface Character {
  id: string;
  name: string;
  trustLevel: number;
  isTrustworthy: boolean;
  faction: 'guardians' | 'scavengers' | 'truthers' | 'neocorp' | 'none';
  description: string;
  metAt: string;
}

export const encounters: Encounter[] = [
  {
    id: 'apartment-start',
    title: 'The Beginning',
    description: 'You wake up in your apartment to the sound of distant explosions. Your sister, Dr. Emily Chen, bursts in, her face pale with fear.',
    type: 'story',
    isFirstAppearance: true,
    character: 'player-sister',
    location: 'apartment',
    day: 1,
    options: [
      {
        id: 'listen-sister',
        text: 'Listen to what she has to say',
        outcomes: {
          text: 'Emily explains that NeoCorp has weaponized Project Phoenix, turning people into mindless drones. We need to escape the city.',
          nextEncounterId: 'apartment-escape'
        }
      }
    ]
  },
  {
    id: 'apartment-escape',
    title: 'Escape Plan',
    description: 'Emily has a plan. We need to gather supplies and find a working vehicle before NeoCorp\'s forces reach this district.',
    type: 'dialogue',
    character: 'player-sister',
    location: 'apartment',
    options: [
      {
        id: 'gather-supplies',
        text: 'Start gathering supplies',
        resourceEffect: {
          food: 20,
          medicine: 10
        },
        outcomes: {
          text: 'You quickly pack essential supplies while Emily secures the apartment.',
          nextEncounterId: 'apartment-vehicle'
        }
      }
    ]
  },
  {
    id: 'apartment-vehicle',
    title: 'Vehicle Search',
    description: 'You need to find a working vehicle. The parking garage might have something usable.',
    type: 'exploration',
    location: 'apartment',
    options: [
      {
        id: 'search-garage',
        text: 'Search the parking garage',
        outcomes: {
          text: 'You find an old but functional car. It needs some repairs, but it should work.',
          nextEncounterId: 'apartment-repair'
        }
      }
    ]
  },
  {
    id: 'apartment-repair',
    title: 'Car Repairs',
    description: 'The car needs some basic repairs before it\'s roadworthy.',
    type: 'resource',
    location: 'apartment',
    minigame: {
      type: 'repair',
      difficulty: 'medium'
    },
    autoProgressAfterMinigame: false,
    options: [
      {
        id: 'repair-car',
        text: 'Repair the car',
        carHealthEffect: 20,
        outcomes: {
          text: 'The car is now in working condition. Time to leave.',
          nextEncounterId: 'city-edge'
        }
      }
    ]
  },
  {
    id: 'city-edge',
    title: 'City Limits',
    description: 'You reach the edge of the city. A family is trying to escape, but their car has broken down.',
    type: 'dialogue',
    character: 'martinez-family',
    isFirstAppearance: true,
    location: 'city-edge',
    options: [
      {
        id: 'help-family',
        text: 'Offer to help them',
        resourceEffect: {
          food: -10,
          medicine: -5
        },
        outcomes: {
          text: 'The family is grateful for your help. They share some information about NeoCorp\'s checkpoints.',
          nextEncounterId: 'checkpoint-1'
        }
      }
    ]
  },
  {
    id: 'checkpoint-1',
    title: 'NeoCorp Checkpoint',
    description: 'A NeoCorp checkpoint blocks the road. A scientist approaches, claiming to have defected.',
    type: 'dialogue',
    character: 'dr-chen',
    isFirstAppearance: true,
    isDeceptive: true,
    location: 'checkpoint-1',
    options: [
      {
        id: 'trust-scientist',
        text: 'Trust the scientist',
        outcomes: {
          text: 'The scientist leads you into a trap. NeoCorp forces surround you.',
          addCharacter: {
            id: 'dr-chen',
            name: 'Dr. Sarah Chen',
            trustLevel: 0,
            isTrustworthy: false,
            faction: 'neocorp',
            description: 'A NeoCorp scientist who claims to have defected. But can you trust someone who helped create this nightmare?',
            metAt: 'checkpoint-1'
          },
          nextEncounterId: 'checkpoint-escape'
        }
      }
    ]
  },
  {
    id: 'checkpoint-escape',
    title: 'Escape the Checkpoint',
    description: 'You need to escape the NeoCorp forces. The car needs to be in top condition.',
    type: 'combat',
    location: 'checkpoint-1',
    minigame: {
      type: 'driving',
      difficulty: 'medium'
    },
    options: [
      {
        id: 'drive-escape',
        text: 'Make a break for it',
        carHealthEffect: -10,
        outcomes: {
          text: 'You manage to escape, but the car took some damage.',
          nextEncounterId: 'outskirts'
        }
      }
    ]
  },
  {
    id: 'outskirts',
    title: 'City Outskirts',
    description: 'You reach the outskirts of the city. A mechanic offers to help repair your car.',
    type: 'dialogue',
    character: 'mike',
    isFirstAppearance: true,
    location: 'outskirts',
    options: [
      {
        id: 'accept-help',
        text: 'Accept the mechanic\'s help',
        resourceEffect: {
          parts: 5
        },
        carHealthEffect: 15,
        outcomes: {
          text: 'The mechanic repairs your car and gives you some spare parts.',
          nextEncounterId: 'safe-zone'
        }
      }
    ]
  },
  {
    id: 'safe-zone',
    title: 'Safe Zone',
    description: 'You find a supposed safe zone. A former NeoCorp researcher claims to have a cure.',
    type: 'story',
    character: 'marcus',
    isFirstAppearance: true,
    location: 'safe-zone',
    minigame: {
      type: 'scavenge',
      difficulty: 'hard'
    },
    options: [
      {
        id: 'search-cure',
        text: 'Search for the cure',
        resourceEffect: {
          food: 10,
          medicine: 15
        },
        outcomes: {
          text: 'You find some supplies, but the cure remains elusive.',
          nextEncounterId: 'final-choice'
        }
      }
    ]
  }
];

// Helper function to get encounter by ID
export const getEncounterById = (id: string): Encounter | undefined => {
  return encounters.find(encounter => encounter.id === id);
};

// Function to get available encounters based on game state
export const getAvailableEncounters = (
  day: number,
  location: string,
  completedEncounters: string[],
  playerChoices: Record<string, string>
): Encounter[] => {
  console.log('Getting available encounters with', { day, location, completedEncounters, playerChoices });
  
  // If we're at the apartment on day 1 and haven't completed the intro, make sure it's available
  if (day === 1 && location === 'apartment' && !completedEncounters.includes('intro')) {
    const introEncounter = encounters.find(e => e.id === 'intro');
    if (introEncounter) {
      console.log('Found intro encounter for first-time player');
      return [introEncounter];
    }
  }
  
  // Check for encounters that should follow previous ones based on nextEncounterId
  // This has highest priority to ensure the story flows correctly
  for (const choiceId in playerChoices) {
    const encounterOption = findEncounterOptionById(choiceId);
    if (encounterOption && 
        encounterOption.outcomes.nextEncounterId && 
        !completedEncounters.includes(encounterOption.outcomes.nextEncounterId)) {
      const nextEncounter = encounters.find(e => e.id === encounterOption.outcomes.nextEncounterId);
      if (nextEncounter && nextEncounter.location === location) {
        console.log('Found next encounter based on previous choice:', nextEncounter.id);
        return [nextEncounter];
      }
    }
  }
  
  // Otherwise, filter encounters based on normal criteria
  const available = encounters.filter(encounter => {
    // Skip completed encounters
    if (completedEncounters.includes(encounter.id)) {
      return false;
    }
    
    // Check day restriction
    if (encounter.day !== undefined && encounter.day !== day) {
      return false;
    }
    
    // Check location
    if (encounter.location !== location) {
      return false;
    }
    
    // Check if required choices have been made
    if (encounter.requiredChoice) {
      const { choiceId, value } = encounter.requiredChoice;
      if (playerChoices[choiceId] !== value) {
        return false;
      }
    }
    
    return true;
  });
  
  console.log('Available encounters after filtering:', available.map(e => e.id));
  return available;
};

// Helper function to find an encounter option by its ID
function findEncounterOptionById(optionId: string): EncounterOption | undefined {
  for (const encounter of encounters) {
    for (const option of encounter.options) {
      if (option.id === optionId) {
        return option;
      }
    }
  }
  return undefined;
} 
