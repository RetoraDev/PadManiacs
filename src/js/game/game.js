let game, gamepad, backgroundMusic, notifications, addonManager;

let Account = {
  ...DEFAULT_ACCOUNT,
  ...JSON.parse(localStorage.getItem("Account") || "{}")
};

const saveAccount = () => localStorage.setItem("Account", JSON.stringify(Account));

const bootGame = () => {
  if (game) game.destroy();
  game = new Phaser.Game({
    width: 192,
    height: 112,
    renderer: Account.settings.renderer,
    scaleMode: Phaser.ScaleManager.SHOW_ALL,
    crisp: Account.settings.pixelated,
    antialias: false,
    alignV: false,
    alignH: true,
    enableDebug: false,
    failIfMajorPerformanceCaveat: false,
    forceSetTimeOut: false,
    clearBeforeRender: true,
    forceSingleUpdate: false,
    maxPointers: 0,
    keyboard: true,
    mouse: false,
    mouseWheel: false,
    mspointer: false,
    multiTexture: false,
    pointerLock: false,
    preserveDrawingBuffer: false,
    roundPixels: true,
    touch: false,
    transparent: false,
    parent: "game",
    state: {
      create() {
        game.state.add('Boot', Boot);
        game.state.start('Boot');
        game.recorder = new ScreenRecorder(game);
      }
    },
    ...(window.GameConfig || {})
  });
};

window.onload = bootGame;

const addFpsText = () => {
  const text = new Text(190, 2, "");
  text.anchor.x = 1;
  game.time.events.loop(100, () => text.write(`${game.time.fps} (${game.renderer.renderSession.drawCount - 1})`));
};

const Audio = {
  pool: {},
  add: function (key, volume = 1, loop = false, reset = true) {
    if (!reset || !this.pool[key]) {
      this.pool[key] = game.add.audio(key);
    }
    return this.pool[key];
  },
  play: function (key, volume = 1, loop = false, reset = true) {
    if (game) {
      if (!reset || !this.pool[key]) {
        this.pool[key] = game.add.audio(key);
      }
      return this.pool[key].play(null, 0, volume, loop, reset);
    }
  },
  stop: function (key, fadeOut) {
    if (game) {
      const audio = this.pool[key];
      if (audio) {
        if (fadeOut) {
          audio.stop();
        } else {
          audio.fadeOut();
          audio.onFadeComplete.addOnce(() => audio.stop());
        }
      }
      return;
    }
  }
};

