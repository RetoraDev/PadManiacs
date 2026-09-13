/**
 * @class OffsetAssistant
 * @category Core Game Classes
 * @summary Audio-video synchronization calibration tool
 * @constructor
 * @param {Phaser.Game} game - The game instance
 * @features
 * Guides the player to tap in rhythm with a steady audio tick
 * Computes a statistically confident average offset from the taps
 * Saves the calibrated offset to the account settings for judgment alignment
 * @description
 * OffsetAssistant is an in-game audio-video synchronization calibration tool. It plays a
 * continuous tick sound and has the player tap along to the beat, then measures each tap
 * against the expected tick timing. After enough consistent taps it averages the measured
 * offsets, displays a confidence color (white/yellow/green), and saves the result as the
 * user offset used to align note judgments with audio timing.
 * @example
 * // Opening the offset assistant when the player needs calibration
 * const assistant = new OffsetAssistant(game);
 * game.world.add(assistant);
 */
class OffsetAssistant extends Phaser.Sprite {
  constructor(game) {
    super(game, 0, 0);
    
    /** @type {Array} Raw tap timestamps in milliseconds */
    this.taps = [];
    /** @type {number} Confidence required to consider the offset reliable */
    this.confidenceThreshold = 0.8;
    /** @type {number} Maximum number of taps kept for measurement */
    this.maxTaps = 60;
    /** @type {number} Taps required before trusting the result */
    this.requiredTaps = 16;
    /** @type {number} BPM of the calibration tick sound */
    this.tickBPM = 120;
    /** @type {number} Milliseconds between tick sounds */
    this.tickInterval = 60000 / this.tickBPM; // 500ms per tick
    /** @type {number} Snap interval in milliseconds for rounding offsets */
    this.snapMs = 1;
    
    // Store background music state
    /** @type {boolean} Whether background music was playing before calibration */
    this.wasMusicPlaying = backgroundMusic && backgroundMusic.isPlaying;
    /** @type {number} Background music time to resume from after calibration */
    this.originalMusicTime = 0;
    
    // Pause background music
    this.pauseBackgroundMusic();
    
    // Start tick sound
    this.startTickSound();
    
    // Create background
    /** @type {Phaser.Graphics} Full-screen dark background */
    this.background = game.add.graphics(0, 0);
    this.background.beginFill(0x000000, 0.8);
    this.background.drawRect(0, 0, game.width, game.height);
    this.background.endFill();
    this.addChild(this.background);
    
    // Create instruction text
    /** @type {Text} Tap-along instruction label */
    this.instructionText = new Text(game.width / 2, game.height / 2 - 20, "TAP A TO THE TICK", FONTS.shaded);
    this.instructionText.anchor.set(0.5);
    this.addChild(this.instructionText);
    
    // Create offset display text
    /** @type {Text} Live offset readout label */
    this.offsetText = new Text(game.width / 2, game.height / 2 + 10, "Offset: 0ms", FONTS.default);
    this.offsetText.anchor.set(0.5);
    this.addChild(this.offsetText);
    
    // Create tap counter
    /** @type {Text} Tap counter label */
    this.tapCounter = new Text(game.width / 2, game.height / 2 + 30, "Taps: 0", FONTS.default);
    this.tapCounter.anchor.set(0.5);
    this.tapCounter.alpha = 0.7;
    this.addChild(this.tapCounter);
    
    // Create exit hint
    /** @type {Text} Exit instruction label */
    this.exitText = new Text(game.width / 2, game.height - 10, "Press B to exit and save", FONTS.default);
    this.exitText.anchor.set(0.5);
    this.exitText.alpha = 0.5;
    this.addChild(this.exitText);
    
    // Track button states
    this.lastAPress = false;
    this.lastBPress = false;
    
    // Track tick timing
    this.lastTickTime = 0;
    this.nextTickTime = this.game.time.now;
    
    // Store calculated offsets for averaging
    /** @type {Array} Recent averaged offset measurements */
    this.calculatedOffsets = [];
  }

