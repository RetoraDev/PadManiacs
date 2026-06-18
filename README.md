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

### Keyboard Controls

**Directional Inputs:**
- **WASD**: Directional input
- **A/S/J/K**: Dance pad layout

**Action Buttons:**
- **J**: B button / Up column
- **K**: A button / Right column
- **Shift**: Select button
- **Enter**: Start button

**Player 2:**
- **Cursor Keys**: Directional Input
- **Numpad 1**: B button / Up column
- **Numpad 2**: A button / Right column
- **Numpad +**: Select button
- **Numpad -**: Start button

They're all rebindable. Gamepad and touchscreen supported

## Loading Your StepMania charts

**Desktop/Local Files:**
Place song folders in: `Path/To/PadManiacs/data/Songs/`

**Android Devices:**
Place song folders in: `Internal Storage/PadManiacs/Songs/`

Then go to user songs menu and hit "Load External Songs"

You can add as many songs as desired.

> Note in browser you can't load songs this way. Use "Load Single Song" instead

## Character System

You can customize and level up your own avatar with RPG-style progression. Create characters with unique appearances, unlock items, skills, and watch them grow as you play.

## Chart Editor

The game includes a very complete chart editor similar to Arrow Vortex. You can easily create/import, edit, playtest and export charts in StepMania format or project file format.

Editor controls:
- **UP/DOWN**: Navigate in time
- **LEFT/RIGHT**: Change column
- **A**: Add note under cursor to selection
- **B**: Place/Remove not
- **Hold A + UP/DOWN**: Area selection
- **Hold A + LEFT/RIGHT**: Change beat snap
- **Hold B + UP/DOWN**: Place hold note, release to create it
- **SELECT**: Toggle playback
- **START**: Show context menu

The editor is accessible from **Extras** menu

## Modding & Add-ons

PadManiacs supports community-created modifications through an add-on system. Add-ons can:
- Replace game assets (arrows, backgrounds, UI elements)
- Add new behaviors and gameplay mechanics
- Extend the game with new features

See [Modding API Documentation](https://retoradev.github.io/PadManiacsDocumentation/) for complete modding information.

### The Add-on Manager
Accessible from the main menu, the Add-on Manager allows you to:
- Install add-ons from ZIP files
- Enable/disable installed add-ons
- Hibernate add-ons to prevent loading
- Toggle safe mode to disable all add-ons

## Known Limitations

- SSC chart format support is not implemented
- Background videos work, but .AVI format is not supported by HTML5 video players
- Web version requires manual song loading
- Doubles charts are not supported since it's hard to implement Single Player Doubles on mobile
- Most mobile file browsers may require selecting individual files one by one

## License

Copyright © 2026 RETORA

This software is provided under the PadManiacs License. See the LICENSE file for complete terms.

Third-party components:
- Uses StepMania chart format specification
- Includes Phaser CE, Eruda.js, and Terser.js libraries
- All third-party content remains under their original licenses