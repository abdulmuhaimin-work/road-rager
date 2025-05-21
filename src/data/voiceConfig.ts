export interface VoiceConfig {
  voiceIndex: number;  // Index of the voice in the available voices array
  rate: number;        // 0.1 to 10, with 1 being normal speed
  pitch: number;       // 0 to 2, with 1 being normal pitch
  volume?: number;     // 0 to 1
}

export const characterVoiceConfig: Record<string, VoiceConfig> = {
  'player-sister': {
    voiceIndex: 0,  // Female voice - determined at runtime
    rate: 1.1,      // Slightly faster for urgency
    pitch: 1.1      // Slightly higher pitch
  },
  'martinez-family': {
    voiceIndex: 1,  // Male voice - determined at runtime
    rate: 1,
    pitch: 0.9
  },
  'dr-chen': {
    voiceIndex: 2,  // Female voice - determined at runtime
    rate: 0.9,      // Slower for menacing effect
    pitch: 0.9      // Lower for authority
  },
  'mike': {
    voiceIndex: 3,  // Male voice - determined at runtime
    rate: 0.95,
    pitch: 0.8      // Lower for gruff mechanic
  },
  'marcus': {
    voiceIndex: 4,  // Male voice - determined at runtime
    rate: 0.9,
    pitch: 0.85
  }
};

// Helper function to get a character's voice config
export const getVoiceConfigForCharacter = (characterId: string): VoiceConfig => {
  return characterVoiceConfig[characterId] || {
    voiceIndex: 0,
    rate: 1,
    pitch: 1
  };
};

// Find appropriate voices based on language and gender
export const setupVoiceIndices = () => {
  if (!window.speechSynthesis) return;
  
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;

  // Get English voices
  const englishVoices = voices.filter(voice => 
    voice.lang.includes('en') || voice.lang.includes('EN')
  );
  
  if (englishVoices.length === 0) return;

  // Find female and male voices
  const femaleVoices = englishVoices.filter(voice => 
    voice.name.includes('female') || 
    voice.name.includes('woman') || 
    voice.name.toLowerCase().includes('girl') ||
    voice.name.includes('Samantha') ||
    voice.name.includes('Victoria') ||
    voice.name.includes('Karen') ||
    voice.name.includes('Moira') ||
    voice.name.includes('Tessa')
  );
  
  const maleVoices = englishVoices.filter(voice => 
    voice.name.includes('male') || 
    voice.name.includes('man') || 
    voice.name.toLowerCase().includes('boy') ||
    voice.name.includes('Daniel') ||
    voice.name.includes('David') ||
    voice.name.includes('George') ||
    voice.name.includes('James') ||
    voice.name.includes('John')
  );

  // Get indices in the original voices array
  const femaleIndices = femaleVoices.map(voice => voices.indexOf(voice));
  const maleIndices = maleVoices.map(voice => voices.indexOf(voice));

  // Assign voice indices if available
  if (femaleIndices.length > 0) {
    characterVoiceConfig['player-sister'].voiceIndex = femaleIndices[0];
    
    if (femaleIndices.length > 1) {
      characterVoiceConfig['dr-chen'].voiceIndex = femaleIndices[1];
    }
  }
  
  if (maleIndices.length > 0) {
    characterVoiceConfig['martinez-family'].voiceIndex = maleIndices[0];
    
    if (maleIndices.length > 1) {
      characterVoiceConfig['mike'].voiceIndex = maleIndices[1];
    }
    
    if (maleIndices.length > 2) {
      characterVoiceConfig['marcus'].voiceIndex = maleIndices[2];
    }
  }
}; 