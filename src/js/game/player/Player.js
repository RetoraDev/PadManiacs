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
    this.lastNoteCheckBeats = [null, null, null, null];
    this.score = 0;
    this.combo = 0;
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
    this.comboShieldActive = false;
    this.skillSystem.onHealthRegen = amount => this.onSkillHpRegen(amount);
    this.skillSystem.onComboShield = () => this.onComboShield();
    
    // Calculate total notes for accuracy
    this.calculateTotalNotes();
    this.updateAccuracy();
    
    // Copy receptors from renderer
    this.receptors = this.renderer.receptors;
    
    // Create UI text elements
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
  
  findClosestNote(column, beat, noteTypes, searchRangeSeconds = 0.5) {
    // Convert search range from seconds to beats for initial filtering
    const currentTime = this.scene.getCurrentTime().now;
    const searchRangeBeats = searchRangeSeconds * (this.getCurrentBPM(beat) / 60);
    
    const candidateNotes = this.notes.filter(n => 
      !n.hit && 
      n.column === column && 
      noteTypes.includes(n.type) && 
      Math.abs(n.beat - beat) <= searchRangeBeats
    );
  
    if (candidateNotes.length === 0) return null;
  
    // Find closest by time, not beats
    return candidateNotes.reduce((closest, current) => {
      const currentTimeDelta = Math.abs(current.sec - currentTime);
      const closestTimeDelta = Math.abs(closest.sec - currentTime);
      return currentTimeDelta < closestTimeDelta ? current : closest;
    });
  }

  findNotesInJudgeWindow(column, beat, noteTypes, judgeWindow) {
    // Find all notes of specified types within judge window
    return this.notes.filter(n => 
      !n.hit && 
      n.column === column && 
      noteTypes.includes(n.type) && 
      Math.abs(n.beat - beat) <= judgeWindow
    );
  }

  processNoteIfInWindow(note, currentTime, column, callback) {
    // Calculate time delta in seconds
    const noteTime = note.sec;
    const timeDelta = noteTime - currentTime;
    
    // Convert judge window to seconds for comparison
    const maxWindowSeconds = this.scene.JUDGE_WINDOWS.boo / 1000;
    
    if (Math.abs(timeDelta) <= maxWindowSeconds && this.lastNoteCheckBeats[column] !== note.beat) {
      callback(note, timeDelta);
      this.lastNoteCheckBeats[column] = note.beat;
      this.vibrate(REGULAR_VIBRATION_INTENSITY);
      return true;
    }
    return false;
  }

  // AI autolay method
  autoPlay() {
    if (!this.scene.startTime || this.scene.isPaused) return;
    
    const { now, beat } = this.scene.getCurrentTime();
    
    // Process regular notes for auto-play
    for (let column = 0; column < 4; column++) {
      const closestNote = this.findClosestNote(column, beat, "1");
      
      if (closestNote) {
        const delta = closestNote.beat - beat;
        
        // Check if note is within window
        if (delta <= 0 && !this.inputStates[column]) {
          // Simulate perfect input - press and immediately release
          this.handleInput(column, true);
          this.handleInput(column, false);
        }
      }
    }
    
    // Process freezes for auto-play
    for (let column = 0; column < 4; column++) {
      const holdNote = this.findClosestNote(column, beat, ["2", "4"]);
      
      if (holdNote && !this.autoplayActiveHolds.has(column)) {
        const delta = holdNote.beat - beat;
        if (delta <= 0) {
          // Start hold
          this.handleInput(column, true);
          this.autoplayActiveHolds.add(column);
        }
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
      const holdForgiveness = this.getHoldForgiveness();

      // Handle roll note tapping
      if (hold?.note.type === "4") {
        hold.tapped++;
        hold.lastTap = now;
        hold.active = true;
        hold.inactive = false;
        this.toggleHoldExplosion(column, true);
        this.vibrate(WEAK_VIBRATION_INTENSITY);
      }
  
      // Check for new holds and regular notes
      const regularNoteHit = this.checkRegularNotes(column, now, beat);
      if (!hold && !regularNoteHit) this.checkHoldStart(column, now, beat);
    }
    // Handle key up events
    else {
      this.heldColumns.delete(column);
      this.checkHoldRelease(column, now);
    }
  }
  
  checkRegularNotes(column, now, beat) {
    const closestNote = this.findClosestNote(column, beat, ["1"]);
    
    if (closestNote) {
      return this.processNoteIfInWindow(closestNote, now, column, (note, timeDelta) => {
        const judgement = this.getJudgement(timeDelta);
  
        this.createExplosion(note);
        note.sprite?.destroy();
        !note.hit && this.processJudgement(note, judgement, column);
        note.hit = true;
      });
    }
    return false;
  }

  checkMines(column, now, beat) {
    // Find mine notes that are very close to the current beat (at judgment line)
    const mineNotes = this.notes.filter(n => 
      !n.hit && 
      n.column === column && 
      n.type === "M" && 
      Math.abs(n.beat - beat) <= 0.1 // Small beat window
    );
  
    let hitMine = false;
    
    for (const mineNote of mineNotes) {
      // Double-check using the renderer's position calculation
      const { yPos } = this.renderer.calculateVerticalPosition(mineNote, now, beat);
      const judgmentLine = this.renderer.JUDGE_LINE;
      
      if (Math.abs(yPos - judgmentLine) <= 12) { // 12 pixel tolerance
        this.triggerMine(mineNote);
        hitMine = true;
      }
    }
    
    return hitMine;
  }
  
  triggerMine(mineNote) {
    this.createExplosion(mineNote, "mine");
    mineNote.hit = true;
    mineNote.sprite?.destroy();
    
    // Apply mine damage reduction from skills
    const mineDamageMultiplier = this.skillSystem ? this.skillSystem.getMineDamageMultiplier() : 1.0;
    const damage = Math.floor(10 * mineDamageMultiplier);
    
    this.health = Math.max(0, this.health - damage);
    this.combo = 0;
    
    // Trigger mine hit skill activation
    if (this.skillSystem) {
      this.skillSystem.checkSkillActivation('on_mine_hit', {});
    }
  }

  checkHoldStart(column, now, beat) {
    const closestHold = this.findClosestNote(column, beat, ["2", "4"]);
    
    if (closestHold) {
      this.processNoteIfInWindow(closestHold, now, column, (note, timeDelta) => {
        const judgement = this.getJudgement(timeDelta);
        
        this.processJudgement(note, judgement, column);
        
        this.activeHolds[column] = {
          note: note,
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
        note.holdActive = true;
        
        this.toggleHoldExplosion(column, true);
      });
    }
  }

  checkHoldRelease(column, now) {
    const hold = this.activeHolds[column];
    if (hold) {
      hold.lastRelease = now;

      if (hold.note.type === "2") {
        const holdForgiveness = this.getHoldForgiveness();
        const remaining = hold.note.secLength - (now - hold.startTime);
        if (remaining > holdForgiveness) {
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
  
  vibrate(duration = 25) {
    Account.settings.hapticFeedback && gamepad.vibrate(duration);
  }
  
  getAdjustedJudgementWindows() {
    const baseWindows = { ...this.scene.JUDGE_WINDOWS };
    const multiplier = this.skillSystem ? this.skillSystem.getJudgementWindowMultiplier() : 1.0;
    
    Object.keys(baseWindows).forEach(judgement => {
      baseWindows[judgement] *= multiplier;
    });
    
    return baseWindows;
  }

  getHoldForgiveness() {
    const baseForgiveness = this.HOLD_FORGIVENESS;
    const multiplier = this.skillSystem ? this.skillSystem.getHoldForgivenessMultiplier() : 1.0;
    return baseForgiveness * multiplier;
  }

  getRollForgiveness() {
    const baseForgiveness = this.ROLL_FORGIVENESS;
    const multiplier = this.skillSystem ? this.skillSystem.getRollForgivenessMultiplier() : 1.0;
    return baseForgiveness * multiplier;
  }

  getJudgement(timeDelta) {
    this.timingStory.push(timeDelta);
    
    // Use adjusted judgement windows (now in milliseconds)
    const judgeWindows = this.getAdjustedJudgementWindows();
    
    const absTimeDelta = Math.abs(timeDelta * 1000); // Convert to milliseconds
    
    for (const [judgement, window] of Object.entries(judgeWindows)) {
      if (absTimeDelta <= window) {
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
    
  processJudgement(note, judgement, column, type = "normal") {
    // Check for combo shield before processing miss
    if (judgement === "miss" && this.comboShieldActive) {
      judgement = "boo";
      this.comboShieldActive = false;
    }
    
    // Check for skill activation based on judgement
    if (this.skillSystem) {
      this.skillSystem.checkSkillActivation('on_miss', { judgement });
      
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
    
    // Filter OK/N.G. judgements
    let judgementKey = "";
    
    switch (judgement) {
      case "ok":
        judgementKey = "marvelous";
        break;
      case "n.g.":
      case "ng":
        judgementKey = "boo";
        judgement = "n.g.";
        break;
      default:
        judgementKey = judgement;
    }

    // Judge marvelous if autoplay
    if (this.autoplay) {
      judgement = type == "normal" ? "marvelous" : "ok";
      judgementKey = "marvelous";
    }
    
    // Apply score multiplier from skills
    const scoreMultiplier = this.skillSystem ? this.skillSystem.getScoreMultiplier(judgementKey) : 1.0;
    const scoreValue = Math.floor(this.scene.SCORE_VALUES[judgementKey] * scoreMultiplier);
    
    if (!this.gameOver) this.score += scoreValue;
    
    // Update judgement counts
    this.judgementCounts[judgementKey]++;

    if (judgement === "miss") {
      this.combo = 0;
      this.health = Math.max(0, this.health - 5);
    } else {
      this.combo++;
      
      // Apply health gain multiplier from skills
      const healthGainMultiplier = this.skillSystem ? this.skillSystem.getHealthGainMultiplier() : 1.0;
      const healthGain = Math.floor(2 * healthGainMultiplier);
      
      if (!this.gameOver) this.health = Math.min(this.getMaxHealth(), this.health + healthGain);
      if (this.combo > this.maxCombo) {
        this.maxCombo = this.combo;
      }
    }

    // Update accuracy
    this.updateAccuracy();

    // Update UI
    this.updateUI();

    // Show judgement text
    this.showJudgementText(judgement, column, type);
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
      perfect: 0.9,
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
    if (this.scene.accuracyBar) {
      const accuracyWidth = Math.floor(Math.max(1, (this.accuracy / 100) * 150));
      this.scene.accuracyBar.crop(new Phaser.Rectangle(0, 0, accuracyWidth, 2));
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

  showJudgementText(judgement, column, type) {
    const colors = {
      marvelous: 0x00ffff,
      perfect: 0xffff00,
      great: 0x00ff00,
      good: 0x0000ff,
      boo: 0xffa500,
      miss: 0xff0000,
      ok: 0x00cc00,
      ng: 0x22ffff
    };
    
    let tintColor = colors[judgement.replace("n.g.", "ng")];
    
    if (type == "freeze") {
      const text = new Text(this.renderer.receptors[column].x, this.renderer.JUDGE_LINE + 12 * this.renderer.DIRECTION, judgement, FONTS.stroke);
      text.tint = tintColor;
      text.anchor.setTo(0.5);
      game.add.tween(text).to({ alpha: 0, y: text.y + (8 * this.renderer.DIRECTION) }, 250, "Linear", true, 25).onComplete.addOnce(() => text.destroy());
    } else {
      this.judgementText.write(judgement.toUpperCase());
      this.judgementText.tint = tintColor;
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
  
  onComboShield() {
    this.comboShieldActive = true;
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

    this.renderer.scene.activeHolds = this.activeHolds;

    const { now, beat } = this.scene.getCurrentTime();
    this.renderer.render(now, beat);
  }
  
  update() {
    const { now, beat } = this.scene.getCurrentTime();

    // Input handling
    if (!this.autoplay) {
      Object.keys(this.keymap).forEach(key => {
        if (gamepad.pressed[key]) this.handleInput(this.keymap[key], true);
        else if (gamepad.released[key]) this.handleInput(this.keymap[key], false);
      });
      
      // Check mines for currently pressed columns
      for (let column = 0; column < 4; column++) {
        if (this.inputStates[column]) {
          this.checkMines(column, now, beat);
        }
      }
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
      this.skillSystem.update();
      
      if (this.combo > 0) {
        this.skillSystem.checkSkillActivation('on_combo', { combo: this.combo });
        this.skillSystem.checkSkillActivation('on_high_combo', { combo: this.combo });
      }
      
      if (this.health <= 30) {
        this.skillSystem.checkSkillActivation('on_low_health', { health: this.health });
      }
      
      // Check critical health
      if (this.health <= 15) {
        this.skillSystem.checkSkillActivation('on_critical_health', { health: this.health });
      }
    }

    // Update health
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
    if (this.scene.accuracyBar) {
      if (this.accuracy <= 0) {
        this.scene.accuracyBar.visible = false;
      } else {
        this.scene.accuracyBar.visible = true;
      }
    }

    // Update active holds
    Object.entries(this.activeHolds).forEach(([col, hold]) => {
      const { now } = this.scene.getCurrentTime();
      
      if (this.autoplay || hold.note.type === "2") {
        if (!hold.active) {
          const holdForgiveness = this.getHoldForgiveness();
          const sinceRelease = now - hold.lastRelease;
          if (sinceRelease > holdForgiveness) {
            hold.inactive = true;
            hold.note.miss = true;
            this.toggleHoldExplosion(col, false);
          }
        }
      } else if (hold.note.type === "4") {
        const rollForgiveness = this.getRollForgiveness();
        const sinceLastTap = now - hold.lastTap;
        if (sinceLastTap > rollForgiveness) {
          hold.inactive = true;
          hold.active = false;
          hold.note.miss = true;
          this.toggleHoldExplosion(col, false);
        }
      }

      hold.progress = now - hold.startTime;
      if (hold.progress >= hold.note.secLength) {
        let judgement = "n.g.";

        if (hold.note.type === "2") {
          judgement = !hold.note.miss ? "ok" : "n.g.";
        } else if (hold.note.type === "4") {
          const requiredTaps = Math.ceil(hold.note.beatLength * this.ROLL_REQUIRED_INTERVALS);
          if (hold.note.beatLength <= 0.5) {
            judgement = "ok";
          } else {
            judgement = hold.tapped >= requiredTaps && !hold.note.miss ? "ok" : "n.g.";
          }
        }
      
        hold.note.finish = true;
        
        this.vibrate(REGULAR_VIBRATION_INTENSITY)

        this.processJudgement(hold.note, judgement, Number(col), "freeze");
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