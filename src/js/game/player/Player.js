class Player {
  constructor(scene) {
    this.scene = scene
    
    // Use ChartRenderer for rendering
    this.renderer = new ChartRenderer(scene, JSON.parse(JSON.stringify(scene.song)), scene.song.difficultyIndex, {
      enableGameplayLogic: true,
      enableJudgement: true,
      enableInput: true,
      enableHealth: true,
      enableMissChecking: true
    });
    
    // Copy references from renderer
    this.notes = this.renderer.notes;
    this.bpmChanges = this.renderer.bpmChanges;
    this.stops = this.renderer.stops;
    
    this.autoplay = scene.autoplay;
    this.autoplayActiveHolds = new Set();

    // Gamepad keymap
    this.keymap = {
      left: 0,
      down: 1,
      up: 2,
      right: 3,
      a: 3,
      b: 2
    };

    // Game state
    this.inputStates = [false, false, false, false];
    this.lastInputStates = [false, false, false, false];
    this.activeHolds = {};
    this.heldColumns = new Set();
    this.judgementHistory = [];
    this.lastNoteCheckBeats = [0, 0, 0, 0];
    this.score = 0;
    this.combo = 0;
    this.acurracy = 0;
    this.maxCombo = 0;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.previousHealth = this.health;
    this.timingStory = [];

    // Game constants
    this.HOLD_FORGIVENESS = 0.3;
    this.ROLL_FORGIVENESS = 0.3;
    this.ROLL_REQUIRED_INTERVALS = 0.5;
    
    // Accuracy tracking
    this.judgementCounts = {
      marvelous: 0,
      perfect: 0,
      great: 0,
      good: 0,
      boo: 0,
      miss: 0
    };
    this.totalNotes = 0;
    this.accuracy = 0;
    this.gameOver = false;
    
    // Skill system
    this.skillSystem = this.scene.skillSystem;
    this.perfectStreak = 0;
    this.skillSystem.onHealthRegen = amount => this.onSkillHpRegen(amount);
    
    // Calculate total notes for accuracy
    this.calculateTotalNotes();
    this.updateAccuracy();
    
    // Copy receptors from renderer
    this.receptors = this.renderer.receptors;
    
    // Create UI text elements (keep existing UI creation)
    this.judgementText =
      this.scene.judgementText ||
      new Text(96, 20, "", {
        tint: 0xffffff
      });
    
    this.comboText =
      this.scene.comboText ||
      new Text(96, 40, "0", {
        tint: 0xffffff
      });

    this.scoreText =
      this.scene.scoreText ||
      new Text(8, 8, "00000000", {
        tint: 0xffffff
      });

    this.healthText =
      this.scene.healthText ||
      new Text(184, 8, "100%", {
        tint: 0xffffff
      });
  }
  
  calculateTotalNotes() {
    this.totalNotes = this.notes.filter(note => 
      note.type === "1" || note.type === "2" || note.type === "4"
    ).length;
  }
  
  calculateLeftOffset() {
    const totalWidth = 4 * this.COLUMN_SIZE + 3 * this.COLUMN_SEPARATION;
    return (192 - totalWidth) / 2;
  }
  
  // AI autoplay method
  autoPlay() {
    if (!this.scene.startTime || this.scene.isPaused) return;
    
    const { now, beat } = this.scene.getCurrentTime();
    
    // Process regular notes for auto-play
    for (let column = 0; column < 4; column++) {
      const closestNote = this.notes.find(n => 
        !n.hit && 
        n.column === column && 
        n.type === "1" && 
        n.beat - beat <= 0.005
      );
      
      if (closestNote && !this.inputStates[column]) {
        // Simulate perfect input - press and immediately release
        this.handleInput(column, true);
        this.handleInput(column, false);
      }
    }
    
    // Process freezes for auto-play
    for (let column = 0; column < 4; column++) {
      const holdNote = this.notes.find(n => 
        (n.type === "2" || n.type === "4") && 
        n.column === column && 
        !n.hit && 
        !n.holdActive && // Only process if not already active
        Math.abs(n.beat - beat) <= this.scene.JUDGE_WINDOWS.marvelous
      );
      
      if (holdNote && !this.autoplayActiveHolds.has(column)) {
        // Start hold
        this.handleInput(column, true);
        this.autoplayActiveHolds.add(column);
      }
      
      // Check if we should release completed holds
      const activeHold = this.activeHolds[column];
      if (activeHold && activeHold.progress >= activeHold.note.secLength) {
        this.handleInput(column, false);
        this.autoplayActiveHolds.delete(column);
      }
    }
    
    // Clean up any holds that are no longer active but we think they are
    for (let column of this.autoplayActiveHolds) {
      const activeHold = this.activeHolds[column];
      if (!activeHold || activeHold.note.hit) {
        this.handleInput(column, false);
        this.autoplayActiveHolds.delete(column);
      }
    }
  }

  // Input handling
  handleInput(column, isKeyDown) {
    if (!this.scene.startTime || this.scene.isPaused) return;
  
    const { now, beat } = this.scene.getCurrentTime();
    const hold = this.activeHolds[column];
  
    // Update input state
    this.inputStates[column] = isKeyDown;
  
    // Handle key down events
    if (isKeyDown) {
      this.heldColumns.add(column);
  
      // Reactivate inactive holds within forgiveness window
      if (hold?.inactive && now - hold.lastRelease < this.HOLD_FORGIVENESS) {
        hold.active = true;
        hold.inactive = false;
        hold.pressCount++;
        hold.lastPress = now;
        this.toggleHoldExplosion(column, true);
      }
  
      // Handle roll note tapping
      if (hold?.note.type === "4") {
        hold.tapped++;
        hold.lastTap = now;
        hold.active = true;
        hold.inactive = false;
        this.toggleHoldExplosion(column, true);
      }
  
      // Check for new holds and regular notes
      const noteHit = this.checkRegularNotes(column, now, beat);
      if (!noteHit) this.checkHoldStart(column, now, beat);
    }
    // Handle key up events
    else {
      this.heldColumns.delete(column);
      this.checkHoldRelease(column, now);
    }
  }
  
  checkRegularNotes(column, now, beat) {
    const closestNote = this.notes.find(n => !n.hit && n.column === column && n.type === "1" && Math.abs(n.beat - beat) <= this.scene.JUDGE_WINDOWS.boo);

    if (closestNote && this.lastNoteCheckBeats[column] !== beat) {
      const delta = Math.abs(closestNote.beat - beat);
      const judgement = this.getJudgement(delta);

      this.createExplosion(closestNote);
      closestNote.sprite?.destroy();
      this.processJudgement(closestNote, judgement, column);
      closestNote.hit = true;

      this.lastNoteCheckBeats[column] = beat;
      
      return true;
    } else {
      return false;
    }
  }

  checkMines(column, now, beat) {
    const mineNote = this.notes.find(n => n.type === "M" && n.column === column && !n.hit && Math.abs(n.beat - beat) <= this.scene.JUDGE_WINDOWS.marvelous);

    if (mineNote) {
      this.createExplosion(mineNote, "mine");
      mineNote.hit = true;
      mineNote.sprite?.destroy();
      this.health = Math.max(0, this.health - 10);
      this.combo = 0;
    }
  }

  checkHoldStart(column, now, beat) {
    const holdNote = this.notes.find(n => (n.type === "2" || n.type === "4") && n.column === column && !n.hit && Math.abs(n.beat - beat) <= this.scene.JUDGE_WINDOWS.boo);

    if (holdNote && this.lastNoteCheckBeats[column] !== beat) {
      const delta = Math.abs(holdNote.beat - beat);
      const judgement = this.getJudgement(delta);
      
      this.activeHolds[column] = {
        note: holdNote,
        startTime: now,
        progress: 0,
        tapped: 0,
        pressCount: 0,
        active: true,
        inactive: false,
        lastPress: now,
        lastRelease: null,
        lastTap: now
      };
      holdNote.holdActive = true;
    }
  }

  checkHoldRelease(column, now) {
    const hold = this.activeHolds[column];
    if (hold) {
      hold.lastRelease = now;

      if (hold.note.type === "2") {
        const remaining = hold.note.secLength - (now - hold.startTime);
        if (remaining > this.HOLD_FORGIVENESS) {
          hold.active = false;
          hold.inactive = true;
          this.toggleHoldExplosion(column, false);
        }
      }
    }
  }
  
  createExplosion(note, type = "normal") {
    this.renderer.createExplosion(note, type);
  }

  toggleHoldExplosion(column, visible) {
    this.renderer.toggleHoldExplosion(column, visible);
  }
  
  getAdjustedJudgementWindows() {
    const baseWindows = { ...this.scene.JUDGE_WINDOWS };
    const multiplier = this.skillSystem ? this.skillSystem.getJudgementWindowMultiplier() : 1.0;
    
    Object.keys(baseWindows).forEach(judgement => {
      baseWindows[judgement] *= multiplier;
    });
    
    return baseWindows;
  }

  getJudgement(delta) {
    this.timingStory.push(delta);
    
    // Use adjusted judgement windows
    const judgeWindows = this.getAdjustedJudgementWindows();
    
    for (const [judgement, window] of Object.entries(judgeWindows)) {
      if (delta <= window) {
        // Update perfect streak
        if (judgement === 'marvelous' || judgement === 'perfect') {
          this.perfectStreak++;
        } else {
          this.perfectStreak = 0;
        }
        return judgement;
      }
    }
    return "miss";
  }
  
  processJudgement(note, judgement, column) {
    // Check for skill activation based on judgement
    if (this.skillSystem) {
      this.skillSystem.checkSkillActivation('on_miss', { judgement: judgement });
      
      // Check perfect streak
      if (this.perfectStreak > 0) {
        this.skillSystem.checkSkillActivation('on_perfect_streak', { 
          perfectStreak: this.perfectStreak 
        });
      }
    }
    
    // Apply judgement conversion from skills
    if (this.skillSystem) {
      const conversion = this.skillSystem.getJudgementConversion();
      if (conversion && judgement === conversion.from) {
        judgement = conversion.to;
      }
    }
    
    const scoreValue = this.scene.SCORE_VALUES[judgement];
    if (!this.gameOver) this.score += scoreValue;
    
    // Judge marvelous if autoplay
    if (this.autoplay) judgement = "marvelous";
    
    // Update judgement counts
    this.judgementCounts[judgement]++;

    if (judgement === "miss") {
      this.combo = 0;
      this.health = Math.max(0, this.health - 5);
    } else {
      this.combo++;
      if (!this.gameOver) this.health = Math.min(this.getMaxHealth(), this.health + 2);
      if (this.combo > this.maxCombo) {
        this.maxCombo = this.combo;
      }
    }

    // Update accuracy
    this.updateAccuracy();

    // Update UI
    this.updateUI();

    // Show judgement text
    this.showJudgementText(judgement, column);
  }
  
  getMaxHealth() {
    const baseHealth = this.maxHealth;
    const bonus = this.skillSystem ? this.skillSystem.getMaxHealthBonus() : 0;
    return baseHealth + bonus;
  }
  
  getNoteSpeedMultiplier() {
    const baseMultiplier = this.NOTE_SPEED_MULTIPLIER;
    const skillMultiplier = this.skillSystem ? this.skillSystem.getNoteSpeedMultiplier() : 1.0;
    return baseMultiplier * skillMultiplier;
  }
  
  updateAccuracy() {
    if (this.gameOver) return;
    
    const weights = {
      marvelous: 1.0,
      perfect: 1.0,
      great: 0.8,
      good: 0.5,
      boo: 0.25,
      miss: 0.0
    };

    let totalWeight = 0;
    let achievedWeight = 0;

    // Calculate weights for all judged notes
    for (const [judgement, count] of Object.entries(this.judgementCounts)) {
      const weight = weights[judgement];
      totalWeight += count * 1.0; // Maximum possible weight for each note
      achievedWeight += count * weight;
    }

    // Add remaining notes as misses (0 weight)
    const judgedNotes = Object.values(this.judgementCounts).reduce((a, b) => a + b, 0);
    const remainingNotes = Math.max(0, this.totalNotes - judgedNotes);
    totalWeight += remainingNotes * 1.0; // Maximum possible weight for remaining notes
    // achievedWeight stays the same for remaining notes (they count as 0)

    // Calculate final accuracy (0-100%)
    this.accuracy = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 100;
    
    // Clamp to 0-100%
    this.accuracy = Phaser.Math.clamp(this.accuracy, 0, 100);
    
    // Update accuracy bar in HUD if it exists
    if (this.scene.acurracyBar) {
      const accuracyWidth = Math.floor(Math.max(1, (this.accuracy / 100) * 150));
      this.scene.acurracyBar.crop(new Phaser.Rectangle(0, 0, accuracyWidth, 2));
    }
  }

  updateUI() {
    this.comboText.write(this.combo.toString());
    this.comboText.tint = this.getComboColor(this.combo);

    this.scoreText.write(this.score.toString().padStart(8, "0"));
    
    // Pulse combo on increase
    if (this.combo > 0) {
      this.pulseText(this.comboText);
    }
  }
  
  getScoreRating() {
    const acc = this.accuracy;
    
    if (acc >= 98) return "SSS+";
    if (acc >= 95) return "SSS";
    if (acc >= 92.5) return "SS";
    if (acc >= 90) return "S";
    if (acc >= 80) return "A";
    if (acc >= 70) return "B";
    if (acc >= 60) return "C";
    if (acc >= 50) return "D";
    if (acc >= 40) return "E";
    return "F";
  }

  showJudgementText(judgement, column) {
    const colors = {
      marvelous: 0x00ffff,
      perfect: 0xffff00,
      great: 0x00ff00,
      good: 0x0000ff,
      boo: 0xffa500,
      miss: 0xff0000
    };

    this.judgementText.write(judgement.toUpperCase());
    this.judgementText.tint = colors[judgement];
    this.judgementText.alpha = 1;
    this.judgementText.scale.set(1);

    game.tweens.removeFrom(this.judgementText);
    game.add.tween(this.judgementText.scale).to({ x: 1.5, y: 1 }, 200, "Linear", true).yoyo(true);
    game.add.tween(this.judgementText).to({ alpha: 0 }, 200, "Linear", true, 200);
    
    if (column !== undefined && judgement !== "miss") {
      const receptor = this.receptors[column];
      this.pulseSprite(receptor);
    }
  }

  pulseText(text) {
    text.scale.set(1);
    game.add.tween(text.scale).to({ x: 1.3, y: 1.3 }, 100, "Linear", true).yoyo(true);
  }

  pulseSprite(sprite) {
    sprite.scale.set(1);
    game.add.tween(sprite.scale).to({ x: 1.2, y: 1.2 }, 50, "Linear", true).yoyo(true);
  }
  
  getComboColor(combo) {
    const max = 100;
    const value = Math.min(max, combo);
    const r = Math.floor(255 + (255 - 255) * (value / max));
    const g = Math.floor(255 + (255 - 255) * (value / max));
    const b = Math.floor(255 + (0 - 255) * (value / max));
    return (r << 16) | (g << 8) | b;
  }
  
  onSkillHpRegen(amount = 0) {
    if (!this.gameOver) {
      this.health = Math.min(this.getMaxHealth(), this.health + amount);
    }
  }
  
  getCurrentBPM(beat = 0) {
    return this.renderer.getCurrentBPM(beat);
  }
  
  getLastBpm(time, valueType) {
    return this.renderer.getLastBpm(time, valueType);
  }
  
  beatToSec(beat) {
    return this.renderer.beatToSec(beat);
  }
  
  secToBeat(sec) {
    return this.renderer.secToBeat(sec);
  }
  
  render() {
    if (!this.scene.startTime || this.scene.isPaused) return;

    const { now, beat } = this.scene.getCurrentTime();
    this.renderer.render(now, beat);
  }
  
  update() {
    const { now, beat } = this.scene.getCurrentTime();

    // Input handling (keep existing input logic)
    if (!this.autoplay) {
      Object.keys(this.keymap).forEach(key => {
      if (gamepad.pressed[key]) this.handleInput(this.keymap[key], true);
      else if (gamepad.released[key]) this.handleInput(this.keymap[key], false);
      for (let column = 0; column < 4; column++) {
        let pressed = this.inputStates[column];
        if (pressed) {
          this.checkMines(column, now, beat);
        }
      }
    });
    } else {
      this.autoPlay();
    }
    
    // Key down/up animation
    for (let i = 0; i < 4; i++) {
      const receptor = this.receptors[i];
      const down = this.inputStates[i];
      if (receptor.down != down) {
        receptor.down = down;
      }
      receptor.frame = down ? 0 : 2;
    }
    
    // Check for skill activations
    if (this.skillSystem) {
      if (this.combo > 0) {
        this.skillSystem.checkSkillActivation('on_combo', { combo: this.combo });
        this.skillSystem.checkSkillActivation('on_high_combo', { combo: this.combo });
      }
      
      if (this.health <= 30) {
        this.skillSystem.checkSkillActivation('on_low_health', { health: this.health });
      }
    }

    // Update health (keep existing health logic)
    if (this.health != this.previousHealth) {
      this.previousHealth = this.health;
      game.add.tween(this.scene.lifebarMiddle).to({ width: (this.health / this.getMaxHealth()) * 102 }, 100, Phaser.Easing.Quadratic.In, true);
      if (this.health <= 0) {
        this.gameOver = true;
        this.health = 0;
      }
      this.healthText.write(this.health.toString());
    }
    this.scene.lifebarEnd.x = this.scene.lifebarMiddle.width;
    if (this.scene.acurracyBar) {
      if (this.accuracy <= 0) {
        this.scene.acurracyBar.visible = false;
      } else {
        this.scene.acurracyBar.visible = true;
      }
    }

    // Update active holds (keep existing hold logic)
    Object.entries(this.activeHolds).forEach(([col, hold]) => {
      const { now } = this.scene.getCurrentTime();
      
      if (this.autoplay || hold.note.type === "2") {
        if (!hold.active) {
          const sinceRelease = now - hold.lastRelease;
          if (sinceRelease > this.HOLD_FORGIVENESS) {
            hold.inactive = true;
            hold.note.miss = true;
            this.toggleHoldExplosion(col, false);
          }
        }
      } else if (hold.note.type === "4") {
        const sinceLastTap = now - hold.lastTap;
        if (sinceLastTap > this.ROLL_FORGIVENESS) {
          hold.inactive = true;
          hold.active = false;
          hold.note.miss = true;
          this.toggleHoldExplosion(col, false);
        }
      }

      hold.progress = now - hold.startTime;
      if (hold.progress >= hold.note.secLength) {
        let judgement = "boo";

        if (hold.note.type === "2") {
          judgement = !hold.note.miss ? "marvelous" : "boo";
        } else if (hold.note.type === "4") {
          const requiredTaps = Math.ceil(hold.note.beatLength * this.ROLL_REQUIRED_INTERVALS);
          if (hold.note.beatLength <= 0.5) {
            judgement = "marvelous";
          } else {
            judgement = hold.tapped >= requiredTaps && !hold.note.miss ? "marvelous" : "boo";
          }
        }
      
        hold.note.finish = true;

        this.processJudgement(hold.note, judgement, Number(col));
        hold.note.hit = true;
        this.toggleHoldExplosion(col, false);
        delete this.activeHolds[col];
      }
    });
  }

  destroy() {
    if (this.renderer) {
      this.renderer.destroy();
    }
  }
}
