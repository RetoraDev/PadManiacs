<pre><code>
   ___          ____  ___          _      _  __
  / _ \___ ____/ /  |/  /__ ____  (_)__ _| |/_/
 / ___/ _ `/ _  / /|_/ / _ `/ _ \/ / _ `/>  <
/_/   \_,_/\_,_/_/  /_/\_,_/_//_/_/\_,_/_/|_|
</code></pre>

A pocket-sized cross-platform pixel art StepMania clone.

## About

PadManiacs is a lightweight rhythm game that brings the StepMania experience to web and mobile devices with a retro pixel art aesthetic. The game features core rhythm gameplay mechanics from StepMania, a popular open-source rhythm game.

[Play Latest Development Version](https://retoradev.github.io/PadManiacs/dist/)

[Play Stable Version on Itch.io](https://retora.itch.io/padmaniacs)

## Controls

### Keyboard Controls

**Directional Inputs:**
- **Arrow Keys**: Primary directional inputs (Left, Down, Up, Right)
- **W/A/S/D**: Secondary directional mapping
- **C/V/B/N**: Dance pad layout (Left, Down, Up, Right)

**Action Buttons:**
- **Z** or **J**: A button / Right column
- **X** or **K**: B button / Down column
- **Shift** or **Tab**: Select button
- **Enter** or **Escape**: Start button

### Gamepad
Standard gamepad layout with D-pad for directional inputs and face buttons for actions.

### Touch Controls
Virtual controls appear automatically on mobile devices. Tap anywhere on the screen to show touch controls if they are hidden.

## Song Loading

### Built-in Songs
The game includes several default songs available in Free Play mode.

### External Songs

**Desktop/Local Files:**
Place song folders in: `Path/To/PadManiacs/data/Songs/`

**Android Devices:**
Place song folders in: `Internal Storage/PadManiacs/Songs/`

**Song Folder Structure:**
Each song folder should contain:
- StepMania .sm chart file (required)
- Audio file (MP3, OGG, etc.)
- Optional banner and background images

You can add as many songs as desired.

### Loading Individual Songs
Use "Load Single Song" from the Extra Songs menu. Select the entire folder containing the chart files when prompted. This method works on both desktop and mobile for quick testing of individual songs.

## Settings

### Audio Settings
- **Volume**: Controls global music volume (0%-100%)
- **Menu Music**: Sets menu background music behavior
- **Global Offset**: Fine-tunes audio synchronization (-400ms to +400ms in 25ms increments)

### Gameplay Settings
- **Auto-play**: Toggles automatic gameplay (notes play themselves)
- **Scroll Direction**: Changes note movement direction
- **Note Speed**: Adjusts the speed at which notes move
- **Note Colors**: Changes the appearance of notes

### Visual Settings
- **Visualizer**: Shows real-time gameplay data:
  - **NONE**: No visualizer
  - **ACCURACY**: Displays timing accuracy history
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

### Utility Settings
- **Offset Assistant**: Interactive tool to help calibrate audio sync by tapping to a metronome
- **Erase Highscores**: Permanently clears all saved high scores
- **Restore Default Settings**: Resets all settings to factory defaults
- **APPLY**: Applies changes and restarts if necessary

Changes are saved automatically when made. Some settings require an application restart to take effect.

## Gameplay Features

### Metronome
Toggle during gameplay with the **Select** button. The metronome provides rhythmic feedback to help with timing:
- **Beat modes**: Play at regular intervals (Quarters, Eighths, etc.)
- **NOTE mode**: Plays exactly when notes reach the judge line - ideal for checking chart synchronization
- Status display shows current mode in the top-left corner during gameplay

### Visualizer
Choose from different visual feedback options in the HUD:
- **Accuracy**: Shows your timing consistency as a graph
- **Audio**: Real-time audio frequency display
- **BPM**: Shows current BPM and upcoming tempo changes

### Offset Assistant
Accessible from Settings, this tool helps you find the perfect audio synchronization:
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
- **StepMania SSC (.ssc)**: Not currently supported
- **Background Videos**: Supported, but .AVI format is not compatible with HTML5 video players

## Known Limitations

- SSC chart format support is not implemented
- Background videos work, but .AVI format is not supported by HTML5 video players
- Web version requires manual song loading
- Doubles charts are converted to Singles format
- Most mobile file browsers may require selecting individual files one by one
- No specific binary for desktop platforms

## License

Copyright © 2025 RETORA

This software is provided under the PadManiacs License. See the LICENSE file for complete terms.

Third-party components:
- Uses StepMania chart format specification
- Includes Phaser CE, Eruda.js, and Terser.js libraries
- All third-party content remains under their original licenses