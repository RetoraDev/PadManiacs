class OffsetAssistant extends Phaser.Sprite {
  constructor(game) {
    super(game, 0, 0);
    
    this.taps = [];
    this.confidenceThreshold = 0.8;
    this.maxTaps = 16;
    this.requiredTaps = 8;
    this.tickBPM = 120;
    this.tickInterval = 60000 / this.tickBPM; // 500ms per tick
    
    // Store background music state
    this.wasMusicPlaying = backgroundMusic && backgroundMusic.isPlaying;
    this.originalMusicTime = 0;
    
    // Pause background music
    this.pauseBackgroundMusic();
    
    // Start tick sound
    this.startTickSound();
    
    // Create background
    this.background = game.add.graphics(0, 0);
    this.background.beginFill(0x000000, 0.8);
    this.background.drawRect(0, 0, game.width, game.height);
    this.background.endFill();
    this.addChild(this.background);
    
    // Create instruction text
    this.instructionText = new Text(game.width / 2, game.height / 2 - 20, "TAP A TO THE TICK", FONTS.shaded);
    this.instructionText.anchor.set(0.5);
    this.addChild(this.instructionText);
    
    // Create offset display text
    this.offsetText = new Text(game.width / 2, game.height / 2 + 10, "Offset: 0ms", FONTS.default);
    this.offsetText.anchor.set(0.5);
    this.addChild(this.offsetText);
    
    // Create tap counter
    this.tapCounter = new Text(game.width / 2, game.height / 2 + 30, "Taps: 0", FONTS.default);
    this.tapCounter.anchor.set(0.5);
    this.tapCounter.alpha = 0.7;
    this.addChild(this.tapCounter);
    
    // Create exit hint
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
    this.calculatedOffsets = [];
  }

  update() {
    // Handle A button for tapping
    if (gamepad.pressed.a && !this.lastAPress) {
      this.onTap();
    }
    this.lastAPress = gamepad.pressed.a;
    
    // Handle B button to exit
    if (gamepad.pressed.b && !this.lastBPress) {
      this.exit();
    }
    this.lastBPress = gamepad.pressed.b;
    
    // Update tick sound
    this.updateTickSound();
    
    // Update tap counter
    this.tapCounter.write(`Taps: ${this.taps.length}`);
  }

  pauseBackgroundMusic() {
    if (backgroundMusic && backgroundMusic.isPlaying) {
      this.originalMusicTime = backgroundMusic.audio.currentTime;
      backgroundMusic.stop();
    }
  }

  resumeBackgroundMusic() {
    if (backgroundMusic && this.wasMusicPlaying) {
      // Try to resume from where we left off
      backgroundMusic.audio.currentTime = this.originalMusicTime;
      backgroundMusic.audio.play();
    }
  }

  startTickSound() {
    // Preload the tick sound if not already loaded
    if (!game.cache.checkSoundKey('assist_tick')) {
      console.warn("Tick sound not preloaded!");
      return;
    }
    
    // Play first tick immediately
    this.playTickSound();
    this.lastTickTime = this.game.time.now;
    this.nextTickTime = this.lastTickTime + this.tickInterval;
  }

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

  playTickSound() {
    if (game.cache.checkSoundKey('assist_tick')) {
      const tickSound = game.add.audio('assist_tick');
      tickSound.volume = 0.5;
      tickSound.play();
    }
  }

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
    
    // Round to nearest 25ms
    const roundedOffset = Math.round(averageOffset / 25) * 25;
    
    // Store this calculated offset for final averaging
    this.calculatedOffsets.push(roundedOffset);
    
    // Keep only recent calculated offsets
    if (this.calculatedOffsets.length > 5) {
      this.calculatedOffsets.shift();
    }
    
    // Calculate final average offset from all calculations
    const finalAverageOffset = this.calculatedOffsets.length > 0 
      ? Math.round(this.calculatedOffsets.reduce((a, b) => a + b, 0) / this.calculatedOffsets.length / 25) * 25
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
  
  roundToNearestMultipleOf25(num) {
    const rounded = Math.round(num / 25);
    return rounded >= 0 ? rounded * 25 : (rounded + 1) * 25;
  }

  showTapFeedback() {
    // Flash the instruction text briefly
    this.game.add.tween(this.instructionText.scale)
      .to({ x: 1.1, y: 1.1 }, 50, Phaser.Easing.Quadratic.Out, true)
      .yoyo(true);
  }

  exit() {
    // Calculate final offset average
    let finalOffset = 0;
    
    if (this.calculatedOffsets.length > 0) {
      finalOffset = this.roundToNearestMultipleOf25(this.calculatedOffsets.reduce((a, b) => a + b, 0) / this.calculatedOffsets.length);
      
      // Update account settings with the final averaged offset
      Account.settings.userOffset = finalOffset;
      saveAccount();
      
      // Show confirmation
      notifications.show(`Offset set to ${finalOffset}ms`);
    } else if (this.taps.length > 0) {
      // Fallback to last calculation if no averages stored
      const currentOffset = this.parseOffsetText();
      if (currentOffset !== null) {
        Account.settings.userOffset = currentOffset;
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

  parseOffsetText() {
    const text = this.offsetText.text;
    const match = text.match(/Offset: (-?\d+)ms/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

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
