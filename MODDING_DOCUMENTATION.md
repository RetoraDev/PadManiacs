# PadManiacs Modding Documentation

## Overview

PadManiacs supports community-created modifications through an add-on system. Add-ons can modify game behavior, replace assets, and extend functionality.

## Addon Structure

### Directory Structure
```
PadManiacs/
├── Addons/
│   └── YourAddon/
│       ├── manifest.json
│       ├── assets/
│       │   ├── custom-arrows.png
│       │   └── custom-background.jpg
│       └── scripts/
│           ├── Global.js
│           ├── Boot.js
│           └── Play.js
```

### Manifest File

The `manifest.json` defines your addon's metadata and capabilities:

```json
{
  "id": "unique-addon-id",
  "name": "Your Addon Name",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "What your addon does",
  "dependencies": {
    "other-addon-id": "1.0.0"
  },
  "assets": {
    "arrows": "assets/custom-arrows.png",
    "ui_background_gradient": "assets/custom-bg.jpg"
  },
  "behaviors": {
    "Global": "scripts/Global.js",
    "Boot": "scripts/Boot.js",
    "Load": "scripts/Load.js",
    "Title": "scripts/Title.js",
    "MainMenu": "scripts/MainMenu.js",
    "SongSelect": "scripts/SongSelect.js",
    "Play": "scripts/Play.js",
    "Results": "scripts/Results.js"
  }
}
```

## Asset Replacement

### Supported Asset Types
- **UI Elements**: Window panels, buttons, backgrounds
- **Game Elements**: Arrows, receptors, explosions, mines
- **Fonts**: Text rendering spritesheets
- **Audio**: Sound effects, music

### Asset Keys
Common asset keys you can replace:
- `arrows` - Note arrows spritesheet
- `receptor` - Receptor animations  
- `explosion` - Note hit explosions
- `mine` - Mine notes
- `ui_window_1` - Window skin 1
- `ui_background_gradient` - Background gradient
- `ui_logo_shape` - Logo graphic

## Behavior Scripting

### Global Scripts
`Global.js` runs when the addon loads and has access to the global scope:

```javascript
// Global.js - Runs when addon loads
const game = arguments[0];

// Add global variables
window.myGlobalVariable = "Hello from addon!";

// Modify existing classes
const originalPlayerUpdate = window.Player.prototype.update;
window.Player.prototype.update = function() {
  // Custom behavior
  console.log("Player updating...");
  
  // Call original method
  return originalPlayerUpdate.call(this);
};

// Add new game states
window.MyCustomState = class {
  create() {
    console.log("Custom state created!");
  }
};
```

### State-Specific Scripts

Each state script receives the game instance and state instance:

```javascript
// Play.js - Runs during gameplay state
const game = arguments[0];
const state = arguments[1];

// Modify gameplay behavior
const originalPlayCreate = state.create;
state.create = function() {
  // Call original create first
  originalPlayCreate.call(this);
  
  // Add custom elements
  this.customText = new Text(100, 50, "Custom Mod Text!", FONTS.default);
  this.add.existing(this.customText);
};

// Access player instance
state.player.originalUpdate = state.player.update;
state.player.update = function() {
  // Custom player logic
  if (this.combo > 50) {
    this.scene.customText.tint = 0xFF0000;
  }
  
  // Call original update
  return this.originalUpdate.call(this);
};
```

### Available Context Objects

Each behavior script receives different context objects:

| State | Arguments | Description |
|-------|-----------|-------------|
| Global | `[game]` | Game instance only |
| Boot | `[game, state]` | Boot state instance |
| Play | `[game, state]` | Play state with player access |
| All Others | `[game, state]` | Respective state instance |

## Menu Modification System

### game.onMenuIn Signal

The `game.onMenuIn` signal allows addons to modify menus when they appear. It dispatches with two parameters: `menuKey` and `menuObject`.

```javascript
// Example: Modify any menu when it appears
game.onMenuIn.add((menuKey, menuObject) => {
  console.log(`Menu opened: ${menuKey}`);
  
  // Add custom items to any menu
  if (menuObject.addItem) {
    menuObject.addItem("Custom Option", () => {
      notifications.show("Custom option selected!");
    });
  }
});
```

### Available Menu Keys

| Menu Key | Description | Menu Object Type |
|----------|-------------|------------------|
| `'home'` | Main home menu | CarouselMenu |
| `'startGame'` | Game start options | CarouselMenu |
| `'extraSongs'` | Extra songs menu | CarouselMenu |
| `'settings'` | Settings window | Window |
| `'extras'` | Extras menu | CarouselMenu |
| `'addons'` | Addon manager list | CarouselMenu |
| `'addonDetails'` | Addon details menu | CarouselMenu |
| `'songList'` | Song selection list | CarouselMenu |
| `'difficulty'` | Difficulty selection | CarouselMenu |
| `'pause'` | Pause menu | CarouselMenu |
| `'results'` | Results screen menu | CarouselMenu |

### Menu-Specific Modification Examples

