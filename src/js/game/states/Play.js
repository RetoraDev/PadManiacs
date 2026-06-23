class Play {
  init(song, difficultyIndex, playtestMode, autoplay) {
    this.originalSong = song;
    this.song = structuredClone(song);
    this.difficultyIndex = difficultyIndex || song.difficultyIndex;
    this.player = null;
    this.backgroundQueue = [];
    this.preloadedBackgroundElements = {};
    this.currentBackground = null;
    this.isPaused = false;
    this.pauseStartTime = 0;
    this.totalPausedDuration = 0;
    this.pendingSongStart = false;
    this.audioEndListener = null;
    this.started = false;
    this.startTime = 0;
    this.autoplay = typeof autoplay !== "undefined" ? autoplay : Account.settings.autoplay;
    this.userOffset = Account.settings.userOffset;
    this.lastVideoUpdateTime = 0;
    this.lyrics = null;
    this.hasLyricsFile = this.song.chart.lyricsContent ? true : false;
    this.visualizerType = Account.settings.visualizer || 'NONE';
    this.lastVisualizerUpdateTime = 0;
    this.metronome = null;
    this.gameRecorder = null;
    this.playtestMode = playtestMode;
    this.fullComboAnimationStarted = false;
    this.fullComboAnimationEnded = false;
    this.shootingDown = false;
    
    // Initialize character system
    this.characterManager = new CharacterManager();
    this.currentCharacter = this.characterManager.getCurrentCharacter();
    this.skillSystem = new CharacterSkillSystem(this, this.currentCharacter);
    
    // Save last song to Account
    Account.lastSong = {
      url: this.song.chart.audioUrl,
      title: this.song.chart.title,
      artist: this.song.chart.artist,
      sampleStart: this.song.chart.sampleStart || 0,
      isExternal: this.song.chart.files !== undefined, // Flag for external songs
      score: 0,
      accuracy: 0,
      maxCombo: 0,
      judgements: {
        marvelous: 0,
        perfect: 0,
        great: 0,
        good: 0,
        boo: 0,
        miss: 0
      },
      totalNotes: 0,
      skillsUsed: 0,
      difficultyRating: this.song.chart.difficulties[this.difficultyIndex].rating,
      complete: false
    };
    saveAccount();
    
    // For debugging
    window.p = this;
    
    // Game constants
    this.JUDGE_WINDOWS = JUDGE_WINDOWS;
    
    this.SCORE_VALUES = SCORE_VALUES;
    
    this.FIXED_DELAY = 2000; 
  }
  
  create() {
    // Ensure background music is stopped during gameplay
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    game.camera.fadeIn(0x000000);
    
    // Create background
    this.backgroundLayer = game.add.group();
    this.backgroundSprite = new CanvasBackground(0, 0);
    this.backgroundSprite.alpha = 1;
    
    this.visibilityChangeListener = () => {
      if (document.hidden) {
        if (!this.isPaused) this.pause();
        this.audio.volume = 0;
      } else {
        this.audio.volume = Account.settings.volume / 100;
      }
    };
    
    window.addEventListener('visibilitychange', this.visibilityChangeListener);
    
    this.createHud();
    
    this.applyChartModifiers();
    
    this.setupPlayer();
    
    this.setupLyrics();
    
    this.metronome = new Metronome(this);
    
    this.initialSetup();
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  async initialSetup() {
    const dots = new LoadingDots();
    dots.x -= 4;
    dots.y -= 8;
    this.song.chart.backgrounds.forEach(async bg => {
      if (bg.file !== "-nosongbg-" && !this.preloadedBackgroundElements[bg.file]) {
        const element = await this.preloadBackground(bg);
        this.preloadedBackgroundElements[bg.file] = element;
      }
    }); 
    await this.setupAudio();
    dots.destroy();
    this.songStart();
  }
  
  applyChartModifiers() {
    const modifiers = Account.settings.chartModifiers || {};
    
    const order = ['NO MINES', 'NO FREEZES', 'NO HANDS', 'NO JUMPS', 'MIRRORED', 'RANDOMIZED'];
    
    const activeModifiers = order.filter(key => modifiers[key] === true);
    
    if (activeModifiers.length === 0) return;
    
    const difficulty = this.song.chart.difficulties[this.song.difficultyIndex];
    const noteKey = difficulty.type + difficulty.rating;
    let notes = this.song.chart.notes[noteKey];
    if (!notes) return;
    
    notes = JSON.parse(JSON.stringify(notes));
    
    for (const modifier of activeModifiers) {
      if (modifier === 'NO MINES') {
        notes = notes.filter(n => n.type !== 'M');
      }
      else if (modifier === 'NO FREEZES') {
        // Convertir holds (2) y rolls (4) en notas normales (1)
        // Eliminar las colas (3)
        for (let i = 0; i < notes.length; i++) {
          const note = notes[i];
          if (note.type === '2' || note.type === '4') {
            note.type = '1';
            delete note.beatLength;
            delete note.secLength;
            delete note.beatEnd;
            delete note.secEnd;
          } else if (note.type === '3') {
            notes.splice(i, 1);
            i--;
          }
        }
      }
      else if (modifier === 'NO HANDS') {
        const beats = new Map();
        for (const note of notes) {
          const beatKey = note.beat.toFixed(6);
          if (!beats.has(beatKey)) beats.set(beatKey, []);
          beats.get(beatKey).push(note);
        }
        const newNotes = [];
        for (const [beatKey, beatNotes] of beats) {
          if (beatNotes.length >= 3) {
            const shuffled = [...beatNotes];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            newNotes.push(shuffled[0], shuffled[1]);
          } else {
            newNotes.push(...beatNotes);
          }
        }
        notes = newNotes;
      }
      else if (modifier === 'NO JUMPS') {
        const beats = new Map();
        for (const note of notes) {
          const beatKey = note.beat.toFixed(6);
          if (!beats.has(beatKey)) beats.set(beatKey, []);
          beats.get(beatKey).push(note);
        }
        const newNotes = [];
        for (const [beatKey, beatNotes] of beats) {
          if (beatNotes.length >= 2) {
            const randomIndex = Math.floor(Math.random() * beatNotes.length);
            newNotes.push(beatNotes[randomIndex]);
          } else {
            newNotes.push(...beatNotes);
          }
        }
        notes = newNotes;
      }
      else if (modifier === 'MIRRORED') {
        for (const note of notes) {
          note.column = 3 - note.column;
        }
      }
      else if (modifier === 'RANDOMIZED') {
        const beats = new Map();
        for (const note of notes) {
          const beatKey = note.beat.toFixed(6);
          if (!beats.has(beatKey)) beats.set(beatKey, []);
          beats.get(beatKey).push(note);
        }
        for (const [beatKey, beatNotes] of beats) {
          if (beatNotes.length > 1) {
            const columns = beatNotes.map(n => n.column);
            for (let i = columns.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [columns[i], columns[j]] = [columns[j], columns[i]];
            }
            for (let i = 0; i < beatNotes.length; i++) {
              beatNotes[i].column = columns[i];
            }
          }
        }
      }
    }
    
    notes.sort((a, b) => a.beat - b.beat);
    this.song.chart.notes[noteKey] = notes;
    
    if (this.player && this.player.renderer) {
      this.player.renderer.notes = notes;
      if (this.player.renderer.notesGroup) {
        this.player.renderer.notesGroup.removeAll(true);
      }
      if (this.player.renderer.minesGroup) {
        this.player.renderer.minesGroup.removeAll(true);
      }
      if (this.player.renderer.freezeBodyGroup) {
        this.player.renderer.freezeBodyGroup.removeAll(true);
      }
      if (this.player.renderer.freezeEndGroup) {
        this.player.renderer.freezeEndGroup.removeAll(true);
      }
    }
  }
  
  setupAudio() {
    return new Promise(resolve => {
      // Create audio element and wait for it to load
      this.audio = this.audio || document.createElement("audio");
      this.audio.volume = Account.settings.volume / 100;
      this.audio.currentTime = 0;
      this.audio.src = this.song.chart.audioUrl;
      this.audio.oncanplaythrough = () => {
        resolve();
        this.audio.oncanplaythrough = null;
      };
      this.audio.onerror = () => {
        resolve('error');
        this.audio.onerror = null;
      };
      
      // Create visualizer after audio initialized since some visualizers spect the audio to exist
      this.createVisualizer();
      
      // Setup song temperature change detection
      this.setupSongTemperature();
    });
  }
  
  preloadBackground(background) {
    return new Promise((resolve, reject) => {
      const { url, type } = background;
      const element = type == "video" ? document.createElement("video") : document.createElement("img");
      
      if (!url) {
        // Flag error if undefined or null url
        element.__errored = true;
        element.__type = type;
        element.__url = "";
        resolve(element);
        return;
      }
      
      // Add error flag property
      element.__errored = false;
      element.__type = type;
      element.__url = url;
      
      if (type == "image") {
        element.onload = () => resolve(element);
        element.onerror = () => {
          console.warn(`Failed to load background image: ${url}`);
          element.__errored = true;
          resolve(element);
        };
      } else {
        element.muted = true;
        element.volume = 0;
        element.loop = true;
        element.autoplay = false;
        element.addEventListener("canplaythrough", () => resolve(element));
        element.onerror = () => {
          console.warn(`Failed to load background video: ${url}`);
          element.__errored = true;
          resolve(element);
        };
      }
      
      element.src = url;
    });
  }
  
  createHud() {
    this.backgroundGradient = new BackgroundGradient(0, 0.4, 5000);

    this.hud = game.add.sprite(0, 0);
    
    this.hudFlashShape = game.add.sprite(game.width / 2, game.height / 2, 'ui_hud_flash_shape');
    this.hudFlashShape.anchor.set(0.5);
    this.hudFlashShape.alpha = 0;
    this.hud.addChild(this.hudFlashShape);
    
    this.hudTop = game.add.sprite(0, -40, 'ui_hud_background_top');
    this.hudTop.alpha = 0;
    this.hud.addChild(this.hudTop);
    
    this.hudBottom = game.add.sprite(0, 40, 'ui_hud_background_bottom');
    this.hudBottom.alpha = 0;
    this.hud.addChild(this.hudBottom);
    
    this.overHud = game.add.sprite(0, 0);
    
    const difficulty = this.song.chart.difficulties[this.song.difficultyIndex];
    
    this.difficultyBanner = game.add.sprite(0, 0, "ui_difficulty_banner", 0);
    this.difficultyBanner.tint = this.getDifficultyColor(difficulty.rating);
    this.hudTop.addChild(this.difficultyBanner);
    
    this.difficultyTypeText = new Text(5, 1, difficulty.type.substr(0, 9), FONTS.default, this.difficultyBanner);
    this.difficultyTypeText.alpha = 0.7;
    game.add.tween(this.difficultyTypeText).to({ alpha: 1 }, 400, "Linear", true).repeat(-1).yoyo(true);
    
    const title = this.song.chart.titleTranslit || this.song.chart.title;
    
    this.songTitleText = new Text(41, 1, "", null, this.hudTop);
    this.songTitleText.write(title, 41);
    
    this.playerName = new Text(5, 9, "", FONTS.tiny_shaded, this.hudTop);
    this.playerName.write(this.currentCharacter ? this.currentCharacter.name : "NONE", 8);
    
    this.playerName.tint = this.currentCharacter ? Math.max(0x787878, this.currentCharacter.appearance.tints.hair) : 0xffffff;
    
    this.skillBar = new SkillBar(6, 16);
    this.hudTop.addChild(this.skillBar);
    
    if (!this.currentCharacter) this.skillBar.visible = false;
    
    this.scoreText = new Text(35, 14, "0".repeat(9), FONTS.tiny_number, this.hudTop);
    
    this.lifebarStart = game.add.sprite(37, 9, "ui_lifebar", 0);
    this.lifebarMiddle = game.add.sprite(1, 0, "ui_lifebar", 1);
    this.lifebarMiddle.width = 145;
    this.lifebarEnd = game.add.sprite(146, 0, "ui_lifebar", 2);
    
    this.hudTop.addChild(this.lifebarStart);
    this.lifebarStart.addChild(this.lifebarMiddle);
    this.lifebarStart.addChild(this.lifebarEnd);
    
    // Autoplay text
    this.autoplayText = new Text(4, 120, this.autoplay ? "AUTOPLAY" : "", FONTS.tiny_stroke, this.hud);
    
    this.healthText = new Text(185, 9, "100", FONTS.tiny_number, this.hudTop);
    
    this.judgementText = game.add.sprite(game.width / 2, 75, "judgement", 0);
    this.judgementText.alpha = 0;
    this.judgementText.anchor.set(0.5);
    
    this.accuracyBar = game.add.sprite(51, 136, "ui_accuracy_bar");
    this.hudBottom.addChild(this.accuracyBar);
    
    this.comboText = new Text(240 - 1, 140 - 6, "0", FONTS.biscuitlocker_combo, this.hudBottom);
    this.comboText.anchor.set(1);
  }
  
  createVisualizer(visualizerX = 2, visualizerY = 131, visualizerWidth = 46, visualizerHeight = 7) {
    // Remove existing visualizer
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }

    // Create new visualizer based on setting
    switch (this.visualizerType) {
      case 'ACCURACY':
        this.visualizer = new AccuracyVisualizer(this, visualizerX, visualizerY, visualizerWidth, visualizerHeight);
        break;
      case 'AUDIO':
        this.visualizer = new AudioVisualizer(this, visualizerX, visualizerY, visualizerWidth, visualizerHeight);
        break;
      case 'BPM':
        this.visualizer = new BPMVisualizer(this, visualizerX, visualizerY, visualizerWidth, visualizerHeight);
        break;
      default:
        this.visualizer = null; // NONE
    }
    
    if (this.visualizer) {
      this.hudBottom.addChild(this.visualizer.graphics);
    }
  }
  
  setupSongTemperature() {
    const meter = new AudioTemperatureMeter(this, this.audio, this.song.chart);
    
    meter.onHighTemperature.add(() => {
      this.startHudFlash();
    });
    
    meter.onLowTemperature.add(() => {
      this.stopHudFlash();
    });
    
    this.temperature = meter;
  }
  
  setupPlayer() {
    this.player = new Player(this, "center");
  }
  
  setupLyrics() {
    if (this.hasLyricsFile) {
      const lrcContent = this.song.chart.lyricsContent; 
      
      const lyricsPosition = Account.settings.lyricsPosition ? 40 : 90;
      
      // Create lyrics text element
      this.lyricsText = new Text(game.width / 2, lyricsPosition, "", FONTS.default_stroke);
      this.lyricsText.anchor.set(0.5);
      
      // Initialize lyrics system
      this.lyrics = new Lyrics({
        textElement: this.lyricsText,
        maxLineLength: 25,
        lrc: Account.settings.enableLyrics ? lrcContent : "",
      });
    }
  }
  
  getDifficultyColor(value) {
    const max = 11; // The actual maximum considered difficulty
    
    // Ensure the value is within the range [0, max]
    value = Math.max(0, Math.min(max, value));

    // Extract the RGB components of the start and end colors
    var startColor = { r: 25, g: 210, b: 25 };
    var endColor = { r: 210, g: 0, b: 0 };

    // Interpolate between the start and end colors
    var r = Math.floor(startColor.r + (endColor.r - startColor.r) * (value / max));
    var g = Math.floor(startColor.g + (endColor.g - startColor.g) * (value / max));
    var b = Math.floor(startColor.b + (endColor.b - startColor.b) * (value / max));

    // Combine the RGB components into a single tint value
    return (r << 16) | (g << 8) | b;
  }
  
  getDifficultyColorFromType(type) {
    return {
      'Beginner': 0x00ffb2,
      'Easy': 0x00ff4c,
      'Medium': 0xffcc00,
      'Hard': 0xff7f00,
      'Challenge': 0xff4c00,
    }[type];
  }
  
  setInitialBackground() {
    // Set initial background
    if (this.song.chart.backgroundUrl && this.song.chart.backgroundUrl !== "no-media") {
      this.loadBackgroundImage(this.song.chart.background, this.song.chart.backgroundUrl);
    } else {
      this.clearBackground();
    }
  }
  
  songStart() {
    this.setInitialBackground();
    
    const FIXED_DELAY = this.FIXED_DELAY; 
    const DELAY = FIXED_DELAY + this.userOffset;
    
    this.showSongInfo();
    
    const chartOffset = this.song.chart.offset || 0;
    
    this.startTime = game.time.now + FIXED_DELAY - chartOffset * 1000;
    
    game.time.events.add(DELAY / 2, () => this.checkModifiersScreenButton());
    
    game.time.events.add(DELAY, () => {
      this.audio?.play();
      this.started = true;
      if (window.recordNextGame) game.recorder.start(this.audio, 0);
      this.showHud();
      this.checkModifiersScreenButton();
    });
    
    this.audioEndListener = this.audio.addEventListener("ended", () => this.songEnd(), { once: true });
  }
  
  checkModifiersScreenButton() {
    if (gamepad.held.start) {
      game.state.start("ChartModifiers", true, false, "Play", this.originalSong, this.difficultyIndex, this.playtestMode, this.autoplay);
    }
  }
  
  showSongInfo() {
    const texts = [
      {
        value: this.song.chart.titleTranslit || this.song.chart.title,
        font: 'bold_shadow',
        height: 8,
        tint: 0xffffff,
        alpha: 1
      },
      {
        value: this.song.chart.subtitleTranslit || this.song.chart.subtitle,
        font: 'default_shadow',
        height:  12,
        tint: 0xffffff,
        delay: 50,
        alpha: 0.8
      },
      {
        value: this.song.chart.artistTranslit || this.song.chart.artist,
        font: 'default_shadow',
        height:  8,
        tint: 0x00cbff,
        delay: 100,
        alpha: 1
      },
      {
        value: this.song.chart.credit,
        prefix: 'Chart by ',
        font: 'default_shadow',
        delay: 150,
        height:  8,
        tint: 0x00cbff,
        alpha: 0.8
      }
    ];
    
    if (!Account.settings.enableSongInfo) return;
    
    const banner = game.add.sprite(0, 75);
    banner.anchor.y = 0.5;
    
    const bannerGraphics = game.add.graphics(0, 0);
    banner.addChild(bannerGraphics);
    
    let y = 0;
    let height = 6;
    
    const FIXED_DELAY = this.FIXED_DELAY; 
    const entranceDuration = 200;
    const exitDuration = 200;
    
    for (const object of texts) {
      if (object.value) {
        const text = new Text(-240, y, object.prefix ? object.prefix + object.value : object.value, FONTS[object.font], banner);
        text.alpha = object.alpha;
        text.tint = object.tint;
        text.x -= text.width * 2;
        text.anchor.x = 0.5;
        
        const delay = object.delay || 0;
        
        game.add.tween(text).to({ x: 120, alpha: 1 }, entranceDuration * 2, Phaser.Easing.Quadratic.Out, true).onComplete.add(() => {
          game.add.tween(text).to({ x: 240 + text.width * 2, alpha: 0 }, exitDuration * 2, Phaser.Easing.Quadratic.In, true, FIXED_DELAY - entranceDuration - entranceDuration - exitDuration - exitDuration);
        });
        
        y += object.height;
        height += object.height;
      }
    }
    
    if (!y) {
      banner.destroy();
      return;
    }
        
    height += 4;
    
    bannerGraphics.beginFill(0x000000, 0.6);
    bannerGraphics.drawRect(0, -6, 240, height);
    bannerGraphics.endFill();
    
    banner.alpha = 0;
    
    game.add.tween(banner).to({ alpha: 1 }, entranceDuration, Phaser.Easing.Quadratic.In, true).onComplete.add(() => {
      game.add.tween(banner).to({ alpha: 0 }, exitDuration, Phaser.Easing.Quadratic.Out, true, FIXED_DELAY - entranceDuration - exitDuration).onComplete.add(() => {
        banner.destroy();
      });
    });
  }
  
  startHudFlash() {
    this.hudFlashShape.alpha = 1;
    
    const interval = this.player.renderer.beatToSec(1) * 1000;
    
    game.add.tween(this.hudFlashShape).to({ alpha: 0 }, interval, Phaser.Easing.Quadratic.Out, true).repeat(-1);
    game.add.tween(this.hudFlashShape.scale).to({ x: 0.9, y: 0.9 }, interval, Phaser.Easing.Quadratic.Out, true).repeat(-1);
  }
  
  stopHudFlash() {
    game.tweens.removeFrom(this.hudFlashShape);
    game.add.tween(this.hudFlashShape).to({ alpha: 0 }, 100, Phaser.Easing.Quadratic.Out, true);
    game.add.tween(this.hudFlashShape.scale).to({ x: 1, y: 1 }, 100, Phaser.Easing.Quadratic.Out, true).repeat(-1);
  }
  
  showHud(duration = 500, backgroundAlpha = Account.settings.backgroundOpacity, receptorsAlpha = 1) {
    game.add.tween(this.backgroundSprite).to({ alpha: backgroundAlpha }, duration, Phaser.Easing.Quadratic.Out, true);
    game.add.tween(this.hudTop).to({ y: 0, alpha: 1 }, duration, Phaser.Easing.Quadratic.Out, true);
    game.add.tween(this.hudBottom).to({ y: 0, alpha: 1 }, duration, Phaser.Easing.Quadratic.Out, true);
  }
  
  hideHud(duration = 500, backgroundAlpha = Account.settings.backgroundOpacity, receptorsAlpha = 1) {
    game.add.tween(this.backgroundSprite).to({ alpha: backgroundAlpha }, duration, Phaser.Easing.Quadratic.In, true);
    game.add.tween(this.hudTop).to({ y: -40, alpha: 0 }, duration, Phaser.Easing.Quadratic.In, true);
    game.add.tween(this.hudBottom).to({ y: 40, alpha: 0 }, duration, Phaser.Easing.Quadratic.In, true);
  }
  
  showCharacterCloseShot(duration) {
    const displayTime = Math.max(500, duration - 400);
    const closeShot = new CharacterCloseShot(2, 131, this.currentCharacter);
    closeShot.visible = false;
    this.overHud.addChild(closeShot);
    
    if (this.visualizer) {
      this.visualizer.graphics.visible = false;
    }
    
    const timer = {
      time: displayTime + 200
    };
    
    const timerText = new Text(47, 132, "0s", null, this.overHud);
    timerText.anchor.x = 1;
    
    const timeTween = game.add.tween(timer).to({ time: 0 }, duration, "Linear", true);
    timeTween.onUpdateCallback(() => {
      const time = timer.time;
      const formattedTime = TimeUtils.formatSeconds(timer.time);
      timerText.write(formattedTime);
    });
    
    const noiseSprite = game.add.sprite(2, 131, 'character_noise');
    noiseSprite.animations.add('noise', [0, 1, 2, 3, 4, 5, 6, 7], 60, true);
    noiseSprite.animations.play('noise');
    this.overHud.addChild(noiseSprite);

    game.time.events.add(200, () => {
      noiseSprite.destroy();
      closeShot.visible = true;
      closeShot.blink(game.rnd.between(0, 200));
    });

    game.time.events.add(displayTime, () => {
      closeShot.visible = false;
      timerText.visible = false;
      const endNoise = game.add.sprite(2, 131, 'character_noise');
      endNoise.animations.add('noise', [0, 1, 2, 3, 4, 5, 6, 7], 60, true);
      endNoise.animations.play('noise');
      this.overHud.addChild(endNoise);
      
      game.time.events.add(200, () => {
        if (this.visualizer) {
          this.visualizer.graphics.visible = true;
        }
        timerText.destroy();
        endNoise.destroy();
        closeShot.destroy();
      });
    });
  }
  
  showGlitchAnimation(duration = 1000) {
    const glitch = game.add.sprite(0, 0, 'ui_glitch_animation');
    glitch.animations.add('glitch', [0, 1, 2, 3, 4, 5, 6], 12, true);
    glitch.animations.play('glitch');
    glitch.lifespan = duration;
    glitch.blendMode = PIXI.blendModes.ADD;
    this.overHud.addChild(glitch);
  }
  
  showFullCombo() {
    if (this.fullComboAnimationStarted) {
      return;
    }
    
    // Create overlay parent
    this.fullComboOverlay = game.add.sprite(0, 0);
    
    const flawless = this.player.accuracy >= 99.75;
    
    // Create gradient effects
    const bitmap = game.add.bitmapData(game.width, game.height);
    const gradient = bitmap.context.createLinearGradient(0, 0, 0, game.height);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, flawless ? '#ffb200' : '#dad2eb');
    gradient.addColorStop(1, 'transparent');
    bitmap.context.fillStyle = gradient;
    bitmap.context.fillRect(0, 0, game.width, game.height);
    
    this.fullComboGradient = game.add.sprite(0, 0, bitmap);
    this.fullComboGradient.alpha = 0;
    this.fullComboOverlay.addChild(this.fullComboGradient);
    
    // Create full combo message
    this.fullComboBg = game.add.graphics(0, game.height / 2);
    this.fullComboBg.beginFill(0x000000, 1);
    this.fullComboBg.drawRect(0, 0, game.width, 10);
    this.fullComboBg.endFill();
    this.fullComboBg.beginFill(0xffffff, 1);
    this.fullComboBg.drawRect(0, 0, game.width, 1);
    this.fullComboBg.drawRect(0, 10, game.width, 1);
    this.fullComboBg.endFill();
    this.fullComboBg.anchor.y = 0.5;
    this.fullComboBg.scale.y = 0;
    this.fullComboOverlay.addChild(this.fullComboBg);
    
    this.fullComboText = new Text(game.width, 6, flawless ? "FLAWLESS!!" : "FULL COMBO!!", "", FONTS.default);
    this.fullComboText.anchor.x = 0.5;
    this.fullComboText.anchor.y = 0.5;
    this.fullComboText.alpha = 0;
    this.fullComboBg.addChild(this.fullComboText);
    
    this.fullComboAnimationStarted = true;
    
    // Animate full combo message
    game.add.tween(this.fullComboBg.scale).to({ y: 1 }, 200, "Linear", true);
    game.add.tween(this.fullComboText).to({ alpha: 1, x: game.width / 2 }, 200, "Linear", true);
    game.add.tween(this.fullComboGradient).to({ alpha: 1 }, 200, "Linear", true, 200)
    game.time.events.add(1000, () => {
      game.add.tween(this.fullComboBg.scale).to({ y: 0 }, 200, "Linear", true);
      game.add.tween(this.fullComboText).to({ alpha: 0, x: 0 }, 200, "Linear", true);
      game.add.tween(this.fullComboGradient).to({ alpha: 0 }, 200, "Linear", true, 200);
      this.fullComboAnimationEnded = true;
    });

    let color = 0;
    
    game.time.events.loop(90, () => {
      const tintColor = color ? (flawless ? 0xffb200 : 0xdad2eb) : 0xffffff;
      
      this.fullComboBg.beginFill(tintColor, 1);
      this.fullComboBg.drawRect(0, 0, game.width, 1);
      this.fullComboBg.drawRect(0, 10, game.width, 1);
      this.fullComboBg.endFill();
      this.fullComboText.tint = tintColor;
      
      color = color ? 0 : 1;
    });
    
    // Add it over hud
    this.overHud.addChild(this.fullComboOverlay);
    
    // Play sound effect
    Audio.play("full_combo", 1);
  }
  
  drawBackground(element) {
    // Check if element is errored
    if (element && element.__errored) {
      console.warn(`Skipping errored background: ${element.__url}`);
      this.drawFallbackBackground();
      return;
    }
    
    // Also check for naturalWidth/height for images
    if (element && element.__type === "image" && element.naturalWidth === 0) {
      console.warn(`Image has zero dimensions: ${element.__url}`);
      element.__errored = true;
      this.drawFallbackBackground();
      return;
    }
    
    try {
      this.backgroundSprite.ctx.drawImage(element, 0, 0, 240, 140);
      this.backgroundSprite.dirty();
    } catch (error) {
      console.error("Error drawing background:", error);
      element.__errored = true;
      this.drawFallbackBackground();
    }
  }
  
  drawFallbackBackground() {
    if (this.shootingDown) return;
    
    // Use default song bg as fallback
    const element = this.preloadedBackgroundElements[this.song.chart.background];
    
    if (element && !element.__errored) {
      this.drawBackground(element);
    } else {
      this.clearBackground();
    }
  }
  
  clearBackground() {
    this.backgroundSprite.ctx.fillStyle = "#000000";
    this.backgroundSprite.ctx.fillRect(0, 0, game.width, game.height);
    this.backgroundSprite.dirty();
    this.backgroundGradient.visible = true;
  }  
  
  loadBackgroundImage(filename, url) {
    if (filename == 'undefined' || !filename || !url) return;
    
    // Pause any existing video
    if (this.video) {
      this.video.pause();
      this.video = null;
    }
    
    // Check if there is already a background preloaded
    if (this.preloadedBackgroundElements[filename]) {
      const element = this.preloadedBackgroundElements[filename];
      
      // Check if element is errored
      if (element.__errored) {
        console.warn(`Preloaded background is errored: ${filename}`);
        this.drawFallbackBackground();
        return;
      }
      
      // Use the preloaded background
      this.drawBackground(element);
    } else {
      // Load the background in real time with error handling
      const img = document.createElement("img");
      img.__errored = false;
      img.__type = "image";
      img.__url = url;
      
      img.onload = () => {
        this.preloadedBackgroundElements[filename] = img;
        this.drawBackground(img);
      };
      
      img.onerror = () => {
        console.warn(`Failed to load background in realtime: ${filename}`);
        img.__errored = true;
        this.preloadedBackgroundElements[filename] = img;
        this.drawFallbackBackground();
      };
      
      img.src = url;
    }
    
    this.backgroundGradient.visible = true;
  }
  
  loadBackgroundVideo(filename, url) {
    if (filename == 'undefined' || !filename || !url) return;
        
    // Pause any existing video
    if (this.video && this.video != this.preloadedBackgroundElements[filename]) {
      this.video.pause();
      this.video = null;
    }
    
    // Check if there is already a background preloaded
    if (this.preloadedBackgroundElements[filename]) {
      const element = this.preloadedBackgroundElements[filename];
      
      // Check if element is errored
      if (element.__errored) {
        console.warn(`Preloaded video is errored: ${filename}`);
        this.drawFallbackBackground();
        return;
      }
      
      // Use the preloaded background
      this.video = element;
    } else {
      // Load the background in real time with error handling
      const video = document.createElement("video");
      video.__errored = false;
      video.__type = "video";
      video.__url = url;
      
      video.src = url;
      video.muted = true;
      video.volume = 0;
      video.loop = true;
      video.autoplay = false;
      
      video.addEventListener("canplaythrough", () => {
        this.preloadedBackgroundElements[filename] = video;
        this.playVideo(video);
      }, { once: true });
      
      video.onerror = () => {
        console.warn(`Failed to load video in realtime: ${url}`);
        video.__errored = true;
        this.preloadedBackgroundElements[filename] = video;
        this.drawFallbackBackground();
      };
      
      console.warn("Couldn't find video:", filename, "Loading video in real time. This may affect performance");
    }
    
    if (this.video && !this.video.__errored) {
      this.playVideo(this.video);
      this.backgroundGradient.visible = false;
      this.video.onerror = () => {
        console.warn(`Video playback error: ${filename}`);
        this.video.__errored = true;
        this.backgroundGradient.visible = true;
        this.drawFallbackBackground();
        this.video.onerror = null;
      };
    }
  }
  
  playVideo(video) {
    this.video = video || this.video;
    this.video.play();
    this.video.currentTime = 0;
    this.backgroundGradient.visible = false;
  }
  
  applyBackground(bg) {
    if (bg.file == '-nosongbg-') {
      this.clearBackground();
    } else if (bg.type == 'video') {
      this.loadBackgroundVideo(bg.file, bg.url);
    } else {
      this.loadBackgroundImage(bg.file, bg.url);
    }
    this.currentBackground = bg;
    this.applyBgEffects(bg);
  }
  
  applyBgEffects(bg) {
    if (bg.fadeIn) {
      this.backgroundSprite.alpha = 0;
      game.add.tween(this.backgroundSprite).to({ alpha: parseFloat(bg.opacity) * 0.6 }, 500, "Linear",true);
    } else {
      this.backgroundSprite.alpha = bg.opacity * 0.7;
    }
    
    // TODO: When applying bg effects take in account bg.fadeOut and bg.effect
  }
  
  getGameResults(player = this.player) {
    return {
      score: player.score,
      accuracy: player.accuracy,
      maxCombo: player.maxCombo,
      character: this.currentCharacter,
      autoplay: player.autoplay,
      complete: !player.autoplay && player.accuracy >= 40,
      judgements: { ...player.judgementCounts },
      totalNotes: this.song.chart.notes.length,
      skillsUsed: this.skillSystem.getSkillsUsed(),
      difficultyRating: this.song.chart.difficulties[this.song.difficultyIndex].rating
    };
  }
  
  restartSong() {
    game.state.start("Play", true, false, this.originalSong, this.difficultyIndex, this.playtestMode, this.autoplay);
  }
  
  songEnd() {
    // Forget preloaded backgrounds
    Object.entries(this.preloadedBackgroundElements).map(entry => entry[1] || null).forEach(element => {
      if (element) {
        element.src = "";
      }
    });
    
    // Return to editor if on playtest mode
    if (this.playtestMode) {
      game.state.start("Editor", true, false, this.originalSong);
      return;
    }
    
    // Update character stats
    const gameResults = this.getGameResults(this.player);
    
    // Calculate experience gain (0 if autoplay is enabled)
    const expGain = this.autoplay ? 0 : this.characterManager.calculateExperienceGain(gameResults);
    
    // Update character with experience and stats
    if (!this.autoplay) {
      // Save last song details
      Object.assign(Account.lastSong, gameResults);
      this.updateUserStats(gameResults);
      this.characterManager.updateCharacterStats(gameResults, expGain);
    }
    
    // Pass game data to Results state
    const gameData = {
      song: this.song,
      difficultyIndex: this.difficultyIndex,
      character: this.currentCharacter,
      autoplay: this.autoplay,
      playtestMode: this.playtestMode,
      player: this.player,
      expGain: expGain,
      gameResults: gameResults
    };
    
    // Hide HUD
    this.hideHud(500, 1, 0);
    
    game.state.start("Results", true, false, gameData);
  }
  
  updateUserStats(gameResults) {
    if (!Account.stats) {
      Account.stats = { ...DEFAULT_ACCOUNT.stats };
    }
    
    if (gameResults.complete) {
      Account.stats.totalGamesPlayed++;
      const difficultyType = this.song.chart.difficulties[this.song.difficultyIndex].type;
      Account.stats[`total${difficultyType}GamesPlayed`] += 1;
    }
    Account.stats.totalScore += this.player.score;
    Account.stats.maxCombo = Math.max(Account.stats.maxCombo, this.player.maxCombo);
    
    if (this.player.accuracy >= 100) {
      Account.stats.perfectGames++;
    }
    
    // Update judgement counts
    Account.stats.totalNotesHit += Object.values(this.player.judgementCounts).reduce((a, b) => a + b, 0);
    Account.stats.totalMarvelous += this.player.judgementCounts.marvelous || 0;
    Account.stats.totalPerfect += this.player.judgementCounts.perfect || 0;
    Account.stats.totalGreat += this.player.judgementCounts.great || 0;
    Account.stats.totalGood += this.player.judgementCounts.good || 0;
    Account.stats.totalBoo += this.player.judgementCounts.boo || 0;
    Account.stats.totalMiss += this.player.judgementCounts.miss || 0;
    
    // Update max values
    Account.stats.maxMarvelousInGame = Math.max(
      Account.stats.maxMarvelousInGame, 
      this.player.judgementCounts.marvelous || 0
    );
    
    Account.stats.maxSkillsInGame = Math.max(
      Account.stats.maxSkillsInGame,
      this.skillSystem.getSkillsUsed()
    );
    
    // Update achievements
    const achievementsManager = new AchievementsManager();
    achievementsManager.updateStats(gameResults);
  }
  
  togglePause() {
    if (this.isAnimating) return;
    
    if (!this.isPaused) {
      this.pause();
    } else {
      this.resume();
    }
  }
  
  pause() {
    if (!this.started) return;
    this.isPaused = true;
    this.pauseStartTime = game.time.now;
    this.audio?.pause();
    this.video?.pause();
    this.showPauseMenu();
  }
  
  resume() {
    this.isPaused = false;
    this.totalPausedDuration += game.time.now - this.pauseStartTime;
    this.video?.play();
    this.audio?.play();
    this.hidePauseMenu();
  }
  
  getStatsContent() {
    return Object.entries(this.player.judgementCounts).map(entry => `${entry[0]}: ${entry[1]}`.toUpperCase()).join('\n');
  }
  
  showPauseMenu() {
    this.pauseBg = game.add.graphics(0, 0);
    
    this.pauseBg.beginFill(0x000000, 0.6);
    this.pauseBg.drawRect(0, 0, game.width, game.height);
    this.pauseBg.endFill();
    
    this.pauseStatsText = new Text(game.width - 20, game.height / 2 + 4, "", FONTS.default);
    this.pauseStatsText.anchor.set(1, 0.5);
    this.pauseStatsText.tint = 0xECECEC;
    
    const statsContent = this.getStatsContent();
    
    this.pauseStatsText.write(statsContent);
    
    this.pauseCarousel = new CarouselMenu(10, game.height / 2 - 20, 80, 60, {
      bgcolor: "brown",
      fgcolor: "#ffffff",
      align: "center",
      animate: true
    });
    
    this.pauseCarousel.addItem("Continue", () => this.resume());
    if (this.autoplay && !this.playtestMode) {
      this.pauseCarousel.addItem("Disable Autoplay", () => {
        Account.settings.autoplay = false;
        game.state.start("SongSelect", true, false, null, null, true);
      });
    }
    if (this.playtestMode) {
      if (this.autoplay) {
        this.pauseCarousel.addItem("Disable Autoplay", () => game.state.start("Play", true, false, this.song, this.difficultyIndex, true, false));
      } else {
        this.pauseCarousel.addItem("Enable Autoplay", () => game.state.start("Play", true, false, this.song, this.difficultyIndex, true, true));
      }
    }
    this.pauseCarousel.addItem("Restart", () => this.restartSong());
    this.pauseCarousel.addItem(this.playtestMode ? "< Back To Editor" : "Give Up", () => this.songEnd());
    
    game.onMenuIn.dispatch('pause', this.pauseCarousel);
    
    if (!this.playtestMode) {
      this.pauseCarousel.addItem("QUIT", () => game.state.start("MainMenu"));
    }
    
    this.pauseCarousel.onCancel.add(() => this.resume());
  }
  
  hidePauseMenu() {
    if (this.pauseCarousel) {
      this.pauseBg.destroy();
      this.pauseStatsText.destroy();
      this.pauseCarousel.destroy();
      this.pauseCarousel = null;
    }
  }
  
  getCurrentTime() {
    if (this.isPaused) {
      const elapsed = this.pauseStartTime - this.startTime - this.totalPausedDuration + this.userOffset;
      return {
        now: elapsed / 1000,
        beat: this.secToBeat(elapsed / 1000)
      };
    } else {
      const elapsed = game.time.now - this.startTime - this.totalPausedDuration + this.userOffset;
      return {
        now: elapsed / 1000,
        beat: this.secToBeat(elapsed / 1000)
      };
    }
  }
  
  secToBeat(sec) {
    return this.player ? this.player.secToBeat(sec) : 0;
  }
  
  updateBackgrounds() {
    const { beat } = this.getCurrentTime();
    
    // Check for background(s) needed for this beat
    this.song.chart.backgrounds.forEach(bg => {
      if (beat >= bg.beat && !bg.activated) {
        bg.activated = true;
        this.backgroundQueue.push(bg);
      }
    });
    
    // Process the queue
    if (this.backgroundQueue.length > 0) {
      const nextBG = this.backgroundQueue.shift();
      this.applyBackground(nextBG);
    }
    
    // Update video if needed
    this.updateVideo();
  }
  
  updateVideo() {
    if (this.video && 
        !this.video.__errored &&
        this.currentBackground && 
        this.currentBackground.type == "video" && 
        game.time.now - this.lastVideoUpdateTime >= game.time.elapsedMS * (Account.settings.videoFps || 1)) {
      
      this.lastVideoUpdateTime = game.time.now;
      
      // Check video ready state
      if (this.video.readyState >= 2) { // HAVE_CURRENT_DATA or better
        try {
          this.drawBackground(this.video);
        } catch (error) {
          console.error("Error updating video frame:", error);
          this.video.__errored = true;
          this.drawFallbackBackground();
        }
      }
    }
  }
  
  update() {
    gamepad.update();
        
    if (this.isPaused) return;
    
    // Pause with start button
    if (gamepad.pressed.start && !this.lastStart) {
      this.togglePause();
    }
    this.lastStart = gamepad.pressed.start;
    
    // Update skill system
    if (this.skillSystem) {
      this.skillSystem.update();
    }
    
    // Update lyrics with current time
    if (this.hasLyricsFile && this.lyrics && this.started) {
      const currentTime = this.getCurrentTime().now;
      this.lyrics.move(currentTime);
    }
    
    // Update visualizer
    if (this.visualizer && game.time.now - this.lastVisualizerUpdateTime >= game.time.elapsedMS * 2) {
      this.visualizer.update();
      this.lastVisualizerUpdateTime = game.time.now;
    }
    
    // Handle assist tick toggle with Select button
    if (gamepad.pressed.select && !this.lastSelect) {
      this.metronome.toggle();
    }
    this.lastSelect = gamepad.pressed.select;
    
    // Update assist tick metronome
    if (this.metronome) {
      this.metronome.update();
    }
    
    // Update autoplay text
    let text = "";
    if (this.autoplay) {
      text = this.metronome.enabled ? "AUTOPLAY + METRONOME" : "AUTOPLAY";
    } else if (this.metronome.enabled) {
      text = "METRONOME";
    }
    if (this.autoplayText.text != text) this.autoplayText.write(text);
    
    const { now, beat } = this.player.update();
    
    if (this.started && Account.settings.enableTemperature) {
      this.temperature.update(now, beat);
    }
    
    if (this.started) this.updateBackgrounds();
    
    this.hud.bringToTop();
    
    this.overHud.bringToTop();
    
    this.judgementText.bringToTop();
    this.comboText.bringToTop();
    
    // Check for full combo
    if (this.started && !this.fullComboAnimationStarted) {
      let hitNotes = 0;
      
      for (const [judgement, count] of Object.entries(this.player.judgementCounts)) {
        if (judgement != "miss") {
          hitNotes += count;
        }
      }
      
      if (hitNotes >= this.player.totalNotes) {
        this.showFullCombo();
      }
    }
  }
  
  render() {
    if (this.player) {
      this.player.render();
    }
  }
  
  shutdown() {
    this.shootingDown = true;
    
    this.audio.removeEventListener("ended", this.audioEndListener);
    window.removeEventListener("visibilitychange", this.visibilityChangeListener);
    this.audio.pause();
    this.audio.onload = null;
    this.audio.onerror = null;
    
    if (this.video) {
      this.video.pause();
      this.video.onload = null;
      this.video.onerror = null;
      this.video.src = "";
    }
    
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }
    
    if (this.metronome) {
      this.metronome.destroy();
      this.metronome = null;
    }
    
    this.temperature.destroy();
    this.temperature = null;
    
    // Stop recording and show video
    if (window.recordNextGame) {
      game.recorder.stop();
      game.recorder = null;
      window.recordNextGame = false;
    }
    
    this.song = null;
  }
}
