export const speakText = (text: string, voiceIndex = 0, rate = 1, pitch = 1) => {
  // Check browser support
  if (!('speechSynthesis' in window)) {
    console.error('Browser does not support speech synthesis');
    return null;
  }

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get available voices
  const voices = window.speechSynthesis.getVoices();
  
  // Set voice (if available)
  if (voices.length > voiceIndex) {
    utterance.voice = voices[voiceIndex];
  }
  
  // Set other properties
  utterance.rate = rate;  // Speed (0.1 to 10)
  utterance.pitch = pitch; // Pitch (0 to 2)
  
  // Speak
  window.speechSynthesis.speak(utterance);
  
  return {
    stop: () => window.speechSynthesis.cancel(),
    pause: () => window.speechSynthesis.pause(),
    resume: () => window.speechSynthesis.resume()
  };
};

// Get available voices (call this when setting up character voices)
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!('speechSynthesis' in window)) return [];
  
  // Some browsers load voices asynchronously, so this might initially return an empty array
  const voices = window.speechSynthesis.getVoices();
  
  return voices;
};

// Force voice loading (useful for browsers that load voices asynchronously)
export const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // If voices aren't loaded yet, wait for the voiceschanged event
    window.speechSynthesis.onvoiceschanged = () => {
      const updatedVoices = window.speechSynthesis.getVoices();
      resolve(updatedVoices);
    };
  });
}; 