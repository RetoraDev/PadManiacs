# PadManiacs Core Classes Documentation

## Overview

This document provides detailed information about all core classes in PadManiacs. Use this reference when creating addons to understand available APIs and modification points.

## Game Core Classes

### Gamepad
Handles input from keyboard, gamepad, and touch controls.

**Properties:**
- `pressed` - Object with boolean states for all buttons (up, down, left, right, a, b, start, select, any)
- `released` - Object with boolean states for button releases
- `game` - Reference to Phaser game instance

**Methods:**
- `update()` - Update input states (called every frame)
- `press(key)` - Simulate button press
- `release(key)` - Simulate button release
- `releaseAll()` - Release all buttons

**Usage:**
```javascript
// Check if A button is pressed
if (gamepad.pressed.a) {
  // Handle A button input
}

// Check if any direction is pressed
if (gamepad.pressed.any) {
  // Handle any input
}
```

### BackgroundMusic
Manages menu background music playback.

**Properties:**
- `audio` - HTML Audio element
- `isPlaying` - Boolean indicating if music is currently playing
- `currentSong` - Currently playing song data
- `randomSong` - Boolean for random song selection

**Methods:**
- `playLastSong()` - Play the last played song or random song
- `playRandomSong()` - Play a random song from available songs
- `playSong(songData)` - Play specific song
- `stop()` - Stop music playback
- `setVolume(volume)` - Set playback volume (0-1)
- `refreshCache()` - Refresh available songs cache

**Usage:**
```javascript
// Play random background music
backgroundMusic.playRandomSong();

// Stop music during gameplay
backgroundMusic.stop();

// Set volume (0.0 to 1.0)
backgroundMusic.setVolume(0.5);
```

### NotificationSystem
Displays temporary messages and notifications.

**Properties:**
- `queue` - Array of pending notifications
- `isShowing` - Boolean indicating if notification is currently displayed
- `currentNotification` - Currently displayed notification data

**Methods:**
- `show(text, duration)` - Show notification (duration in ms)
- `clear()` - Clear all pending notifications
- `getQueueStatus()` - Get current queue information
- `hasActiveNotifications()` - Check if any notifications are active

**Usage:**
```javascript
// Show a notification for 3 seconds
notifications.show("Game saved!", 3000);

// Show multi-line notification
notifications.show("High score!\nNew record: 95%", 4000);
```

### FileSystemTools
Abstracts file system operations for different platforms.

**Properties:**
- `platform` - Current platform ('nwjs', 'cordova', or 'fallback')
- `fileSystem` - Platform-specific file system implementation

**Methods:**
- `getDirectory(path)` - Get directory entry
- `listDirectories(dirEntry)` - List subdirectories
- `listFiles(dirEntry)` - List files in directory
- `getFile(fileEntry)` - Get file entry
- `readFileContent(file)` - Read file content as text
- `saveFile(dirEntry, fileData, fileName)` - Save file
- `createDirectory(rootDirEntry, dirName)` - Create directory
- `canExitApp()` - Check if platform supports app exit
- `exitApp()` - Exit the application

**Usage:**
```javascript
// Get songs directory
const songsDir = await fileSystemTools.getDirectory(EXTERNAL_DIRECTORY + SONGS_DIRECTORY);

// List files in directory
const files = await fileSystemTools.listFiles(songsDir);

// Check if app can be exited
if (fileSystemTools.canExitApp()) {
  fileSystemTools.exitApp();
}
```

### AddonManager
Manages addon loading, enabling, and execution.

**Properties:**
- `addons` - Map of loaded addons
- `enabledAddons` - Set of enabled addon IDs
- `hibernatingAddons` - Set of hibernating addon IDs
- `safeMode` - Boolean for safe mode state