  /**
   * Handles per-frame input: A button records a tap, B button exits and saves.
   * Also keeps the tick sound and tap counter up to date.
   */
  update() {
    // Handle A button for tapping
    if (gamepad.pressed.a || mouse.pressed.left) {
      this.onTap();
    }
    
    // Handle B button to exit
    if (gamepad.pressed.b) {
      this.exit();
    }
    
    // Update tick sound
    this.updateTickSound();
    
    // Update tap counter
    this.tapCounter.write(`Taps: ${this.taps.length}`);
  }

  /**
   * Pauses the background music and remembers the position to resume from.
   */
  pauseBackgroundMusic() {
    if (backgroundMusic) {
      this.originalMusicTime = backgroundMusic.audio.currentTime;
      backgroundMusic.audio.pause();
    }
  }

  /**
   * Resumes the background music from the position it was paused at.
   */
  resumeBackgroundMusic() {
    if (backgroundMusic) {
      // Try to resume from where we left off
      backgroundMusic.audio.currentTime = this.originalMusicTime;
      backgroundMusic.audio.play();
    }
  }

  /**
   * Preloads the assist tick sound and plays the first tick immediately.
   */
  startTickSound() {
    // Preload the tick sound if not already loaded
    if (!game.cache.checkSoundKey('assist_tick')) {
      console.warn("Tick sound not preloaded!");
      return;
    }
    
    // Play first tick immediately
    this.playTickSound();
    this.lastTickTime = this.game.time.now;
    this.nextTickTime = this.lastTickTime;
  }

  /**
   * Plays the tick sound again when the current tick interval elapses.
   */
  updateTickSound() {
    if (this.destroyed) return;
    
    const currentTime = this.game.time.now;
    
    // Check if it's time for the next tick
    if (currentTime >= this.nextTickTime) {
      this.playTickSound();
      this.lastTickTime = currentTime;
      this.nextTickTime = currentTime + this.tickInterval;
    }
  }

  /**
   * Plays the assist tick sound if it is loaded in the game cache.
   */
  playTickSound() {
    if (game.cache.checkSoundKey('assist_tick')) {
      Audio.play('assist_tick');
    }
  }

  /**
   * Records a tap timestamp and triggers offset calculation and feedback.
   */
  onTap() {
    const currentTime = this.game.time.now;
    
    // Add the current tap time
    this.taps.push(currentTime);
    
    // Keep only the most recent taps
    if (this.taps.length > this.maxTaps) {
      this.taps.shift();
    }
    
    // Calculate the detected offset
    this.calculateOffset();
    
    // Provide visual feedback for the tap
    this.showTapFeedback();
  }

  /**
   * Measures each tap against the expected tick timing, averages the offsets,
   * and updates the readout with a confidence color (white/yellow/green).
   */
  calculateOffset() {
    if (this.taps.length < 2) {
      this.offsetText.write("Offset: 0ms");
      this.offsetText.tint = 0xFFFFFF;
      return;
    }
    
    // Calculate offset for each tap relative to the nearest tick
    const currentOffsets = [];
    
    for (let i = 0; i < this.taps.length; i++) {
      const tapTime = this.taps[i];
      
      // Find the nearest tick time
      const ticksSinceStart = Math.round((tapTime - this.taps[0]) / this.tickInterval);
      const expectedTapTime = this.taps[0] + (ticksSinceStart * this.tickInterval);
      
      // Calculate offset for this tap
      const offset = tapTime - expectedTapTime;
      currentOffsets.push(offset);
    }
    
    // Calculate average offset from all taps
    const averageOffset = currentOffsets.reduce((a, b) => a + b, 0) / currentOffsets.length;
    
    // Round to nearest
    const roundedOffset = Math.round(averageOffset / this.snapMs) * this.snapMs;
    
    // Store this calculated offset for final averaging
    this.calculatedOffsets.push(roundedOffset);
    
    // Keep only recent calculated offsets
    if (this.calculatedOffsets.length > 5) {
      this.calculatedOffsets.shift();
    }
    
    // Calculate final average offset from all calculations
    const finalAverageOffset = this.calculatedOffsets.length > 0 
      ? Math.round(this.calculatedOffsets.reduce((a, b) => a + b, 0) / this.calculatedOffsets.length / this.snapMs) * this.snapMs
      : roundedOffset;
    
    // Calculate confidence based on tap consistency
    const confidence = this.calculateConfidence(currentOffsets);
    
    // Update display with the final averaged offset
    const offsetDisplay = `Offset: ${finalAverageOffset}ms`;
    this.offsetText.write(offsetDisplay);
    
    // Change color based on confidence
    if (this.taps.length >= this.requiredTaps && confidence >= this.confidenceThreshold) {
      this.offsetText.tint = 0x00FF00; // Green - confident
    } else if (this.taps.length >= 4) {
      this.offsetText.tint = 0xFFFF00; // Yellow - somewhat confident
    } else {
      this.offsetText.tint = 0xFFFFFF; // White - not confident
    }
  }

