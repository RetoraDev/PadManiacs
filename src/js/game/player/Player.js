class Player {
  constructor(scene) {
    this.scene = scene;
    this.chart = JSON.parse(JSON.stringify(scene.song.chart));
    this.difficulty = this.chart.difficulties[scene.song.difficultyIndex];
    this.notes = this.chart.notes[this.difficulty.type + this.difficulty.rating];
    this.bpmChanges = this.chart.bpmChanges;
    this.stops = this.chart.stops;
    
    this.autoplay = scene.autoplay;
    this.autoplayActiveHolds = new Set();
    
    this.scrollDirection = Account.settings.scrollDirection || 'falling';

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

    // Visual elements
    this.receptors = [];
    this.judgementText = null;
    this.comboText = null;
    this.scoreText = null;
    this.healthText = null;

    // Game constants
    this.VERTICAL_SEPARATION = 1.25;
    this.SCREEN_CONSTANT = Account.settings.speedMod === "C-MOD" ? 240 / 60 : 1;
    this.NOTE_SPEED_MULTIPLIER = Account.settings.noteSpeedMult + this.SCREEN_CONSTANT;
    this.JUDGE_LINE = this.scrollDirection === 'falling' ? 90 : 30; // Top for rising, bottom for falling
    this.COLUMN_SIZE = 16;
    this.COLUMN_SEPARATION = 4;
    this.HOLD_FORGIVENESS = 0.3;
    this.ROLL_FORGIVENESS = 0.3;
    this.ROLL_REQUIRED_INTERVALS = 0.5;
    this.INACTIVE_COLOR = 0x888888;
    
    // Speed mod setting
    this.speedMod = Account.settings.speedMod || 'X-MOD';
    
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
    
    // Calculate total notes for accuracy
    this.calculateTotalNotes();
    this.updateAccuracy();
    
    // Time lines tracking
    this.lastVisibleBeats = new Set();

    // Groups for pooling
    this.linesGroup = new Phaser.SpriteBatch(game);
    this.receptorsGroup = new Phaser.SpriteBatch(game);
    this.freezeBodyGroup = new Phaser.Group(game);
    this.freezeEndGroup = new Phaser.Group(game); 
    this.notesGroup = new Phaser.SpriteBatch(game);
    this.minesGroup = new Phaser.Group(game);
    this.explosionsGroup = new Phaser.SpriteBatch(game);
    
    this.initialize();
    
    // Note color option (default to NOTE)
    this.noteColorOption = Account.settings.noteColorOption || 'NOTE';
    
    // Define color constants for spritesheet frames
    const COLORS = {
      // This is how spritesheet frames are colored
      // They are ordered like NOTE color pattern
      RED: 0,      // 4th
      BLUE: 1,     // 8th
      PURPLE: 2,   // 12th
      YELLOW: 3,   // 16th
      PINK: 4,     // 24th
      ORANGE: 5,   // 32nd
      CYAN: 6,     // 48th
      GREEN: 7,    // 64th
      WHITE: 8,    // 96th
      SKYBLUE: 9,  // 128th
      OLIVE: 10,   // 192nd
      GRAY: 11     // Anything faster
    };
    
    // Color mappings for different options
    this.colorMappings = {
      NOTE: {
        4: COLORS.RED,
        8: COLORS.BLUE,
        12: COLORS.PURPLE,
        16: COLORS.YELLOW,
        24: COLORS.PINK,
        32: COLORS.ORANGE,
        48: COLORS.CYAN,
        64: COLORS.GREEN,
        96: COLORS.WHITE,
        128: COLORS.SKYBLUE,
        192: COLORS.OLIVE,
        default: COLORS.GRAY
      },
      VIVID: {
        // VIVID: Color cycle per beat (Yellow, Maroon, Blue, Cyan)
        4: COLORS.YELLOW,   // 4th - Yellow
        8: COLORS.RED,      // 8th - Maroon (using RED as closest)
        12: COLORS.BLUE,    // 12th - Blue
        16: COLORS.CYAN,    // 16th - Cyan
        24: COLORS.YELLOW,  // 24th - Yellow (cycle repeats)
        32: COLORS.RED,     // 32nd - Maroon
        48: COLORS.BLUE,    // 48th - Blue
        64: COLORS.CYAN,    // 64th - Cyan
        96: COLORS.YELLOW,  // 96th - Yellow
        128: COLORS.RED,    // 128th - Maroon
        192: COLORS.BLUE,   // 192nd - Blue
        default: COLORS.CYAN // Ultra-fast - Cyan
      },
      FLAT: {
        // FLAT: All notes same color as VIVID 4th notes (Yellow)
        4: COLORS.YELLOW,   // 4th - Yellow
        8: COLORS.YELLOW,   // 8th - Yellow
        12: COLORS.YELLOW,  // 12th - Yellow
        16: COLORS.YELLOW,  // 16th - Yellow
        24: COLORS.YELLOW,  // 24th - Yellow
        32: COLORS.YELLOW,  // 32nd - Yellow
        48: COLORS.YELLOW,  // 48th - Yellow
        64: COLORS.YELLOW,  // 64th - Yellow
        96: COLORS.YELLOW,  // 96th - Yellow
        128: COLORS.YELLOW, // 128th - Yellow
        192: COLORS.YELLOW, // 192nd - Yellow
        default: COLORS.YELLOW // Ultra-fast - Yellow
      },
      RAINBOW: {
        // RAINBOW: Orange, Blue, Purple/Pink with color reuse
        4: COLORS.ORANGE,   // 4th - Orange
        8: COLORS.BLUE,     // 8th - Blue
        12: COLORS.PINK,    // 12th - Purple/Pink
        16: COLORS.PINK,    // 16th - Purple/Pink
        24: COLORS.BLUE,    // 24th - Blue (reused)
        32: COLORS.ORANGE,  // 32nd - Orange (reused)
        48: COLORS.PINK,    // 48th - Purple/Pink
        64: COLORS.BLUE,    // 64th - Blue (reused)
        96: COLORS.PINK,    // 96th - Purple/Pink
        128: COLORS.ORANGE, // 128th - Orange (reused)
        192: COLORS.BLUE,   // 192nd - Blue (reused)
        default: COLORS.PINK // Ultra-fast - Purple/Pink
      }
    };
  }
  
  initialize() {
    const leftOffset = this.calculateLeftOffset();

    // Create receptors
    this.receptors = [];
    for (let i = 0; i < 4; i++) {
      const receptor = game.add.sprite(
        leftOffset + i * (this.COLUMN_SIZE + this.COLUMN_SEPARATION) + this.COLUMN_SIZE / 2, 
        this.JUDGE_LINE, 
        "receptor", 
        2
      );
      receptor.anchor.set(0.5);
      
      receptor.angle = {
        0: 90,  // left
        1: 0,   // down
        2: 180, // up
        3: -90  // right
      }[i];
      
      receptor.inputEnabled = true;
      receptor.down = false;
      receptor.events.onInputDown.add(() => this.handleInput(i, true));
      receptor.events.onInputUp.add(() => this.handleInput(i, false));

      receptor.animations.add("down", [2, 1, 0], 30, false);
      receptor.animations.add("up", [0, 1, 2], 30, false);

      // Add explosion effect for receptors
      const explosion = game.add.sprite(receptor.x, receptor.y, "explosion");
      explosion.anchor.set(0.5);
      explosion.angle = receptor.angle;
      explosion.visible = false;
      receptor.explosion = explosion;

      const duration = 50;
      explosion.visible = false;
      explosion.scale.setTo(1.5);
      game.add.tween(explosion.scale).to({ x: 2, y: 2 }, duration, "Linear", true).yoyo(true).repeat(-1);

      this.receptorsGroup.add(receptor);
      this.receptors.push(receptor);
    }
    
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

  toggleHoldExplosion(column, visible) {
    const explosion = this.receptors[column].explosion;
    explosion.visible = visible;
    if (visible) {
      explosion.bringToTop();
    }
  }

  getJudgement(delta) {
    this.timingStory.push(delta);
    for (const [judgement, window] of Object.entries(this.scene.JUDGE_WINDOWS)) {
      if (delta <= window) return judgement;
    }
    return "miss";
  }
  
  processJudgement(note, judgement, column) {
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
      if (!this.gameOver) this.health = Math.min(this.maxHealth, this.health + 2);
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

    const healthPercent = Math.round(this.health / this.maxHealth);
    this.healthText.write(`${healthPercent * 100}`);

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

  createExplosion(note, type = "normal") {
    const receptor = this.receptors[note.column];
    
    const existingChild = this.explosionsGroup.getFirstDead();
    
    const explosion = existingChild || (() => {
      const child = game.add.sprite(-64, -64);
      child.anchor.set(0.5);
      this.explosionsGroup.add(child);
      return child;
    })();
    
    explosion.loadTexture(type == "normal" ? "explosion" : "mineexplosion");
    explosion.reset(receptor.x, receptor.y);
    explosion.alpha = 1;
    explosion.scale.set(1);
    explosion.angle = receptor.angle;
    
    const duration = 200;
    game.add.tween(explosion.scale)
      .to({ x: 2, y: 2 }, duration, "Linear", true);
    game.add
      .tween(explosion)
      .to({ alpha: 0 }, duration, "Linear", true)
      .onComplete.add(() => explosion.kill());
  }
  
  createLine(y, alpha) {
    const existingChild = this.linesGroup.getFirstDead();
    
    const line = existingChild || (() => {
      const bmd = game.add.bitmapData(1, 1);
      bmd.fill(255, 255, 255);
      const child = game.add.sprite(this.calculateLeftOffset(), y, bmd);
      child.width = (this.COLUMN_SIZE * 4) + (this.COLUMN_SEPARATION * 3);
      this.linesGroup.add(child);
      return child;
    })();
    
    line.y = y;
    line.alpha = alpha;
    line.revive();
    
    return line;
  }
  
  getNoteFrame(note) {
    const beat = note.beat;
    
    // Get the current color mapping
    const colorMapping = this.colorMappings[this.noteColorOption];
    
    // Check each division in the mapping
    const divisions = Object.keys(colorMapping)
      .filter(key => key !== 'default')
      .map(Number)
      .sort((a, b) => a - b);
    
    for (const division of divisions) {
      if (this.isBeatDivision(beat, division)) {
        return colorMapping[division];
      }
    }
    
    // Return default frame for ultra-fast notes
    return colorMapping.default;
  }

  isBeatDivision(beat, division) {
    // Check if the beat aligns with the given division
    // Using a small epsilon to account for floating point precision
    const epsilon = 0.0001;
    const remainder = (beat * division) % 4;
    return Math.abs(remainder) < epsilon || Math.abs(remainder - 4) < epsilon;
  }

  render() {
    if (!this.scene.startTime || this.scene.isPaused) return;

    if (this.scrollDirection === 'falling') {
      this.renderFalling();
    } else {
      this.renderRising();
    }
    
    // Render time lines if enabled
    if (Account.settings.beatLines) {
      this.renderTimeLines();
    }
  }
  
  calculateVerticalPosition(note, now, beat) {
    let pastSize;
    let bodyHeight = 0;
    
    if (this.speedMod === 'C-MOD') {
      // C-MOD: Use constant timing based on seconds
      const constantDeltaNote = note.sec - now;
      pastSize = constantDeltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.NOTE_SPEED_MULTIPLIER;
      
      // For C-MOD, calculate body height using seconds as well
      if (note.beatLength) {
        const freezeDuration = note.secLength || (note.beatLength * 60 / this.getCurrentBPM());
        bodyHeight = Math.max(this.COLUMN_SIZE, freezeDuration * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.NOTE_SPEED_MULTIPLIER);
      }
    } else {
      // X-MOD: Use beat-based timing (default)
      const deltaNote = note.beat - beat;
      pastSize = deltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.NOTE_SPEED_MULTIPLIER;
      
      // For X-MOD, calculate body height using beats
      if (note.beatLength) {
        bodyHeight = Math.max(this.COLUMN_SIZE, note.beatLength * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.NOTE_SPEED_MULTIPLIER);
      }
    }
    
    const yPos = this.scrollDirection === 'falling' ?
      this.JUDGE_LINE - pastSize :
      this.JUDGE_LINE + pastSize;
    
    return { pastSize, bodyHeight, yPos };
  }
  
  renderFalling() {
    if (!this.scene.startTime || this.scene.isPaused) return;

    const { now, beat } = this.scene.getCurrentTime();
    const leftOffset = this.calculateLeftOffset();

    // Render notes
    this.notes.forEach(note => {
      let { pastSize, bodyHeight, yPos } = this.calculateVerticalPosition(note, now, beat);
      
      const x = leftOffset + note.column * (this.COLUMN_SIZE + this.COLUMN_SEPARATION);

      // Check for missed notes
      if (note.type !== "M" && note.type != "2" && note.type != "4" && !note.hit && !note.miss && yPos > game.height) {
        note.miss = true;
        this.processJudgement(note, "miss", note.column);
      }

      // Remove off-screen notes
      if (yPos < -this.COLUMN_SIZE || yPos > game.height + bodyHeight) {
        if (note.sprite) {
          note.sprite.kill();
          delete note.sprite;
          if (note.holdParts) {
            note.holdParts.body.destroy();
            note.holdParts.end.destroy();
            delete note.holdParts;
          }
        }
        return;
      }

      const holdData = this.activeHolds[note.column];

      if (note.type === "M") {
        if (!note.sprite) {
          note.sprite = this.minesGroup.getFirstDead() || (() => {
            const sprite = game.add.sprite(x, yPos, "mine");
            this.minesGroup.add(sprite);
            return sprite;
          })();
          note.sprite.reset(0, -32);
          note.sprite.animations.add("blink", [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
          note.sprite.animations.play("blink");
        }
        note.sprite.anchor.set(0.5);
        note.sprite.x = x + this.COLUMN_SIZE / 2;
        note.sprite.y = yPos;
      } else if (note.type === "2" || note.type === "4") {
        if (!note.holdParts) {
          const prefix = note.type === "2" ? "hold" : "roll";
          
          const getBody = () => {
            const sprite = this.freezeBodyGroup.getFirstDead() || (() => {
              const child = game.add.tileSprite(-64, -64, this.COLUMN_SIZE, 0, `${prefix}_body`);
              this.freezeBodyGroup.add(child);
              return child;
            })();
            sprite.reset(x, -64);
            sprite.loadTexture(`${prefix}_body`);
            return sprite;
          };
          
          const getEnd = () => {
            const sprite = this.freezeEndGroup.getFirstDead() || (() => {
              const child = game.add.sprite(0, 0);
              this.freezeEndGroup.add(child);
              return child;
            })();
            sprite.reset(x, -64);
            sprite.loadTexture(`${prefix}_end`);
            return sprite;
          };
          
          note.holdParts = {
            body: getBody(),
            end: getEnd()
          };
          note.holdParts.body.anchor.y = 1;
          note.holdParts.end.anchor.y = 1;
          note.holdActive = false;
        }
        
        const isActive = !note.finish && !note.miss && holdData?.note === note && holdData.active;
        const isInactive = holdData?.note === note && holdData.inactive;

        let visibleHeightIsSet = typeof note.visibleHeight != "undefined";
        let visibleHeight = visibleHeightIsSet ? note.visibleHeight : bodyHeight; // OPTIMIZE: Avoid having tile sprites larger than game height.
        
        if (visibleHeight < 0) visibleHeight = 1;

        if (isActive) {
          const holdBottomY = yPos - bodyHeight;
          const judgeLineY = this.JUDGE_LINE;

          note.visibleHeight = Math.max(0, judgeLineY - holdBottomY);

          if (yPos > judgeLineY - this.COLUMN_SIZE / 2) yPos = judgeLineY;

          note.active = true;
        } else if (typeof note.visibleHeight != "undefined") {
          yPos -= bodyHeight - note.visibleHeight;
          note.active = false;
        }
        
        // Miss note when past judge line but keep it to don't mess the rhythm
        if (!note.miss && !note.holdActive && yPos > this.JUDGE_LINE + this.COLUMN_SIZE) {
          note.miss = true;
          this.processJudgement(note, "miss", note.column);
        }

        let spritesVisible = !note.finish;
         
        let freezeYPos = Math.floor(yPos);
        let freezeHeight = Math.floor(visibleHeight);
        
        note.holdParts.body.y = freezeYPos;
        note.holdParts.body.height = freezeHeight;
        note.holdParts.end.y = freezeYPos - freezeHeight;

        note.holdParts.body.visible = spritesVisible;
        note.holdParts.end.visible = spritesVisible;
        
        if (note.sprite) {
          note.sprite.visible = !isActive && spritesVisible;
        }

        const frame = isActive ? 1 : 0;
        const baseColor = note.type === "2" ? 0x00bb00 : 0x00eeee;
        const tint = note.miss ? this.INACTIVE_COLOR : baseColor;
        const alpha = note.miss ? 0.8 : 1;

        note.holdParts.body.frame = frame;
        note.holdParts.end.frame = frame;

        note.holdParts.body.tint = tint;
        note.holdParts.end.tint = tint;

        note.holdParts.body.alpha = alpha;
        note.holdParts.end.alpha = alpha;
      }

      // Show hold explosion when active
      if (holdData?.active && !note.finish && !note.miss) {
        this.toggleHoldExplosion(note.column, true);
      }

      if (note.type !== "M" && note.type !== "3") {
        if (!note.sprite) {
          note.sprite = this.notesGroup.getFirstDead() || (() => {
            const sprite = game.add.sprite(0, 0);
            this.notesGroup.add(sprite);
            return sprite;
          })();
          note.sprite.reset(0, -32);
          note.sprite.loadTexture("arrows");
          note.sprite.frame = this.getNoteFrame(note);
          note.sprite.anchor.set(0.5);
          note.sprite.angle = {
            0: 90,
            1: 0,
            2: 180,
            3: -90
          }[note.column];
        }
        note.sprite.x = x + this.COLUMN_SIZE / 2;
        note.sprite.y = yPos;
      }
    });
  }
  
  renderRising() {
    const { now, beat } = this.scene.getCurrentTime();
    const leftOffset = this.calculateLeftOffset();
    
    // Render notes
    this.notes.forEach(note => {
      let { deltaNote, scalar, bodyHeight, yPos } = this.calculateVerticalPosition(note, now, beat);
      
      const x = leftOffset + note.column * (this.COLUMN_SIZE + this.COLUMN_SEPARATION);
      
      // Check for missed notes - rising: notes are missed when they go above the screen
      if (note.type !== "M" && note.type != "2" && note.type != "4" && !note.hit && !note.miss && yPos < -this.COLUMN_SIZE) {
        note.miss = true;
        this.processJudgement(note, "miss", note.column);
      }

      // Remove off-screen notes - rising: remove when above screen or below with body
      if (yPos > game.height + this.COLUMN_SIZE || yPos < -bodyHeight) {
        if (note.sprite) {
          note.sprite.kill();
          delete note.sprite;
          if (note.holdParts) {
            note.holdParts.body.destroy();
            note.holdParts.end.destroy();
            delete note.holdParts;
          }
        }
        return;
      }

      const holdData = this.activeHolds[note.column];

      if (note.type === "M") {
        if (!note.sprite) {
          note.sprite = this.minesGroup.getFirstDead() || (() => {
            const sprite = game.add.sprite(x, yPos, "mine");
            this.notesGroup.add(sprite);
            return sprite;
          })();
          note.sprite.reset(0, -32);
          note.sprite.animations.add("blink", [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
          note.sprite.animations.play("blink");
        }
        note.sprite.anchor.set(0.5);
        note.sprite.x = x + this.COLUMN_SIZE / 2;
        note.sprite.y = yPos;
      } else if (note.type === "2" || note.type === "4") {
        if (!note.holdParts) {
          const prefix = note.type === "2" ? "hold" : "roll";
          
          const getBody = () => {
            const sprite = this.freezeBodyGroup.getFirstDead() || (() => {
              const child = game.add.tileSprite(-64, -64, this.COLUMN_SIZE, `${prefix}_body`);
              child.scale.y = -1;
              child.anchor.y = 1;
              this.freezeBodyGroup.add(child);
              return child;
            })();
            sprite.reset(x, -64);
            sprite.loadTexture(`${prefix}_body`);
            return sprite;
          };
          
          const getEnd = () => {
            const sprite = this.freezeEndGroup.getFirstDead() || (() => {
              const child = game.add.sprite(0, 0);
              child.scale.y = -1;
              child.anchor.y = 1;
              this.freezeEndGroup.add(child);
              return child;
            })();
            sprite.reset(x, -64);
            sprite.loadTexture(`${prefix}_end`);
            return sprite;
          };
          
          note.holdParts = {
            body: getBody(),
            end: getEnd()
          };
          
          note.holdActive = false;
        }
        
        const isActive = !note.finish && !note.miss && holdData?.note === note && holdData.active;
        const isInactive = holdData?.note === note && holdData.inactive;

        let visibleHeightIsSet = typeof note.visibleHeight != "undefined";
        let visibleHeight = visibleHeightIsSet ? note.visibleHeight : bodyHeight;

        if (visibleHeight < 0) visibleHeight = 1;

        if (isActive) {
          const holdTopY = yPos + bodyHeight;
          const judgeLineY = this.JUDGE_LINE;
          note.visibleHeight = Math.max(0, holdTopY - judgeLineY);
          
          if (yPos < judgeLineY + this.COLUMN_SIZE / 2) yPos = judgeLineY;

          note.active = true;
        } else if (typeof note.visibleHeight != "undefined") {
          yPos += bodyHeight - note.visibleHeight;
          note.active = false;
        }
        
        // Miss note when past judge line - rising: miss when above judge line
        if (!note.miss && !note.holdActive && yPos < this.JUDGE_LINE - this.COLUMN_SIZE) {
          note.miss = true;
          this.processJudgement(note, "miss", note.column);
        }

        let spritesVisible = !note.finish;
        
        let freezeYPos = Math.floor(yPos);
        let freezeHeight = Math.floor(visibleHeight);
        
        // Position hold parts for rising mode
        note.holdParts.body.y = freezeYPos;
        note.holdParts.body.height = freezeHeight;
        note.holdParts.end.y = freezeYPos + freezeHeight;

        note.holdParts.body.visible = spritesVisible;
        note.holdParts.end.visible = spritesVisible;
        
        if (note.sprite) {
          note.sprite.visible = !isActive && spritesVisible;
        }

        const frame = isActive ? 1 : 0;
        const baseColor = note.type === "2" ? 0x00bb00 : 0x00eeee;
        const tint = note.miss ? this.INACTIVE_COLOR : baseColor;
        const alpha = note.miss ? 0.8 : 1;

        note.holdParts.body.frame = frame;
        note.holdParts.end.frame = frame;

        note.holdParts.body.tint = tint;
        note.holdParts.end.tint = tint;

        note.holdParts.body.alpha = alpha;
        note.holdParts.end.alpha = alpha;
      }

      // Show hold explosion when active
      if (holdData?.active && !note.finish && !note.miss) {
        this.toggleHoldExplosion(note.column, true);
      }

      if (note.type !== "M" && note.type !== "3") {
        if (!note.sprite) {
          note.sprite = this.notesGroup.getFirstDead() || (() => {
            const sprite = game.add.sprite(0, 0);
            this.notesGroup.add(sprite);
            return sprite;
          })();
          note.sprite.reset(0, -32);
          note.sprite.loadTexture("arrows");
          note.sprite.frame = this.getNoteFrame(note);
          note.sprite.anchor.set(0.5);
          note.sprite.angle = {
            0: 90,
            1: 0,
            2: 180,
            3: -90
          }[note.column];
        }
        note.sprite.x = x + this.COLUMN_SIZE / 2;
        note.sprite.y = yPos;
      }
    });
  }
  
  renderTimeLines() {
    if (!Account.settings.beatLines) return;

    const { beat } = this.scene.getCurrentTime();
    const beatsPerMeasure = Account.settings.beatsPerMeasure || 4;
    
    // Calculate visible beat range (8 measures ahead like reference code)
    const startMeasure = Math.floor(beat / beatsPerMeasure);
    const endMeasure = startMeasure + 8;
    
    const currentVisibleBeats = new Set();
    
    // Update or create measure lines and beat lines
    for (let measure = startMeasure; measure <= endMeasure; measure++) {
      const measureBeat = measure * beatsPerMeasure;
      
      // Draw measure line
      this.updateTimeLine(measureBeat, 0.9);
      currentVisibleBeats.add(measureBeat);
      
      // Draw beat lines within this measure
      for (let beatOffset = 1; beatOffset < beatsPerMeasure; beatOffset++) {
        const currentBeat = measureBeat + beatOffset;
        this.updateTimeLine(currentBeat, 0.35);
        currentVisibleBeats.add(currentBeat);
      }
    }
    
    // Kill lines that are no longer visible (past the screen)
    this.cleanupInvisibleLines(currentVisibleBeats);
    this.lastVisibleBeats = currentVisibleBeats;
  }
  
  updateTimeLine(targetBeat, alpha) {
    const { now, beat } = this.scene.getCurrentTime();
    
    let yPos;
    
    if (this.speedMod === 'C-MOD') {
      // C-MOD: Calculate position based on seconds
      const targetSec = this.beatToSec(targetBeat);
      const constantDeltaNote = targetSec - now;
      const pastSize = constantDeltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.NOTE_SPEED_MULTIPLIER;
      yPos = this.scrollDirection === 'falling' ?
        this.JUDGE_LINE - pastSize :
        this.JUDGE_LINE + pastSize;
    } else {
      // X-MOD: Calculate position based on beats
      const deltaBeat = targetBeat - beat;
      const pastSize = deltaBeat * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.NOTE_SPEED_MULTIPLIER;
      yPos = this.scrollDirection === 'falling' ?
        this.JUDGE_LINE - pastSize :
        this.JUDGE_LINE + pastSize;
    }
    
    // Lines should exist as long as they're on screen
    const isVisible = yPos >= -this.COLUMN_SIZE && yPos <= this.scene.game.height + this.COLUMN_SIZE;
    
    if (isVisible) {
      // Try to find existing line for this beat
      let line = this.findLineForBeat(targetBeat);
      
      if (!line) {
        // Create new line using pooling
        line = this.createLine(yPos, alpha);
        if (line) {
          line.targetBeat = targetBeat; // Store which beat this line represents
        }
      } else {
        // Update existing line position and alpha
        line.y = yPos;
        line.alpha = alpha;
        line.revive(); // Ensure it's active
      }
      
      return line;
    }
    
    return null;
  }

  findLineForBeat(targetBeat) {
    // Look through alive lines in the pool to find one for this beat
    const aliveLines = this.linesGroup.getAll('alive', true);
    
    for (let i = 0; i < aliveLines.length; i++) {
      const line = aliveLines[i];
      if (line.targetBeat === targetBeat) {
        return line;
      }
    }
    
    return null;
  }
  
  cleanupInvisibleLines(currentVisibleBeats) {
    const aliveLines = this.linesGroup.getAll('alive', true);
    
    for (let i = 0; i < aliveLines.length; i++) {
      const line = aliveLines[i];
      
      // Kill lines that are too far off screen (with some buffer)
      const buffer = this.COLUMN_SIZE * 2;
      const isOffScreen = line.y < -buffer || line.y > this.scene.game.height + buffer;
      
      if (isOffScreen) {
        line.kill();
      }
    }
  }
  
  update() {
    const { now, beat } = this.scene.getCurrentTime();

    // Input handling
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
        //receptor.animations.play(down ? "down" : "up");
      }
      receptor.frame = down ? 0 : 2;
    }

    // Update healh
    if (this.health != this.previousHealth) {
      this.previousHealth = this.health;
      game.add.tween(this.scene.lifebarMiddle).to({ width: (this.health / this.maxHealth) * 104 }, 100, Phaser.Easing.Quadratic.In, true);
      if (this.health <= 0) {
        this.gameOver = true;
        this.health = 0;
      }
      this.healthText.write(`${Math.floor(this.health / this.maxHealth * 100)}`);
    }
    this.scene.lifebarEnd.x = this.scene.lifebarMiddle.width;
    if (this.scene.acurracyBar) {
      if (this.accuracy <= 0) {
        this.scene.acurracyBar.visible = false;
      } else {
        this.scene.acurracyBar.visible = true;
      }
    }

    // Update active holds
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

  getLastStop(time, valueType) {
    return this.stops.find((e, i, a) => i + 1 == a.length || a[i + 1][valueType] >= time);
  }
  
  getLastBpm(time, valueType) {
    return this.bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1][valueType] >= time);
  }
  
  secToBeat(sec) {
    let b = this.getLastBpm(sec, "sec");
    let s = this.stops.filter(({ sec: i }) => i >= b.sec && i < sec).map(i => (i.sec + i.len > sec ? sec - i.sec : i.len));
    for (let i in s) sec -= s[i];
    return ((sec - b.sec) * b.bpm) / 60 + b.beat;
  }
  
  beatToSec(beat) {
    let b = this.getLastBpm(beat, "beat");
    let x = ((beat - b.beat) / b.bpm) * 60 + b.sec;
    let s = this.stops.filter(({ beat: i }) => i >= b.beat && i < beat).map(i => i.len);
    for (let i in s) x += s[i];
    return x;
  }
}
