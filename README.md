```
   ___          ____  ___          _      _  __
  / _ \___ ____/ /  |/  /__ ____  (_)__ _| |/_/
 / ___/ _ `/ _  / /|_/ / _ `/ _ \/ / _ `/>  <
/_/   \_,_/\_,_/_/  /_/\_,_/_//_/_/\_,_/_/|_|

```

A pocket-sized cross-platform pixel art StepMania clone.

## About

PadManiacs is a lightweight rhythm game that brings the StepMania experience to web and mobile devices with a retro pixel art aesthetic. The game features core rhythm gameplay mechanics of StepMania, a popular open source rhythm game.

## Controls

### Keyboard
- **Arrow Keys**: Directional inputs (Left, Down, Up, Right)
- **W/A/S/D**: Secondary mapping for directional inputs
- **C/V/B/N**: Directional inputs (Dance Pad layout)
- **Z/J**: A button / Right column
- **X/K**: B button / Down column
- **Shift/Tab**: Select button
- **Enter/Esc**: Start button

### Gamepad
Standard gamepad layout with D-pad for directional inputs and face buttons for actions.

### Touch
Virtual controls appear automatically on mobile devices. Tap anywhere on the screen to show touch controls if they're hidden.

## Song Loading

### Default Songs
The game includes several built-in songs available in Free Play mode.

### External Songs (Mobile)
On Android devices, place song folders in `Internal Storage/PadManiacs/

Each song folder should contain:
- StepMania .sm chart file (required)
- Audio file (MP3, OGG, etc.)
- Optional banner/background images

You can have as many songs as you want.

### External Songs (Web)
Use "Load Single Song" from the Extra Songs menu. Select the entire folder containing the chart files when prompted. You may also use this on mobile to quick test individual songs

## Navigation

### Main Menu
- **Rhythm Game**: Start gameplay with default songs
- **Extra Songs**: Load external songs
- **Settings**: Configure game options

### Extra Songs Menu
- **Load External Songs**: Scan device storage for songs (only available on mobile)
- **Load Single Song**: Manually select a song folder

### Settings
- **Volume**: Controls the global music volume level (0%-100%)
- **Menu Music**: Sets menu background music behavior:
  - LAST SONG: Play the last song you played
  - RANDOM SONG: Plays a random song 
  - OFF: Disables menu music entirely
- **Auto-play**: Toggles automatic gameplay (notes play themselves)
- **Scroll Direction**: Changes note movement direction:
  - FALLING: Notes fall from top to bottom
  - RISING: Notes rise from bottom to top
- **Note Speed**: Adjusts the speed at which notes move:
  - Normal: Standard speed
  - Double: Twice the normal speed
- **Global Offset**: Fine-tunes audio synchronization (-400ms to +400ms in 25ms increments)
- **Note Colors**: Changes the appearance of notes:
  - NOTE: Default note colors
  - VIVID: More vibrant colors
  - FLAT: Solid, flat colors
  - RAINBOW: Multi-colored rainbow effect
- **Renderer**: Selects graphics rendering method:
  - AUTO: Automatically chooses best renderer
  - CANVAS: Uses Canvas rendering (faster)
  - WEBGL: Uses WebGL rendering (best performance)
- **Pixelated**: Toggles pixel-perfect scaling
- **Erase Highscores**: Permanently clears all saved high scores
- **Restore Default Settings**: Resets all settings to factory defaults
- **APPLY**: Applies changes and restarts if necessary

Changes are saved automatically when made. Some settings require app restart to take effect

## Format Support

- **StepMania (.sm)**: Fully supported
- **StepMania SSC (.ssc)**: Won't work
- **Background Videos**: Won't work

## Platforms

- Web browsers (desktop and mobile)
- Android devices (via Cordova)

## Known Limitations

- SSC chart format support not finished
- Background videos logic not finished
- Web version requires manual song loading
- Most mobile file browsers may require selecting individual files one by one
- No specific binary for desktop

## License

PadManiacs Non-Commercial License v1.0 - See LICENSE.txt for details.