```javascript
// Modify the home menu
game.onMenuIn.add((menuKey, menuObject) => {
  if (menuKey === 'home') {
    // Add custom item to home menu
    menuObject.addItem("My Custom Feature", () => {
      notifications.show("Custom feature activated!");
    });
  }
});

// Modify settings window
game.onMenuIn.add((menuKey, menuObject) => {
  if (menuKey === 'settings') {
    // Add custom setting
    menuObject.addSettingItem(
      "Custom Setting",
      ["OFF", "ON"],
      0,
      index => {
        notifications.show(`Custom setting: ${index === 1 ? 'ON' : 'OFF'}`);
      }
    );
  }
});

// Modify pause menu
game.onMenuIn.add((menuKey, menuObject) => {
  if (menuKey === 'pause') {
    // Add custom pause option
    menuObject.addItem("CUSTOM PAUSE OPTION", () => {
      notifications.show("Custom pause action!");
    });
  }
});
```

## API Reference

### Game Objects
- `game` - Phaser game instance
- `game.state` - Game state manager
- `game.add` - Factory for creating game objects
- `game.cache` - Asset cache system
- `game.input` - Input handling
- `game.onMenuIn` - Menu modification signal

### Core Classes
- `Player` - Gameplay logic and note handling
- `Text` - Text rendering system
- `Window` - UI window system  
- `CarouselMenu` - Menu navigation
- `BackgroundMusic` - Audio management
- `NotificationSystem` - Message display
- `Metronome` - Rhythm assistance system
- `Visualizer` - Gameplay visualization

For complete class documentation, see [CORE_CLASSES_DOCUMENTATION.md](https://github.com/RetoraDev/PadManiacs/blob/824bbec365691162f305223777e1c2d98db13064/CORE_CLASSES_DOCUMENTATION.md)

### Important Properties

**Player Class:**
```javascript
player.notes // Array of chart notes
player.score // Current score
player.combo // Current combo
player.accuracy // Current accuracy
player.health // Player health
player.judgementCounts // Judgement statistics
player.autoplay // Autoplay status
```

**Play State:**
```javascript
state.song // Current song data
state.difficultyIndex // Selected difficulty
state.player // Player instance
state.isPaused // Pause status
state.audio // Audio element
state.metronome // Metronome instance
state.visualizer // Visualizer instance
```

## Sample Addons

You can download sample addons from the official PadManiacs releases to see practical examples of modding capabilities.

## Best Practices

### 1. Error Handling
```javascript
try {
  // Your mod code
} catch (error) {
  console.error(`Addon Error: ${error.message}`);
}
```

### 2. Preserve Original Functionality
```javascript
// Always call original methods when overriding
const originalMethod = SomeClass.prototype.method;
SomeClass.prototype.method = function() {
  // Your custom logic
  
  // Call original
  return originalMethod.call(this);
};
```

### 3. Namespace Your Variables
```javascript
// Use unique prefixes
window.MYADDON_settings = {};
window.MYADDON_originalMethods = {};
```

### 4. Clean Up Resources
```javascript
// Remove event listeners and references
// when your addon is disabled
```

## Distribution

### Creating Addon Packages
1. Create your addon folder structure
2. Include all assets and scripts
3. Create valid `manifest.json`
4. Zip the entire addon folder
5. Name the zip file: `addon-id-version.zip`

### Installation
Users can install addons through:
1. Addon Manager → "Install from ZIP"
2. Manual extraction to `Addons/` directory
3. Automatic detection on game startup

## Troubleshooting

### Common Issues

**Addon Not Loading:**
- Check manifest.json syntax
- Verify file paths in manifest
- Check browser console for errors

**Assets Not Replacing:**
- Verify asset keys match exactly
- Check image dimensions match original
- Ensure file formats are supported

**Scripts Not Executing:**
- Verify script file paths in manifest
- Check for JavaScript syntax errors
- Ensure state names match exactly

### Debugging Tips
```javascript
// Add debug logging
console.log("Addon loaded:", ADDON_INFO);

// Check if your scripts are running
console.log("Script executing for state:", CURRENT_STATE);

// Verify game objects are accessible  
console.log("Game instance:", typeof game);
console.log("State instance:", typeof state);
```

## Advanced Topics

### Creating New Game States
```javascript
// Global.js - Register new state
const game = arguments[0];

game.state.add('CustomState', CustomState);

// In another script, switch to your state
game.state.start('CustomState');
```

### Modifying Core Mechanics
To understand available modification points, examine the source code for:
- `Player.prototype.update` - Gameplay loop
- `Player.prototype.processJudgement` - Scoring
- `Player.prototype.handleInput` - Input handling  
- `Play.prototype.update` - Game state management

Look for methods that can be safely extended without breaking game functionality.

## Future Signals

More signals will be added in future releases to provide additional modification points:
- Game state transition signals
- Input handling signals
- Audio playback signals
- Scoring and judgement signals

## Support

For modding assistance:
1. Examine the game source code for available APIs
2. Check official releases for sample addons
3. Use browser developer tools for debugging
4. Test thoroughly before distribution

Happy modding!
```

*Tip: To understand behavior modification opportunities, examine the actual game source code in the repository - look for methods that can be safely extended or modified without breaking core functionality.*