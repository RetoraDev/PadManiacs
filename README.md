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

### External Songs
Place songs at `Path/To/PadManiacs/data/Songs/` folder

On Android devices, place song folders under `Internal Storage/PadManiacs/Songs/` folder

Each song folder should contain:
- StepMania .sm chart file (required)
- Audio file (MP3, OGG, etc.)
- Optional banner/background images

You can have as many songs as you want.

### Loading a single song
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
- **Menu Music**: Sets menu background music behavior
- **Auto-play**: Toggles automatic gameplay (notes play themselves)
- **Scroll Direction**: Changes note movement direction
- **Note Speed**: Adjusts the speed at which notes move
- **Global Offset**: Fine-tunes audio synchronization (-400ms to +400ms in 25ms increments)
- **Offset Assistant**: Interactive tool to help calibrate audio sync by tapping to a metronome
- **Note Colors**: Changes the appearance of notes
- **Visualizer**: Shows real-time gameplay data:
  - **NONE**: No visualizer
  - **ACURRACY**: Displays timing accuracy history
  - **AUDIO**: Shows audio frequency spectrum
  - **BPM**: Displays BPM changes and beat indicators
- **Metronome**: Adds rhythmic audio feedback during gameplay:
  - **OFF**: No metronome
  - **Quarters**: Plays on whole beats (1, 2, 3, 4...)
  - **Eighths**: Plays on half beats (1, 1.5, 2, 2.5...)
  - **Sixteenths**: Plays on quarter beats (1, 1.25, 1.5, 1.75...)
  - **Thirty-seconds**: Plays on eighth beats (1, 1.125, 1.25, 1.375...)
  - **NOTE**: Plays when notes reach the judge line (helps check chart sync)
- **Renderer**: Selects graphics rendering method
- **Pixelated**: Toggles pixel-perfect scaling
- **Erase Highscores**: Permanently clears all saved high scores
- **Restore Default Settings**: Resets all settings to factory defaults
- **APPLY**: Applies changes and restarts if necessary

Changes are saved automatically when made. Some settings require app restart to take effect

## Gameplay Features

### Metronome
Toggle during gameplay with the **Select** button. The metronome provides rhythmic feedback to help with timing:
- **Beat modes**: Play at regular intervals (Quarters, Eighths, etc.)
- **NOTE mode**: Plays exactly when notes reach the judge line - perfect for checking chart synchronization
- Status display shows current mode in the top-left corner during gameplay

### Visualizer
Choose from different visual feedback options in the HUD:
- **Accuracy**: Shows your timing consistency as a graph
- **Audio**: Real-time audio frequency display
- **BPM**: Shows current BPM and upcoming tempo changes

### Offset Assistant
Accessible from Settings, this tool helps you find the perfect audio sync:
- Pauses background music and plays a 120 BPM metronome
- Tap the **A button** in time with the ticks
- System calculates your offset and displays confidence level (white → yellow → green)
- Press **B button** to save the calculated offset and return to settings

## Modding & Add-ons

PadManiacs supports community-created modifications through an add-on system. Add-ons can:
- Replace game assets (arrows, backgrounds, UI elements)
- Add new behaviors and gameplay mechanics
- Extend the game with new features

See [Modding API Documentation](https://retoradev.github.io/PadManiacsDocumentation/) for complete modding information.

### Add-on Manager
Accessible from the main menu, the Add-on Manager allows you to:
- Install add-ons from ZIP files
- Enable/disable installed add-ons
- Hibernate add-ons to prevent loading
- Toggle safe mode to disable all add-ons

## Platform Support

- **Web browsers** (desktop and mobile)
- **Android devices** (via Cordova)
- **Desktop applications** (via NW.js with full file system access)

### Platform-Specific Features

**NW.js (Desktop):**
- Full file system access for songs and add-ons
- Native application exit
- Better performance and integration

**Cordova (Mobile):**
- External storage access for songs
- Mobile-optimized touch controls
- App exit functionality

**Web Browser:**
- Manual song loading via file dialogs
- Limited file system access
- Cross-platform compatibility

## Format Support

- **StepMania (.sm)**: Fully supported
- **StepMania SSC (.ssc)**: Won't work
- **Background Videos**: Supported but .AVI videos won't play

## Known Limitations

- SSC chart format support not finished
- Background videos will work, but .AVI format is not supported by HTML5 video player and won't load
- Web version requires manual song loading
- Doubles charts are converted to Singles 
- Most mobile file browsers may require selecting individual files one by one
- No specific binary for desktop

## License

PadManiacs Non-Commercial License v1.0 - See [LICENSE.txt](https://github.com/RetoraDev/PadManiacs/blob/7a62f8c8b18d6c00a7b032eb465748f81e9a5075/LICENCE.txt)  for details.