**Methods:**
- `initialize()` - Initialize addon system
- `executeGlobalBehaviors()` - Execute global addon scripts
- `executeStateBehaviors(stateName, stateInstance)` - Execute state-specific scripts
- `getAddonList()` - Get list of all addons
- `enableAddon(addonId)` - Enable specific addon
- `disableAddon(addonId)` - Disable specific addon
- `hibernateAddon(addonId)` - Hibernate addon
- `wakeAddon(addonId)` - Wake hibernated addon
- `setSafeMode(enabled)` - Enable/disable safe mode
- `needsReload()` - Check if changes require reload
- `getResourceList()` - Get addon resources for loading

**Usage:**
```javascript
// Execute behaviors for current state
addonManager.executeStateBehaviors('Play', this);

// Get list of installed addons
const addons = addonManager.getAddonList();

// Enable an addon
addonManager.enableAddon('custom-arrows');
```

## UI Classes

### Text
Extended Phaser sprite for text rendering with retro font support.

**Properties:**
- `texture` - RetroFont texture instance
- `config` - Font configuration
- `timer` - Phaser timer for typewriter effects

**Methods:**
- `write(text)` - Set text content immediately
- `typewrite(text, callback)` - Type text with delay
- `scrollwrite(text, visibleLength, scrollSpeed, separation)` - Scroll text horizontally
- `wrap(maxWidth, lineSpacing)` - Wrap text to specified width
- `wrapPreserveNewlines(maxWidth, lineSpacing)` - Wrap text preserving existing newlines
- `stopScrolling()` - Stop any active scrolling
- `isScrolling()` - Check if text is scrolling

**Usage:**
```javascript
// Create text object
const myText = new Text(100, 50, "Hello World!", FONTS.default);

// Scroll long text
myText.scrollwrite("This is a very long text that needs scrolling", 10);

// Wrap text to fit width
myText.wrap(150);
```

### Window
UI window with configurable skin and interactive elements.

**Properties:**
- `size` - Window dimensions {width, height}
- `skin` - Window skin identifier
- `items` - Array of window items
- `selectedIndex` - Currently selected item index
- `font` - Font used for text
- `fontTint` - Text color tint
- `focus` - Whether window has focus

**Methods:**
- `addItem(text, leftText, callback, backButton)` - Add menu item
- `addSettingItem(text, options, currentIndex, callback)` - Add setting item
- `navigate(direction)` - Navigate items (up/down/left/right)
- `confirm()` - Confirm current selection
- `cancel()` - Cancel/back action
- `update()` - Update window display
- `show()` - Show window
- `hide()` - Hide window

**Signals:**
- `onSelect` - Fired when selection changes
- `onConfirm` - Fired when item is confirmed
- `onCancel` - Fired when cancel is pressed

**Usage:**
```javascript
// Create settings window
const settingsWindow = new Window(3, 1, 18, 12, "1");

// Add setting item
settingsWindow.addSettingItem(
  "Volume",
  ["0%", "25%", "50%", "75%", "100%"],
  2,
  index => {
    console.log(`Volume set to: ${index}`);
  }
);

// Handle selection changes
settingsWindow.onSelect.add((index, item) => {
  console.log(`Selected: ${item.text}`);
});
```

### WindowManager
Manages multiple windows and input focus.

**Properties:**
- `windows` - Array of managed windows
- `focusedWindow` - Currently focused window

**Methods:**
- `add(window)` - Add window to manager
- `remove(window, destroy)` - Remove window
- `focus(window, hide)` - Focus specific window
- `unfocus()` - Remove focus
- `closeAll()` - Close all windows
- `bringToFront(window)` - Bring window to front
- `clearAll(destroy)` - Clear all windows
- `update()` - Update input handling

**Usage:**
```javascript
const manager = new WindowManager();

// Create and add window
const window = new Window(5, 5, 10, 8, "1");
manager.add(window);

// Focus the window
manager.focus(window);

// Update input handling (call in update loop)
manager.update();
```

### CarouselMenu
Vertical scrolling menu with animated selection.

