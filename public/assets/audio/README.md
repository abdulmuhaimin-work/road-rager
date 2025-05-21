# Audio Files Structure

This directory contains all audio assets for the game. The structure is organized as follows:

## Ambient Sounds
Located in `/ambient/`:
- `combat.mp3` - Tense background music for combat encounters
- `dialogue.mp3` - Subtle background music for dialogue scenes
- `exploration.mp3` - Ambient sounds for exploration scenes
- `default.mp3` - Default background music

## Voice Lines
Located in `/voice/{character-id}/`:
Each character has their own directory with the following voice lines:
- `intro.mp3` - Character's introduction line
- `combat.mp3` - Combat-related voice line
- `dialogue.mp3` - Dialogue-related voice line
- `exploration.mp3` - Exploration-related voice line
- `resource.mp3` - Resource-related voice line
- `story.mp3` - Story-related voice line

## Audio Requirements
- Format: MP3
- Sample Rate: 44.1 kHz
- Bit Depth: 16-bit
- Channels: Stereo
- Ambient sounds should be loopable
- Voice lines should be clear and well-recorded
- File sizes should be optimized for web delivery

## Character Directories
- `player-sister/` - Dr. Emily Chen's voice lines
- `martinez-family/` - Martinez family's voice lines
- `dr-chen/` - Dr. Sarah Chen's voice lines
- `mike/` - Mike the mechanic's voice lines
- `marcus/` - Marcus's voice lines

## Placeholder Audio
Until final audio assets are available, placeholder audio files should be:
1. Clearly marked as placeholders
2. Similar in length to expected final audio
3. Representative of the intended mood/tone
4. Properly formatted and optimized 