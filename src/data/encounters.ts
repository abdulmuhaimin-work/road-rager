export type EncounterOption = {
  id: string;
  text: string;
  resourceEffect?: {
    fuel?: number;
    food?: number;
    medicine?: number;
    parts?: number;
  };
  carHealthEffect?: number;
  trustEffect?: {
    characterId: string;
    amount: number;
  }[];
  outcomes: {
    text: string;
    nextEncounterId?: string;
    revealDeception?: boolean;
    addCharacter?: {
      id: string;
      name: string;
      trustLevel: number;
      isTrustworthy: boolean;
      faction: 'guardians' | 'scavengers' | 'truthers' | 'neocorp' | 'none';
      description: string;
      metAt: string;
    };
    gameOver?: boolean;
    endingType?: string;
  };
};

export type Encounter = {
  id: string;
  title: string;
  description: string;
  location: string;
  day?: number; // If specified, only appears on this day
  image?: string;
  character?: string; // Character ID if this encounter is tied to a specific character
  requiredChoice?: {
    choiceId: string;
    value: string;
  };
  options: EncounterOption[];
  isDeceptive?: boolean; // Does this encounter involve deception?
};

// Sample encounters array
export const encounters: Encounter[] = [
  {
    id: 'intro',
    title: 'Outbreak Day',
    description: 'Your phone buzzes with an urgent message from an old friend: "Get out of the city now. Don\'t trust anyone." Outside, you hear sirens and see people rushing through the streets. The news is reporting an unknown incident downtown.',
    location: 'apartment',
    day: 1,
    options: [
      {
        id: 'pack-and-leave',
        text: 'Pack essential supplies and leave immediately',
        resourceEffect: {
          food: 20,
          medicine: 10,
        },
        outcomes: {
          text: 'You quickly gather what supplies you can carry and rush to your car. The streets are already getting crowded with others trying to flee.',
          nextEncounterId: 'roadblock',
        },
      },
      {
        id: 'check-news',
        text: 'Wait and gather more information',
        outcomes: {
          text: 'You spend precious time monitoring the news as the situation worsens. Reports of strange behavior and violence are spreading across the city.',
          nextEncounterId: 'delayed-departure',
        },
      },
      {
        id: 'call-friend',
        text: 'Try to call your friend for more details',
        outcomes: {
          text: 'The call doesn\'t go through. You text instead and get a cryptic reply: "NeoCorp. Contamination. Eastern exit still clear." This doesn\'t make sense now, but you might remember it later.',
          nextEncounterId: 'roadblock',
        },
      },
    ],
  },
  {
    id: 'roadblock',
    title: 'Military Roadblock',
    description: 'You approach a military checkpoint. Armed soldiers are turning most vehicles away. A desperate family in a minivan is arguing with the soldiers.',
    location: 'city-edge',
    options: [
      {
        id: 'wait-in-line',
        text: 'Wait patiently for your turn',
        outcomes: {
          text: 'After a long wait, you reach the checkpoint. The soldier informs you that civilian evacuation has been suspended. You\'re ordered to return to your home for quarantine.',
          nextEncounterId: 'find-alternate-route',
        },
      },
      {
        id: 'help-family',
        text: 'Offer to help the arguing family',
        resourceEffect: {
          food: -10,
        },
        outcomes: {
          text: 'You approach the family and offer some of your supplies as a gesture of goodwill. They\'re grateful but still turned away. The father quietly mentions an unguarded service road a few miles east.',
          nextEncounterId: 'service-road',
          addCharacter: {
            id: 'martinez-family',
            name: 'Martinez Family',
            trustLevel: 20,
            isTrustworthy: true,
            faction: 'guardians',
            description: 'A family of four trying to escape the city. They seem honest and desperate.',
            metAt: 'city-edge',
          },
        },
      },
      {
        id: 'find-other-way',
        text: 'Turn around and look for another exit',
        outcomes: {
          text: 'You avoid the checkpoint entirely, deciding to find another way out. As you drive away, you notice others are doing the same.',
          nextEncounterId: 'find-alternate-route',
        },
      },
    ],
  },
  {
    id: 'delayed-departure',
    title: 'Chaos in the Streets',
    description: 'You waited too long. The streets are now filled with panicked people. Some are behaving strangely, showing signs of aggression. Your car is surrounded by a crowd trying to get out of the area.',
    location: 'downtown',
    options: [
      {
        id: 'push-through',
        text: 'Honk and slowly push through the crowd',
        carHealthEffect: -10,
        outcomes: {
          text: 'You manage to move forward, but your car takes some damage from people pounding on it. You\'ve made it out of the immediate danger zone.',
          nextEncounterId: 'find-alternate-route',
        },
      },
      {
        id: 'abandon-car',
        text: 'Abandon your car and continue on foot',
        resourceEffect: {
          food: -20,
          medicine: -10,
          parts: -20,
        },
        outcomes: {
          text: 'You grab what you can carry and slip into an alley. You\'ll need to find another vehicle, but at least you\'re mobile.',
          nextEncounterId: 'on-foot',
        },
      },
      {
        id: 'offer-ride',
        text: 'Offer a ride to someone who seems calm',
        outcomes: {
          text: 'You call out to a woman who seems less panicked than the others. She gratefully gets in, introducing herself as Dr. Sarah Chen, a researcher at NeoCorp. She might know something about what\'s happening.',
          nextEncounterId: 'dr-chen',
          addCharacter: {
            id: 'dr-chen',
            name: 'Dr. Sarah Chen',
            trustLevel: 0,
            isTrustworthy: false,
            faction: 'neocorp',
            description: 'A composed scientist who seems to have insider knowledge about the crisis.',
            metAt: 'downtown',
          },
        },
      },
    ],
  },
  {
    id: 'find-alternate-route',
    title: 'The Gas Station',
    description: 'With main roads blocked, you stop at a gas station to refuel and reconsider your options. Inside, you find a few people gathering supplies. The attendant looks nervous, hand under the counter.',
    location: 'gas-station',
    options: [
      {
        id: 'ask-directions',
        text: 'Ask the attendant about alternate routes',
        outcomes: {
          text: 'The attendant is suspicious at first but relaxes when you explain your situation. He mentions a maintenance tunnel that bypasses the main checkpoints but warns it might be dangerous.',
          nextEncounterId: 'tunnel-entrance',
        },
      },
      {
        id: 'listen-to-group',
        text: 'Eavesdrop on the group gathering supplies',
        outcomes: {
          text: 'The group is discussing a "safe zone" being established by someone called Marcus in the old industrial district. They seem to be collecting supplies for the community there.',
          nextEncounterId: 'approach-group',
        },
      },
      {
        id: 'take-supplies',
        text: 'Quickly grab supplies and leave',
        resourceEffect: {
          food: 30,
          medicine: 20,
          fuel: 40,
        },
        outcomes: {
          text: 'You stock up on essentials and fill your tank, paying with your last cash. As you leave, you notice a map on the wall showing service roads out of the city.',
          nextEncounterId: 'service-road',
        },
      },
    ],
  },
  // More encounters would be added here...
  {
    id: 'lone-traveler',
    title: 'A Lone Traveler',
    description: 'On a quiet stretch of road, you spot a man with a backpack walking alone. He waves at your car, clearly hoping for a ride.',
    location: 'outskirts',
    isDeceptive: true, // This encounter involves potential deception
    options: [
      {
        id: 'offer-ride',
        text: 'Stop and offer him a ride',
        outcomes: {
          text: 'The man introduces himself as Mike, a mechanic trying to reach his family in the next town. He seems friendly and offers to help if you have any car troubles.',
          addCharacter: {
            id: 'mike',
            name: 'Mike the Mechanic',
            trustLevel: 10,
            isTrustworthy: false, // He's actually a scavenger planning to steal supplies
            faction: 'scavengers',
            description: 'A friendly mechanic who seems helpful and knowledgeable about cars.',
            metAt: 'outskirts',
          },
          nextEncounterId: 'mike-conversation',
        },
      },
      {
        id: 'slow-down',
        text: 'Slow down but remain cautious',
        outcomes: {
          text: 'You slow down and talk through your window. Something about his story doesn\'t add up - there\'s motor oil on his hands, but his fingernails are too clean for a working mechanic. You decide to trust your instincts.',
          nextEncounterId: 'mike-rejected',
        },
      },
      {
        id: 'drive-past',
        text: 'Drive past without stopping',
        outcomes: {
          text: 'You drive past, watching in your rearview mirror. The man\'s friendly demeanor changes as you pass, and you notice him speaking into a radio. You made the right call - it was an ambush setup.',
          nextEncounterId: 'ambush-avoided',
        },
      },
    ],
  },
];

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