**Properties:**
- `items` - Array of menu items
- `selectedIndex` - Currently selected item index
- `scrollOffset` - Scroll position
- `visibleItems` - Number of visible items
- `config` - Menu configuration (align, colors, animation)

**Methods:**
- `addItem(text, callback, data)` - Add menu item
- `navigate(direction)` - Navigate menu
- `confirm()` - Confirm selection
- `cancel()` - Cancel menu
- `update()` - Update menu state
- `destroy()` - Clean up menu

**Signals:**
- `onSelect` - Fired when selection changes
- `onConfirm` - Fired when item is confirmed
- `onCancel` - Fired when menu is cancelled

**Usage:**
```javascript
// Create carousel menu
const menu = new CarouselMenu(0, 56, 96, 56, {
  align: 'left',
  bgcolor: 'brown',
  fgcolor: '#ffffff',
  animate: true
});

// Add menu items
menu.addItem("Start Game", () => {
  game.state.start('Play');
});

menu.addItem("Settings", () => {
  // Open settings
});

// Handle selection
menu.onSelect.add((index, item) => {
  console.log(`Selected: ${item.textContent}`);
});
```

## Gameplay Classes

### Player
Core gameplay logic handling note processing, scoring, and rendering.

**Properties:**
- `scene` - Reference to Play state
- `chart` - Song chart data
- `notes` - Array of chart notes for current difficulty
- `bpmChanges` - BPM change events
- `stops` - Stop events
- `score` - Current score
- `combo` - Current combo
- `accuracy` - Current accuracy percentage
- `maxCombo` - Maximum combo achieved
- `health` - Current health (0-100)
- `judgementCounts` - Object with count of each judgement type
- `autoplay` - Whether autoplay is enabled
- `inputStates` - Array of input states for each column
- `activeHolds` - Object tracking active hold notes
- `receptors` - Array of receptor sprites

**Methods:**
- `update()` - Update player state (call every frame)
- `render()` - Render notes and effects
- `handleInput(column, isKeyDown)` - Process player input
- `processJudgement(note, judgement, column)` - Process note judgement
- `createExplosion(note, type)` - Create hit explosion effect
- `getNoteFrame(note)` - Get sprite frame for note based on color settings
- `secToBeat(sec)` - Convert seconds to beat position
- `beatToSec(beat)` - Convert beat position to seconds
- `calculateTotalNotes()` - Calculate total notes for accuracy
- `updateAccuracy()` - Recalculate accuracy percentage
- `getScoreRating()` - Get letter rating based on accuracy

**Judgement Windows:**
- `marvelous`: ±0.15 seconds
- `perfect`: ±0.20 seconds  
- `great`: ±0.25 seconds
- `good`: ±0.30 seconds
- `boo`: ±0.40 seconds
- `miss`: Outside windows

**Score Values:**
- `marvelous`: 1000
- `perfect`: 800
- `great`: 500
- `good`: 200  
- `boo`: 50
- `miss`: 0

**Usage:**
```javascript
// Modify player update behavior
player.originalUpdate = player.update;
player.update = function() {
  // Custom logic before original update
  if (this.combo > 50) {
    this.scene.backgroundSprite.tint = 0xFF0000;
  }
  
  // Call original update
  return this.originalUpdate.call(this);
};

// Modify judgement processing
player.originalProcessJudgement = player.processJudgement;
player.processJudgement = function(note, judgement, column) {
  // Double points mod
  const originalValue = this.scene.SCORE_VALUES[judgement];
  this.scene.SCORE_VALUES[judgement] = originalValue * 2;
  
  // Call original method
  const result = this.originalProcessJudgement.call(this, note, judgement, column);
  
  // Restore original value
  this.scene.SCORE_VALUES[judgement] = originalValue;
  
  return result;
};
```

### Metronome
Provides rhythmic audio feedback during gameplay.

