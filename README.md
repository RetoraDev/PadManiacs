```
   ___          ____  ___          _      _  __
  / _ \___ ____/ /  |/  /__ ____  (_)__ _| |/_/
 / ___/ _ `/ _  / /|_/ / _ `/ _ \/ / _ `/>  <
/_/   \_,_/\_,_/_/  /_/\_,_/_//_/_/\_,_/_/|_|
```

A pocket-sized cross-platform pixel art StepMania clone.

## About

PadManiacs is a lightweight rhythm game that brings the StepMania experience to web and mobile devices with a retro pixel art aesthetic. The game features core rhythm gameplay mechanics from StepMania, a popular open-source rhythm game.

[Play Latest Development Version](https://retoradev.github.io/PadManiacs/dist/)

[Play Stable Version on Itch.io](https://retora.itch.io/padmaniacs)

## Controls

### Keyboard Controls

**Directional Inputs:**
- **Arrow Keys**: Primary directional inputs (Left, Down, Up, Right)
- **D/F/J/K**: Primary dance pad layout
- **C/V/B/N**: Secondary dance pad layout

**Action Buttons:**
- **Z** or **J**: A button / Right column
- **X** or **K**: B button / Down column
- **Shift**, **Tab**, or **Space Bar**: Select button
- **Enter**, **Escape**, or **P**: Start button

### Gamepad
Standard gamepad layout with D-pad for directional inputs and face buttons for actions. Use **LEFT/DOWN/A/B** to play with a dance pad layout

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

## Screenshots & Recording
You can capture the screen using keyboard shortcuts:
- **F8**: Take Screenshot
- **F9**: Start/Stop Recording (It has extremely low quality so it's recommended to use an external recorder)

Screenshots and recordings are saved in `Screenshots/` folder in local storage folder:
- **Desktop**: `Path/To/PadManiacs/data/Screenshots/`
- **Android**: `Internal Storage/PadManiacs/Screenshots/`

Note Web platform can't save files.

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
- Input mapping is not implented
- Recordings have extremely low quality

## License

Copyright © 2025 RETORA

This software is provided under the PadManiacs License. See the LICENSE file for complete terms.

Third-party components:
- Uses StepMania chart format specification
- Includes Phaser CE, Eruda.js, and Terser.js libraries
- All third-party content remains under their original licenses