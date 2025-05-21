import React, { useEffect, useRef } from 'react';

interface AudioManagerProps {
  ambientSound?: string;
  voiceLine?: string;
  isPlaying: boolean;
  volume?: number;
}

const AudioManager: React.FC<AudioManagerProps> = ({
  ambientSound,
  voiceLine,
  isPlaying,
  volume = 0.5
}) => {
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (ambientSound && isPlaying) {
      if (!ambientRef.current) {
        ambientRef.current = new Audio(ambientSound);
        ambientRef.current.loop = true;
        ambientRef.current.volume = volume * 0.3; // Ambient sounds are quieter
      }
      ambientRef.current.play().catch(console.error);
    }

    return () => {
      if (ambientRef.current) {
        ambientRef.current.pause();
        ambientRef.current.currentTime = 0;
      }
    };
  }, [ambientSound, isPlaying, volume]);

  useEffect(() => {
    if (voiceLine && isPlaying) {
      if (!voiceRef.current) {
        voiceRef.current = new Audio(voiceLine);
        voiceRef.current.volume = volume;
      }
      voiceRef.current.play().catch(console.error);
    }

    return () => {
      if (voiceRef.current) {
        voiceRef.current.pause();
        voiceRef.current.currentTime = 0;
      }
    };
  }, [voiceLine, isPlaying, volume]);

  return null; // This is a utility component, no visual elements
};

export default AudioManager; 