// To be removed from here
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
    this.COLUMN_SIZE = 16;
    this.COLUMN_SEPARATION = 4;
    this.INACTIVE_COLOR = 0x888888;
    
    this.speedMod = Account.settings.speedMod || 'X-MOD';
    
    // Note color option
    this.noteColorOption = Account.settings.noteColorOption || 'NOTE';
    
    // Define color constants for spritesheet frames
    const COLORS = {
      RED: 0,
      BLUE: 1,
      PURPLE: 2,
      YELLOW: 3,
      PINK: 4,
      ORANGE: 5,
      CYAN: 6,
      GREEN: 7,
      WHITE: 8,
      SKYBLUE: 9,
      OLIVE: 10,
      GRAY: 11
    };
    
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
        4: COLORS.YELLOW,
        8: COLORS.RED,
        12: COLORS.BLUE,
        16: COLORS.CYAN,
        24: COLORS.YELLOW,
        32: COLORS.RED,
        48: COLORS.BLUE,
        64: COLORS.CYAN,
        96: COLORS.YELLOW,
        128: COLORS.RED,
        192: COLORS.BLUE,
        default: COLORS.CYAN
      },
      FLAT: {
        4: COLORS.YELLOW,
        8: COLORS.YELLOW,
        12: COLORS.YELLOW,
        16: COLORS.YELLOW,
        24: COLORS.YELLOW,
        32: COLORS.YELLOW,
        48: COLORS.YELLOW,
        64: COLORS.YELLOW,
        96: COLORS.YELLOW,
        128: COLORS.YELLOW,
        192: COLORS.YELLOW,
        default: COLORS.YELLOW
      },
      RAINBOW: {
        4: COLORS.ORANGE,
        8: COLORS.BLUE,
        12: COLORS.PINK,
        16: COLORS.PINK,
        24: COLORS.BLUE,
        32: COLORS.ORANGE,
        48: COLORS.PINK,
        64: COLORS.BLUE,
        96: COLORS.PINK,
        128: COLORS.ORANGE,
        192: COLORS.BLUE,
        default: COLORS.PINK
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
      pastSize = constantDeltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.NOTE_SPEED_MULTIPLIER;
      
      if (note.beatLength) {
        const freezeDuration = note.secLength || (note.beatLength * 60 / this.getCurrentBPM());
        bodyHeight = Math.max(this.COLUMN_SIZE, freezeDuration * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.NOTE_SPEED_MULTIPLIER);
      }
    } else {
      const deltaNote = note.beat - beat;
      pastSize = deltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.NOTE_SPEED_MULTIPLIER;
      
      if (note.beatLength) {
        bodyHeight = Math.max(this.COLUMN_SIZE, note.beatLength * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.NOTE_SPEED_MULTIPLIER);
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
        if (this.options.enableGameplayLogic && this.scene.processJudgement) {
          this.scene.processJudgement(note, "miss", note.column);
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
        this.renderHoldNote(note, x, yPos, bodyHeight, now, beat, 'falling');
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
        if (this.options.enableGameplayLogic && this.scene.processJudgement) {
          this.scene.processJudgement(note, "miss", note.column);
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
        this.renderHoldNote(note, x, yPos, bodyHeight, now, beat, 'rising');
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
    } else if (typeof note.visibleHeight != "undefined") {
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
        if (this.options.enableGameplayLogic && this.scene.processJudgement) {
          this.scene.processJudgement(note, "miss", note.column);
        }
      } else if (direction === 'rising' && yPos < this.JUDGE_LINE - this.COLUMN_SIZE) {
        note.miss = true;
        if (this.options.enableGameplayLogic && this.scene.processJudgement) {
          this.scene.processJudgement(note, "miss", note.column);
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
      const pastSize = constantDeltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.NOTE_SPEED_MULTIPLIER;
      yPos = this.scrollDirection === 'falling' ?
        this.JUDGE_LINE - pastSize :
        this.JUDGE_LINE + pastSize;
    } else {
      const deltaBeat = targetBeat - beat;
      const pastSize = deltaBeat * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.NOTE_SPEED_MULTIPLIER;
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

class SMFile {
  static generateSMContent(songData) {
    let smContent = "";
    
    // Basic metadata
    smContent += `#TITLE:${songData.title || ""};\n`;
    smContent += `#SUBTITLE:${songData.subtitle || ""};\n`;
    smContent += `#ARTIST:${songData.artist || ""};\n`;
    smContent += `#TITLETRANSLIT:${songData.titleTranslit || ""};\n`;
    smContent += `#SUBTITLETRANSLIT:${songData.subtitleTranslit || ""};\n`;
    smContent += `#ARTISTTRANSLIT:${songData.artistTranslit || ""};\n`;
    smContent += `#GENRE:${songData.genre || ""};\n`;
    smContent += `#CREDIT:${songData.credit || ""};\n`;
    smContent += `#BANNER:${this.getFilename(songData.banner)};\n`;
    smContent += `#BACKGROUND:${this.getFilename(songData.background)};\n`;
    smContent += `#LYRICSPATH:${this.getFilename(songData.lyrics)};\n`;
    smContent += `#CDTITLE:${this.getFilename(songData.cdtitle)};\n`;
    smContent += `#MUSIC:${this.getFilename(songData.audio)};\n`;
    smContent += `#OFFSET:${songData.offset || 0};\n`;
    smContent += `#SAMPLESTART:${songData.sampleStart || 0};\n`;
    smContent += `#SAMPLELENGTH:${songData.sampleLength || 10};\n`;
    
    // BPM changes
    if (songData.bpmChanges && songData.bpmChanges.length > 0) {
      smContent += `#BPMS:${songData.bpmChanges.map(bpm => `${bpm.beat.toFixed(3)}=${bpm.bpm.toFixed(3)}`).join(",")};\n`;
    } else {
      smContent += `#BPMS:0.000=120.000;\n`;
    }
    
    // Stops
    if (songData.stops && songData.stops.length > 0) {
      smContent += `#STOPS:${songData.stops.map(stop => `${stop.beat.toFixed(3)}=${stop.len.toFixed(3)}`).join(",")};\n`;
    } else {
      smContent += `#STOPS:;\n`;
    }
    
    // BG changes
    if (songData.backgrounds && songData.backgrounds.length > 0) {
      const bgChanges = songData.backgrounds.map(bg => 
        `${bg.beat.toFixed(3)}=${bg.file || ""}=${bg.opacity || 1}=${bg.fadeIn || 0}=${bg.fadeOut || 0}=${bg.effect || 0}`
      ).join(",");
      smContent += `#BGCHANGES:${bgChanges};\n`;
    } else {
      smContent += `#BGCHANGES:;\n`;
    }
    
    // Notes for each difficulty
    if (songData.difficulties && songData.notes) {
      songData.difficulties.forEach(diff => {
        const diffKey = diff.type + diff.rating;
        const notes = songData.notes[diffKey];
        if (notes) {
          smContent += this.generateNotesSection(diff, notes);
        }
      });
    }
    
    return smContent;
  }
  
  static getFilename(url) {
    if (!url || url === "no-media") return "";
    // Extract filename from URL or path
    const parts = url.split(/[\\/]/);
    return parts[parts.length - 1] || "";
  }
  
  static generateNotesSection(difficulty, notes) {
    let notesContent = `#NOTES:\n`;
    notesContent += `     dance-single:\n`;
    notesContent += `     :\n`;
    notesContent += `     ${difficulty.type}:\n`;
    notesContent += `     ${difficulty.rating}:\n`;
    notesContent += `     0.000000:\n`; // Groove radar values, all zeros
    
    // Group notes by measure and find the highest resolution needed
    const measures = {};
    let highestResolution = 4; // Start with 4th notes
    
    notes.forEach(note => {
      const measure = Math.floor(note.beat / 4);
      if (!measures[measure]) measures[measure] = [];
      measures[measure].push(note);
      
      // Determine required resolution
      const fractionalBeat = note.beat - Math.floor(note.beat);
      if (fractionalBeat > 0) {
        const resolution = this.findRequiredResolution(fractionalBeat);
        highestResolution = Math.max(highestResolution, resolution);
      }
    });
    
    // Convert measures to SM format
    const measureNumbers = Object.keys(measures).map(Number).sort((a, b) => a - b);
    const rowsPerMeasure = highestResolution;
    
    measureNumbers.forEach(measureNum => {
      const measureNotes = measures[measureNum];
      const measureContent = this.convertMeasureToSM(measureNotes, measureNum, rowsPerMeasure);
      notesContent += measureContent;
    });
    
    notesContent += `;\n`;
    return notesContent;
  }
  
  static findRequiredResolution(fractionalBeat) {
    const resolutions = [4, 8, 12, 16, 24, 32, 48, 64, 96, 192];
    for (const resolution of resolutions) {
      const snapped = Math.round(fractionalBeat * resolution) / resolution;
      if (Math.abs(fractionalBeat - snapped) < 0.001) {
        return resolution;
      }
    }
    return 192; // Default to highest resolution
  }
  
  static convertMeasureToSM(notes, measureNum, rowsPerMeasure) {
    const measureContent = [];
    const measureStartBeat = measureNum * 4;
    const rowDuration = 4 / rowsPerMeasure;
    
    // Initialize empty rows
    for (let i = 0; i < rowsPerMeasure; i++) {
      measureContent.push("0000");
    }
    
    // Fill rows with notes
    notes.forEach(note => {
      const positionInMeasure = note.beat - measureStartBeat;
      const rowIndex = Math.round(positionInMeasure / rowDuration);
      
      if (rowIndex >= 0 && rowIndex < rowsPerMeasure) {
        let row = measureContent[rowIndex];
        const chars = row.split('');
        
        // Determine note character
        let noteChar = "0";
        switch (note.type) {
          case "1": noteChar = "1"; break; // Tap
          case "2": noteChar = "2"; break; // Hold start
          case "3": noteChar = "3"; break; // Hold end
          case "4": noteChar = "4"; break; // Roll start
          case "M": noteChar = "M"; break; // Mine
        }
        
        chars[note.column] = noteChar;
        measureContent[rowIndex] = chars.join('');
      }
    });
    
    return measureContent.join(",\n") + ",\n";
  }
  
  static parseSMContent(smContent, baseUrl = "") {
    // Clean and parse SM content
    let sm = smContent
      .replace(/\/\/.*/g, "")
      .replace(/\r?\n|\r/g, "")
      .split(";");
    
    for (let i = sm.length - 1; i >= 0; i -= 1) {
      if (sm[i]) {
        sm[i] = sm[i].split(/:/g);
        for (let p in sm[i]) sm[i][p] = sm[i][p].trim();
      } else sm.splice(i, 1);
    }

    let steps = {};
    const out = {
      bpmChanges: [],
      stops: [],
      notes: {},
      backgrounds: [],
      banner: "no-media",
      difficulties: [],
      background: "no-media",
      cdtitle: null,
      audioUrl: null,
      videoUrl: null,
      sampleStart: 0,
      sampleLength: 10,
      baseUrl: baseUrl
    };

    for (let i in sm) {
      let p = sm[i];
      switch (p[0]) {
        case "#TITLE":
          out.title = p[1];
          break;
        case "#SUBTITLE":
          out.subtitle = p[1];
          break;
        case "#ARTIST":
          out.artist = p[1];
          break;
        case "#TITLETRANSLIT":
          out.titleTranslit = p[1];
          break;
        case "#SUBTITLETRANSLIT":
          out.subtitleTranslit = p[1];
          break;
        case "#ARTISTTRANSLIT":
          out.artistTranslit = p[1];
          break;
        case "#GENRE":
          out.genre = p[1];
          break;
        case "#CREDIT":
          out.credit = p[1];
          break;
        case "#BANNER":
          if (p[1]) out.banner = this.resolveFileUrl(p[1], baseUrl);
          break;
        case "#BACKGROUND":
          if (p[1]) out.background = this.resolveFileUrl(p[1], baseUrl);
          break;
        case "#MUSIC":
          if (p[1]) {
            out.audio = p[1];
            out.audioUrl = this.resolveFileUrl(p[1], baseUrl);
          }
          break;
        case "#OFFSET":
          out.offset = Number(p[1]);
          break;
        case "#BPMS": {
          let bx = p[1].split(",");
          bx = bx.filter(i => /=/.exec(i));
          for (let i in bx) {
            let v = bx[i].split("=");
            bx[i] = { beat: Number(v[0]), bpm: Number(v[1]) };
          }
          out.bpmChanges = out.bpmChanges.concat(bx);
          break;
        }
        case "#STOPS": {
          let bx = p[1].split(",");
          bx = bx.filter(i => i.includes("="));
          for (let i in bx) {
            let v = bx[i].split("=");
            bx[i] = { beat: Number(v[0]), len: Number(v[1]) };
          }
          out.stops = out.stops.concat(bx);
          break;
        }
        case "#NOTES":
          steps[p[3] + p[4]] = p[6].split(",");
          out.difficulties.push({
            type: p[3],
            rating: p[4]
          });
          break;
      }
    }

    // Process notes from steps
    for (let key in steps) {
      out.notes[key] = this.parseNotes(steps[key], out.bpmChanges, out.stops);
    }

    return out;
  }
  
  static resolveFileUrl(filename, baseUrl) {
    if (!filename) return null;
    if (filename.startsWith('http') || filename.startsWith('//')) {
      return filename;
    }
    return baseUrl + filename;
  }
  
  static parseNotes(measureData, bpmChanges, stops) {
    const notes = [];
    let measureIndex = 0;
    
    // Helper function to convert measure+position to beat
    const getBeat = (measure, position, totalRows) => {
      return measure * 4 + (position / totalRows) * 4;
    };
    
    // Helper function to convert beat to seconds
    const beatToSec = (beat) => {
      const parser = new LocalSMParser();
      return parser.beatToSec(bpmChanges, stops, beat);
    };
    
    for (let m in measureData) {
      const measure = measureData[m].trim();
      if (!measure) continue;
      
      // Determine rows per measure based on note length
      const totalRows = measure.length / 4;
      
      for (let row = 0; row < totalRows; row++) {
        const rowData = measure.substr(row * 4, 4);
        
        for (let col = 0; col < 4; col++) {
          const noteChar = rowData[col];
          if (noteChar !== '0') {
            const beat = getBeat(measureIndex, row, totalRows);
            const note = {
              type: noteChar,
              beat: beat,
              sec: beatToSec(beat),
              column: col
            };
            
            // Handle hold notes
            if (noteChar === '2' || noteChar === '4') {
              // Find the corresponding end note (3)
              let endFound = false;
              for (let futureRow = row + 1; futureRow < totalRows && !endFound; futureRow++) {
                const futureChar = measure.substr(futureRow * 4 + col, 1);
                if (futureChar === '3') {
                  const endBeat = getBeat(measureIndex, futureRow, totalRows);
                  note.beatLength = endBeat - beat;
                  note.secLength = beatToSec(endBeat) - beatToSec(beat);
                  note.beatEnd = endBeat;
                  note.secEnd = beatToSec(endBeat);
                  endFound = true;
                }
              }
            }
            
            notes.push(note);
          }
        }
      }
      
      measureIndex++;
    }
    
    return notes;
  }
}
