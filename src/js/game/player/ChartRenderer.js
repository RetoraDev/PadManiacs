class ChartRenderer {
  constructor(scene, song, difficultyIndex, options = {}) {
    this.scene = scene;
    this.song = song;
    this.difficultyIndex = difficultyIndex;
    this.chart = song.chart;
    this.difficulty = this.chart.difficulties[difficultyIndex];
    this.notes = this.chart.notes[this.difficulty.type + this.difficulty.rating];
    this.bpmChanges = this.chart.bpmChanges;
    this.stops = this.chart.stops;
    
    this.options = {
      enableGameplayLogic: true,
      enableJudgement: true,
      enableInput: true,
      enableHealth: true,
      enableMissChecking: true,
      ...options
    };

    this.scrollDirection = Account.settings.scrollDirection || 'falling';

    // Visual constants
    this.VERTICAL_SEPARATION = 1.25;
    this.SCREEN_CONSTANT = Account.settings.speedMod === "C-MOD" ? 240 / 60 : 1;
    this.NOTE_SPEED_MULTIPLIER = Account.settings.noteSpeedMult + this.SCREEN_CONSTANT;
    this.JUDGE_LINE = this.scrollDirection === 'falling' ? 90 : 30;
    this.DIRECTION = this.scrollDirection === 'falling' ? -1 : 1;
    this.COLUMN_SIZE = 16;
    this.COLUMN_SEPARATION = 4;
    this.INACTIVE_COLOR = 0x888888;
    
    this.noteSpeedMultiplier = this.NOTE_SPEED_MULTIPLIER;
    
    this.speedMod = Account.settings.speedMod || 'X-MOD';
    
    // Note color option (default to NOTE)
    this.noteColorOption = Account.settings.noteColorOption || 'NOTE';
    
    // Define color constants for spritesheet frames
    const COLORS = {
      // This is how spritesheet frames are colored
      // They are ordered like NOTE color pattern in StepMania
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

    // Groups for pooling
    this.linesGroup = new Phaser.SpriteBatch(game);
    this.receptorsGroup = new Phaser.SpriteBatch(game);
    this.freezeBodyGroup = new Phaser.Group(game);
    this.freezeEndGroup = new Phaser.Group(game); 
    this.notesGroup = new Phaser.SpriteBatch(game);
    this.minesGroup = new Phaser.Group(game);
    this.explosionsGroup = new Phaser.SpriteBatch(game);
    
    this.receptors = [];
    this.initialize();
  }

  initialize() {
    const leftOffset = this.calculateLeftOffset();

    // Create receptors
    for (let i = 0; i < 4; i++) {
      const receptor = game.add.sprite(
        leftOffset + i * (this.COLUMN_SIZE + this.COLUMN_SEPARATION) + this.COLUMN_SIZE / 2, 
        this.JUDGE_LINE, 
        "receptor", 
        2
      );
      receptor.anchor.set(0.5);
      
      receptor.angle = {
        0: 90,
        1: 0,
        2: 180,
        3: -90
      }[i];
      
      if (this.options.enableInput) {
        receptor.inputEnabled = true;
        receptor.down = false;
      }

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
  }

  calculateLeftOffset() {
    const totalWidth = 4 * this.COLUMN_SIZE + 3 * this.COLUMN_SEPARATION;
    return (192 - totalWidth) / 2;
  }

  getNoteFrame(note) {
    const beat = note.beat;
    const colorMapping = this.colorMappings[this.noteColorOption];
    
    const divisions = Object.keys(colorMapping)
      .filter(key => key !== 'default')
      .map(Number)
      .sort((a, b) => a - b);
    
    for (const division of divisions) {
      if (this.isBeatDivision(beat, division)) {
        return colorMapping[division];
      }
    }
    
    return colorMapping.default;
  }

  isBeatDivision(beat, division) {
    const epsilon = 0.0001;
    const remainder = (beat * division) % 4;
    return Math.abs(remainder) < epsilon || Math.abs(remainder - 4) < epsilon;
  }

  calculateVerticalPosition(note, now, beat) {
    let pastSize;
    let bodyHeight = 0;
    
    if (this.speedMod === 'C-MOD') {
      const constantDeltaNote = note.sec - now;
      pastSize = constantDeltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.noteSpeedMultiplier;
      
      if (note.beatLength) {
        const freezeDuration = note.secLength || (note.beatLength * 60 / this.getCurrentBPM());
        bodyHeight = Math.max(this.COLUMN_SIZE, freezeDuration * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.noteSpeedMultiplier);
      }
    } else {
      const deltaNote = note.beat - beat;
      pastSize = deltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.noteSpeedMultiplier;
      
      if (note.beatLength) {
        bodyHeight = Math.max(this.COLUMN_SIZE, note.beatLength * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.noteSpeedMultiplier);
      }
    }
    
    const yPos = this.scrollDirection === 'falling' ?
      this.JUDGE_LINE - pastSize :
      this.JUDGE_LINE + pastSize;
    
    return { pastSize, bodyHeight, yPos };
  }

  getCurrentBPM(beat = 0) {
    const bpmChange = this.bpmChanges.find((bpm, index, array) => {
      return index === array.length - 1 || array[index + 1].beat > beat;
    });
    return bpmChange ? bpmChange.bpm : 120;
  }

  getLastBpm(time, valueType) {
    return this.bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1][valueType] >= time);
  }

  beatToSec(beat) {
    let b = this.getLastBpm(beat, "beat");
    let x = ((beat - b.beat) / b.bpm) * 60 + b.sec;
    let s = this.stops.filter(({ beat: i }) => i >= b.beat && i < beat).map(i => i.len);
    for (let i in s) x += s[i];
    return x;
  }

  secToBeat(sec) {
    let b = this.getLastBpm(sec, "sec");
    let s = this.stops.filter(({ sec: i }) => i >= b.sec && i < sec).map(i => (i.sec + i.len > sec ? sec - i.sec : i.len));
    for (let i in s) sec -= s[i];
    return ((sec - b.sec) * b.bpm) / 60 + b.beat;
  }

  render(now, beat) {
    if (this.scrollDirection === 'falling') {
      this.renderFalling(now, beat);
    } else {
      this.renderRising(now, beat);
    }
    
    if (Account.settings.beatLines) {
      this.renderTimeLines(now, beat);
    }
  }

  renderFalling(now, beat) {
    const leftOffset = this.calculateLeftOffset();

    this.notes.forEach(note => {
      let { pastSize, bodyHeight, yPos } = this.calculateVerticalPosition(note, now, beat);
      
      const x = leftOffset + note.column * (this.COLUMN_SIZE + this.COLUMN_SEPARATION);

      // Miss checking (only in gameplay)
      if (this.options.enableMissChecking && note.type !== "M" && note.type != "2" && note.type != "4" && !note.hit && !note.miss && yPos > game.height) {
        note.miss = true;
        if (this.options.enableGameplayLogic && this.scene.player.processJudgement) {
          this.scene.player.processJudgement(note, "miss", note.column);
        }
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
        yPos = this.renderHoldNote(note, x, yPos, bodyHeight, now, beat, 'falling');
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

  renderRising(now, beat) {
    const leftOffset = this.calculateLeftOffset();
    
    this.notes.forEach(note => {
      let { pastSize, bodyHeight, yPos } = this.calculateVerticalPosition(note, now, beat);
      
      const x = leftOffset + note.column * (this.COLUMN_SIZE + this.COLUMN_SEPARATION);
      
      // Miss checking (only in gameplay)
      if (this.options.enableMissChecking && note.type !== "M" && note.type != "2" && note.type != "4" && !note.hit && !note.miss && yPos < -this.COLUMN_SIZE) {
        note.miss = true;
        if (this.options.enableGameplayLogic && this.scene.player.processJudgement) {
          this.scene.player.processJudgement(note, "miss", note.column);
        }
      }

      // Remove off-screen notes
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
        yPos = this.renderHoldNote(note, x, yPos, bodyHeight, now, beat, 'rising');
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

  renderHoldNote(note, x, yPos, bodyHeight, now, beat, direction) {
    if (!note.holdParts) {
      const prefix = note.type === "2" ? "hold" : "roll";
      
      const getBody = () => {
        const sprite = this.freezeBodyGroup.getFirstDead() || (() => {
          const child = game.add.tileSprite(-64, -64, this.COLUMN_SIZE, 0, `${prefix}_body`);
          if (direction === 'rising') {
            child.scale.y = -1;
            child.anchor.y = 1;
          } else {
            child.anchor.y = 1;
          }
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
          if (direction === 'rising') {
            child.scale.y = -1;
            child.anchor.y = 1;
          } else {
            child.anchor.y = 1;
          }
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
    
    const isActive = this.options.enableGameplayLogic && !note.finish && !note.miss && this.scene.activeHolds && this.scene.activeHolds[note.column]?.note === note && this.scene.activeHolds[note.column].active;

    let visibleHeightIsSet = typeof note.visibleHeight != "undefined";
    let visibleHeight = visibleHeightIsSet ? note.visibleHeight : bodyHeight;
    
    if (visibleHeight < 0) visibleHeight = 1;

    if (isActive && this.options.enableGameplayLogic) {
      if (direction === 'falling') {
        const holdBottomY = yPos - bodyHeight;
        const judgeLineY = this.JUDGE_LINE;
        note.visibleHeight = Math.max(0, judgeLineY - holdBottomY);
        if (yPos > judgeLineY - this.COLUMN_SIZE / 2) yPos = judgeLineY;
      } else {
        const holdTopY = yPos + bodyHeight;
        const judgeLineY = this.JUDGE_LINE;
        note.visibleHeight = Math.max(0, holdTopY - judgeLineY);
        if (yPos < judgeLineY + this.COLUMN_SIZE / 2) yPos = judgeLineY;
      }
      note.active = true;
    } else if (this.options.enableGameplayLogic && typeof note.visibleHeight != "undefined") {
      if (direction === 'falling') {
        yPos -= bodyHeight - note.visibleHeight;
      } else {
        yPos += bodyHeight - note.visibleHeight;
      }
      note.active = false;
    }
    
    // Miss checking for holds
    if (this.options.enableMissChecking && !note.miss && !note.holdActive) {
      if (direction === 'falling' && yPos > this.JUDGE_LINE + this.COLUMN_SIZE) {
        note.miss = true;
        if (this.options.enableGameplayLogic && this.scene.player.processJudgement) {
          this.scene.player.processJudgement(note, "miss", note.column);
        }
      } else if (direction === 'rising' && yPos < this.JUDGE_LINE - this.COLUMN_SIZE) {
        note.miss = true;
        if (this.options.enableGameplayLogic && this.scene.player.processJudgement) {
          this.scene.player.processJudgement(note, "miss", note.column);
        }
      }
    }

    let spritesVisible = !note.finish;
    
    let freezeYPos = Math.floor(yPos);
    let freezeHeight = Math.floor(visibleHeight);
    
    if (direction === 'falling') {
      note.holdParts.body.y = freezeYPos;
      note.holdParts.body.height = freezeHeight;
      note.holdParts.end.y = freezeYPos - freezeHeight;
    } else {
      note.holdParts.body.y = freezeYPos;
      note.holdParts.body.height = freezeHeight;
      note.holdParts.end.y = freezeYPos + freezeHeight;
    }

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
    
    return yPos;
  }

  renderTimeLines(now, beat) {
    if (!Account.settings.beatLines) return;

    const beatsPerMeasure = Account.settings.beatsPerMeasure || 4;
    const startMeasure = Math.floor(beat / beatsPerMeasure);
    const endMeasure = startMeasure + 8;
    
    const currentVisibleBeats = new Set();
    
    for (let measure = startMeasure; measure <= endMeasure; measure++) {
      const measureBeat = measure * beatsPerMeasure;
      this.updateTimeLine(measureBeat, 0.9, now, beat);
      currentVisibleBeats.add(measureBeat);
      
      for (let beatOffset = 1; beatOffset < beatsPerMeasure; beatOffset++) {
        const currentBeat = measureBeat + beatOffset;
        this.updateTimeLine(currentBeat, 0.35, now, beat);
        currentVisibleBeats.add(currentBeat);
      }
    }
    
    this.cleanupInvisibleLines(currentVisibleBeats);
  }

  updateTimeLine(targetBeat, alpha, now, beat) {
    let yPos;
    
    if (this.speedMod === 'C-MOD') {
      const targetSec = this.beatToSec(targetBeat);
      const constantDeltaNote = targetSec - now;
      const pastSize = constantDeltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.noteSpeedMultiplier;
      yPos = this.scrollDirection === 'falling' ?
        this.JUDGE_LINE - pastSize :
        this.JUDGE_LINE + pastSize;
    } else {
      const deltaBeat = targetBeat - beat;
      const pastSize = deltaBeat * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.noteSpeedMultiplier;
      yPos = this.scrollDirection === 'falling' ?
        this.JUDGE_LINE - pastSize :
        this.JUDGE_LINE + pastSize;
    }
    
    const isVisible = yPos >= -this.COLUMN_SIZE && yPos <= game.height + this.COLUMN_SIZE;
    
    if (isVisible) {
      let line = this.findLineForBeat(targetBeat);
      
      if (!line) {
        line = this.createLine(yPos, alpha);
        if (line) {
          line.targetBeat = targetBeat;
        }
      } else {
        line.y = yPos;
        line.alpha = alpha;
        line.revive();
      }
      
      return line;
    }
    
    return null;
  }

  findLineForBeat(targetBeat) {
    const aliveLines = this.linesGroup.getAll('alive', true);
    
    for (let i = 0; i < aliveLines.length; i++) {
      const line = aliveLines[i];
      if (line.targetBeat === targetBeat) {
        return line;
      }
    }
    
    return null;
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
  
  toggleHoldExplosion(column, visible) {
    const explosion = this.receptors[column].explosion;
    explosion.visible = visible;
    if (visible) {
      explosion.bringToTop();
    }
  }

  cleanupInvisibleLines(currentVisibleBeats) {
    const aliveLines = this.linesGroup.getAll('alive', true);
    
    for (let i = 0; i < aliveLines.length; i++) {
      const line = aliveLines[i];
      const buffer = this.COLUMN_SIZE * 2;
      const isOffScreen = line.y < -buffer || line.y > game.height + buffer;
      
      if (isOffScreen) {
        line.kill();
      }
    }
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

  destroy() {
    this.linesGroup.destroy(true);
    this.receptorsGroup.destroy(true);
    this.freezeBodyGroup.destroy(true);
    this.freezeEndGroup.destroy(true);
    this.notesGroup.destroy(true);
    this.minesGroup.destroy(true);
    this.explosionsGroup.destroy(true);
  }
}
