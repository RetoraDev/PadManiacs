# PadManiacs

Pocket Pixel Art StepMania Clone

## Overview

PadManiacs is a rhythm game designed for mobile devices with full web browser compatibility. Experience the classic StepMania gameplay in a compact, pixel-art package optimized for touch screens.

## Features

### Core Gameplay
- Four-lane rhythm gameplay with arrow notes
- Multiple judgement levels: Marvelous, Perfect, Great, Good, Boo, Miss
- Hold notes and roll notes support
- Mine notes for additional challenge
- Combo system and health management
- Accuracy tracking and score ratings (SSS+ to F)

### Song Library
- Built-in default songs
- External song loading from device storage
- Support for .sm (StepMania) and .ssc files
- Parallel song loading for faster performance
- Background music in menus

### Visual Options
- Multiple note color modes:
  - NOTE: Traditional red/blue/yellow/green
  - VIVID: Color cycle per beat
  - FLAT: Uniform yellow notes
  - RAINBOW: Orange/blue/purple scheme
- Futuristic background effects
- Pixel-perfect retro aesthetics

### Game Modes
- Free Play with song selection
- Auto-play mode for practice
- High score tracking per song and difficulty
- Results screen with performance breakdown

### Customization
- Adjustable volume settings
- Menu music toggle
- Random song selection
- Note speed adjustment
- Judge timing calibration

## Controls

### Touch Screen
- Tap corresponding lanes for notes
- Hold for hold/roll notes
- Four-finger gameplay optimized for mobile

### Keyboard (Web)
- Left: Left arrow / D
- Down: Down arrow / F
- Up: Up arrow / J
- Right: Right arrow / K
- Start: Enter
- Back: Escape

## Song Loading

### Default Songs
Pre-loaded songs included with the game.

### External Songs
1. Create a `PapManiacs` folder in your device storage
2. Place song folders containing .sm/.ssc files and audio
3. Use "Load External Songs" in the Extra Songs menu

### Single Song Loading
Use "Load Single Song" to quickly test individual charts.

## Scoring System

### Judgement Weights
- Marvelous: 100%
- Perfect: 100%
- Great: 80%
- Good: 50%
- Boo: 25%
- Miss: 0%

### Score Ratings
- SSS+: 100%
- SSS: 99.5%-99.9%
- SS: 99%-99.4%
- S: 97%-98.9%
- A: 94%-96.9%
- B: 90%-93.9%
- C: 85%-89.9%
- D: 80%-84.9%
- E: 70%-79.9%
- F: Below 70%

## Development

Built with Phaser game engine and modern web technologies. Features a custom StepMania chart parser and mobile-first design philosophy.

## License

Copyright (c) 2025 Retora. All rights reserved. (See LICENSE.md)

## Version

v0.0.1