**Properties:**
- `enabled` - Whether metronome is active
- `mode` - Current mode ('OFF', 'Note', 'Quarters', 'Eighths', etc.)
- `statusText` - Display text showing current status
- `lastDivisionValue` - Last played division for beat-based modes
- `playedNotes` - Set of notes that have triggered ticks in NOTE mode

**Methods:**
- `update()` - Update metronome state (call every frame)
- `toggle()` - Toggle metronome on/off
- `setMode(mode)` - Change metronome mode
- `playTick()` - Play tick sound
- `flashText()` - Flash status text for visual feedback

**Modes:**
- `OFF` - No metronome
- `Note` - Play when notes reach judge line
- `Quarters` - Play on whole beats (1, 2, 3, 4...)
- `Eighths` - Play on half beats (1, 1.5, 2, 2.5...)
- `Sixteenths` - Play on quarter beats (1, 1.25, 1.5, 1.75...)
- `Thirty-seconds` - Play on eighth beats (1, 1.125, 1.25, 1.375...)

**Usage:**
```javascript
// Toggle metronome with Select button
if (gamepad.pressed.select && !this.lastSelect) {
  this.metronome.toggle();
}

// Change metronome mode
this.metronome.setMode('Eighths');

// Check if metronome is active
if (this.metronome.enabled) {
  console.log(`Metronome: ${this.metronome.mode}`);
}
```

### Visualizer (Base Class)
Base class for gameplay visualization displays.

**Properties:**
- `graphics` - Phaser graphics object for drawing
- `x`, `y` - Position coordinates
- `width`, `height` - Dimensions
- `active` - Whether visualizer is active

**Methods:**
- `update()` - Update visualizer display
- `clear()` - Clear graphics
- `destroy()` - Clean up resources

### AccuracyVisualizer
Shows timing accuracy history as a graph.

**Properties:**
- `accuracyHistory` - Array of recent timing offsets
- `maxHistoryLength` - Maximum number of history points

**Methods:**
- `update()` - Update accuracy graph

### AudioVisualizer
Shows real-time audio frequency spectrum.

**Properties:**
- `audioContext` - Web Audio API context
- `analyser` - Audio analyser node
- `dataArray` - Frequency data buffer
- `bufferLength` - Buffer size

**Methods:**
- `update()` - Update audio visualization
- `setupAudioAnalysis()` - Initialize audio analysis

### BPMVisualizer
Shows BPM changes and beat indicators.

**Properties:**
- `bpmChanges` - Array of BPM change events
- `stops` - Array of stop events
- `text` - BPM display text
- `currentBeat` - Current beat position

**Methods:**
- `update()` - Update BPM display
- `getLastBpm()` - Get current BPM
- `getLastStop()` - Get current stop if any

**Usage:**
```javascript
// Create visualizer based on settings
switch (visualizerType) {
  case 'ACURRACY':
    this.visualizer = new AccuracyVisualizer(this, x, y, w, h);
    break;
  case 'AUDIO':
    this.visualizer = new AudioVisualizer(this, x, y, w, h);
    break;
  case 'BPM':
    this.visualizer = new BPMVisualizer(this, x, y, w, h);
    break;
}

// Update in game loop
if (this.visualizer) {
  this.visualizer.update();
}
```

### OffsetAssistant
Interactive tool for calibrating audio sync offset.

**Properties:**
- `taps` - Array of tap timestamps
- `calculatedOffsets` - Array of calculated offsets for averaging
- `tickBPM` - Metronome BPM (120)
- `tickInterval` - Time between ticks
- `confidenceThreshold` - Confidence level for green text

**Methods:**
- `update()` - Update assistant state
- `onTap()` - Handle tap input
- `calculateOffset()` - Calculate current offset
- `calculateConfidence()` - Calculate tap consistency confidence
- `exit()` - Save offset and exit
- `pauseBackgroundMusic()` - Pause BG music during calibration
- `resumeBackgroundMusic()` - Resume BG music after calibration