  /**
   * Computes a confidence value from the standard deviation of tap offsets.
   * @param {Array} offsets - Tap offset measurements in milliseconds
   * @returns {number} Confidence between 0 and 1, where 1 means perfectly consistent
   */
  calculateConfidence(offsets) {
    if (offsets.length < 3) return 0;
    
    // Calculate mean offset
    const mean = offsets.reduce((a, b) => a + b, 0) / offsets.length;
    
    // Calculate variance
    const variance = offsets.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / offsets.length;
    
    // Calculate standard deviation
    const stdDev = Math.sqrt(variance);
    
    // Confidence is inverse of standard deviation (lower deviation = higher confidence)
    // Using 50ms as reference point (if stdDev is 50ms, confidence is 0)
    const confidence = Math.max(0, 1 - (stdDev / 50));
    
    return Math.min(1, confidence);
  }
  
  /**
   * Rounds an offset value to the nearest snap interval.
   * @param {number} num - Offset value in milliseconds
   * @returns {number} The offset rounded to the snap interval
   */
  roundToSnapMs(num) {
    const rounded = Math.round(num / this.snapMs);
    return rounded >= 0 ? rounded * this.snapMs : (rounded + 1) * this.snapMs;
  }

  /**
   * Gives brief visual feedback by scaling the instruction text.
   */
  showTapFeedback() {
    // Flash the instruction text briefly
    this.game.add.tween(this.instructionText.scale)
      .to({ x: 1.1, y: 1.1 }, 50, Phaser.Easing.Quadratic.Out, true)
      .yoyo(true);
  }

  /**
   * Saves the final averaged offset to the account settings, resumes music,
   * cleans up, and returns to the settings menu.
   */
  exit() {
    // Calculate final offset average
    let finalOffset = 0;
    
    if (this.calculatedOffsets.length > 0) {
      finalOffset = this.roundToSnapMs(this.calculatedOffsets.reduce((a, b) => a + b, 0) / this.calculatedOffsets.length);
      
      // Update account settings with the final averaged offset
      Account.settings.userOffset = finalOffset;
      saveAccount();
      
      // Show confirmation
      notifications.show(`Offset set to ${finalOffset}ms`);
    } else if (this.taps.length > 0) {
      // Fallback to last calculation if no averages stored
      const currentOffset = this.parseOffsetText();
      if (currentOffset !== null) {
        Account.settings.userOffset = Math.floor(currentOffset * 100) * 100;
        saveAccount();
        notifications.show(`Offset set to ${currentOffset}ms`);
      }
    }
    
    // Resume background music
    this.resumeBackgroundMusic();
    
    // Return to settings menu
    this.destroy();
    game.state.getCurrentState().menu();
  }

  /**
   * Reads the current offset value from the displayed text.
   * @returns {number|null} The parsed offset in milliseconds, or null if unreadable
   */
  parseOffsetText() {
    const text = this.offsetText.text;
    const match = text.match(/Offset: (-?\d+)ms/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  /**
   * Ensures background music is resumed and destroys all created objects.
   */
  destroy() {
    // Make sure music is resumed even if destroyed unexpectedly
    this.resumeBackgroundMusic();
    
    this.destroyed = true;
    
    // Clean up all created objects
    this.background.destroy();
    this.instructionText.destroy();
    this.offsetText.destroy();
    this.tapCounter.destroy();
    this.exitText.destroy();
    
    super.destroy();
  }
}