**Usage:**
```javascript
// Start offset assistant
const offsetAssistant = new OffsetAssistant(game);
game.add.existing(offsetAssistant);

// Assistant handles A button for tapping and B for exit automatically
```

## Parser Classes

### LocalSMParser
Parses StepMania .sm files from local assets.

**Methods:**
- `parseSM(smContent, baseUrl)` - Parse SM file content
- `parseSSC(sscContent, baseUrl)` - Parse SSC file content (basic support)
- `resolveFileUrl(filename)` - Resolve file URLs relative to base

### ExternalSMParser  
Parses StepMania files from external storage.

**Methods:**
- `parseSM(files, smContent)` - Parse SM file with file references
- `parseSSC(files, sscContent)` - Parse SSC file with file references
- `convertSSCNotes(noteData, bpmChanges, stops)` - Convert SSC note format

## Utility Classes

### BackgroundGradient
Animated background gradient.

**Properties:**
- `alpha` - Current alpha value
- `tween` - Alpha animation tween

**Methods:**
- (Automatically animates when created)

### FuturisticLines
Animated futuristic line effects for backgrounds.

**Properties:**
- `lines` - Array of active lines
- `maxLines` - Maximum number of lines
- `lineSpeed` - Line movement speed
- `tailLength` - Line tail length
- `graphics` - Drawing graphics object

**Methods:**
- `update()` - Update line animations
- `spawnLine()` - Create new line
- `clearLines()` - Remove all lines
- `setDensity(density)` - Set line density
- `setSpeed(speed)` - Set line speed
- `setTailLength(length)` - Set tail length

### LoadingDots
Animated loading indicator.

**Properties:**
- `animations` - Loading animation

**Methods:**
- (Automatically animates when created)

### ProgressText
Text display for loading progress.

**Extends:** Text

**Methods:**
- (Pre-configured for loading screens)

### Logo
Animated logo with intro/outro effects.

**Properties:**
- `mainShape` - Main logo shape sprite
- `logoTween` - Logo animation tween

**Methods:**
- `intro(callback)` - Play intro animation
- `outro(callback)` - Play outro animation
- `effect(amountLayers, time, invert)` - Create visual effect
- `addShape(tint, x, y)` - Add additional shape

## Constants and Configuration

### FONTS
Font definitions for text rendering:
- `default` - Standard font
- `shaded` - Font with drop shadow
- `stroke` - Outlined font
- `number` - Number-only font
- `combo` - Large font for combo display

### WINDOW_PANELS
Available window skin identifiers.

### DEFAULT_ACCOUNT
Default account settings structure.

### Account
Current account data with settings, high scores, and preferences.

### Game States
- `Boot` - Initial loading and setup
- `Load` - Asset loading
- `LoadCordova` - Cordova file system initialization
- `LoadAddons` - Addon loading and initialization
- `LoadLocalSongs` - Built-in song loading
- `LoadExternalSongs` - External song loading
- `LoadSongFolder` - Single song folder loading
- `Title` - Title screen
- `MainMenu` - Main menu
- `SongSelect` - Song selection
- `Play` - Gameplay
- `Results` - Results screen

## Global Variables

- `game` - Phaser game instance
- `gamepad` - Gamepad input instance
- `backgroundMusic` - Background music instance
- `notifications` - Notification system instance
- `addonManager` - Addon manager instance
- `fileSystemTools` - File system tools instance

## Signals and Events

### game.onMenuIn
Dispatched when menus open with parameters:
- `menuKey` - String identifying the menu
- `menuObject` - The menu instance (CarouselMenu or Window)

**Usage:**
```javascript
game.onMenuIn.add((menuKey, menuObject) => {
  if (menuKey === 'pause') {
    menuObject.addItem("Custom Option", () => {
      // Handle custom option
    });
  }
});
```

This comprehensive reference covers all core classes available for modification and extension in PadManiacs addons.
```

*Note: Always test addons thoroughly and preserve original functionality when overriding methods.*