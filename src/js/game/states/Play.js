/**
 * @class Play
 * @category Game States
 * @summary Main gameplay state
 * @constructor
 * @features
 * Full playthrough flow from audio setup through judgement and results
 * HUD with score, combo, lifebar, accuracy, visualizers and character closeups
 * Background pipeline supporting images, videos, fades and animated effects
 * Chart modifiers, character skills, lyrics, metronome and pause menu support
 * @description
 * The Play state runs a single song from start to finish. It clones the chart, loads
 * the audio and backgrounds, spawns the player renderer and advances the rhythm
 * gameplay loop producing judgement counts, combo, accuracy and a final score. When
 * the song ends it collates the results and hands them to the Results state.
 * @example
 * // Start a normal playthrough for a song and difficulty
 * game.state.start("Play", true, false, { chart: song, difficultyIndex: 2 });
 *
 * // Launch in playtest mode with autoplay from the editor
 * game.state.start("Play", true, false, song, 0, true, true);
 */
class Play {
  /**
   * Phaser state hook that clones the chart, initializes the gameplay objects
   * and saves the last played song to the account.
   * @param {Object} song - Object containing the chart and song data
   * @param {number} difficultyIndex - Index of the selected difficulty
   * @param {boolean} playtestMode - Whether this is an editor playtest run
   * @param {boolean} autoplay - Whether the run is played by the computer
   * @param {string} playlistKey - Optional playlist key this song belongs to
   */
  init(song, difficultyIndex, playtestMode, autoplay, playlistKey) {
    if (typeof song.difficultyIndex != undefined && typeof difficultyIndex != undefined) {
      song.difficultyIndex = difficultyIndex;
    }
    /** @type {Object} The unmodified song object passed into the state */
    this.originalSong = song;
    /** @type {Object} A deep clone of the chart used for gameplay */
    this.song = structuredClone(song);
    /** @type {number} Index of the selected difficulty */
    this.difficultyIndex = typeof difficultyIndex != undefined ? difficultyIndex : song.difficultyIndex;
    /** @type {Object|null} The player renderer and judgement objects */
    this.player = null;
    /** @type {Array} Queue of background preload tasks */
    this.backgroundQueue = [];
    /** @type {Object} Cache of preloaded background elements by file name */
    this.preloadedBackgroundElements = {};
    /** @type {?Object} The background element currently on screen */
    this.currentBackground = null;
    /** @type {boolean} Whether gameplay is currently paused */
    this.isPaused = false;
    /** @type {number} Timestamp when the current pause started */
    this.pauseStartTime = 0;
    /** @type {number} Total accumulated pause duration in milliseconds */
    this.totalPausedDuration = 0;
    /** @type {boolean} Whether the song start is held until audio is ready */
    this.pendingSongStart = false;
    /** @type {?Function} Handler notified when the audio element ends */
    this.audioEndListener = null;
    /** @type {boolean} Whether the song has started playing */
    this.started = false;
    /** @type {number} Audio timeline offset used to sync the chart */
    this.startTime = 0;
    /** @type {boolean} Whether the note roadmap is being played by the computer */
    this.autoplay = typeof autoplay !== "undefined" ? autoplay : Account.settings.autoplay;
    /** @type {string} Optional playlist key the current song belongs to */
    this.playlistKey = playlistKey;
    /** @type {number} The user's global timing offset in milliseconds */
    this.userOffset = Account.settings.userOffset || 0;
    /** @type {number} Timestamp of the last video sync update */
    this.lastVideoUpdateTime = 0;
    /** @type {?Lyrics} Lyrics renderer for the current song */
    this.lyrics = null;
    /** @type {boolean} Whether the chart includes a lyrics file */
    this.hasLyricsFile = this.song.chart.lyricsContent ? true : false;
    /** @type {string} Active visualizer type from account settings */
    this.visualizerType = Account.settings.visualizer || 'NONE';
    /** @type {number} Timestamp of the last visualizer redraw */
    this.lastVisualizerUpdateTime = 0;
    /** @type {?Metronome} Beats-per-minute metronome display */
    this.metronome = null;
    /** @type {?ScreenRecorder} Recorder capturing the playthrough */
    this.gameRecorder = null;
    /** @type {boolean} Whether this is an editor playtest run */
    this.playtestMode = playtestMode;
    /** @type {boolean} Whether the full combo overlay animation has started */
    this.fullComboAnimationStarted = false;
    /** @type {boolean} Whether the full combo overlay animation has finished */
    this.fullComboAnimationEnded = false;
    /** @type {boolean} Whether the shots are currently flying on screen */
    this.shootingDown = false;
    
    // Initialize character system
    /** @type {CharacterManager} Manages the player's characters and persistence */
    this.characterManager = new CharacterManager();
    /** @type {Object|null} The character active for this playthrough */
    this.currentCharacter = this.characterManager.getCurrentCharacter();
    /** @type {CharacterSkillSystem} Tracks character skills used during the playthrough */
    this.skillSystem = new CharacterSkillSystem(this, this.currentCharacter);
    
    // Update stats
    if (playtestMode) Account.stats.chartsTestPlayed ++;
    
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
    /** @type {Object} Timing windows used to judge each note */
    this.JUDGE_WINDOWS = JUDGE_WINDOWS;
    
    /** @type {Object} Score values awarded for each judgement */
    this.SCORE_VALUES = SCORE_VALUES;
    
    /** @type {number} Fixed playback delay in milliseconds */
    this.FIXED_DELAY = 2000; 
  }
  
  /**
   * Phaser state hook that builds the HUD, applies chart modifiers and
   * starts the asynchronous background and audio setup.
   */
  create() {
    // Ensure background music is stopped during gameplay
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    game.camera.fadeIn(0x000000);
    
    // Create background
    /** @type {Phaser.Group} Layer holding the background elements */
    this.backgroundLayer = game.add.group();
    /** @type {CanvasBackground} The chart background rendered as a canvas */
    this.backgroundSprite = new CanvasBackground(0, 0);
    this.backgroundSprite.alpha = 1;
    
    /** @type {Function} Handler pausing or resuming the game on tab visibility changes */
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
  
  /**
   * Preloads all chart backgrounds, sets up the audio and starts the song.
   * @returns {Promise<void>} Resolves once the audio is ready and the song starts
   */
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
  
  /**
   * Applies the enabled chart modifiers (mines, freezes, jumps, mirror, randomize)
   * to a working copy of the current difficulty's notes.
   */
  applyChartModifiers() {
    const modifiers = Account.settings.chartModifiers || {};
    
    const order = ['NO MINES', 'NO FREEZES', 'NO HANDS', 'NO JUMPS', 'MIRRORED', 'RANDOMIZED'];
    
    const activeModifiers = order.filter(key => modifiers[key] === true);
    
    if (activeModifiers.length === 0) return;
    
    const difficulty = this.song.chart.difficulties[this.difficultyIndex];
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
  
  /**
   * Creates and loads the audio element, then builds the audio visualizer.
   * @returns {Promise<string|undefined>} Resolves when the audio can play
   */
  setupAudio() {
    return new Promise(resolve => {
      // Create audio element and wait for it to load
      /** @type {HTMLAudioElement} Audio element used for the song playback */
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
  
  /**
   * Loads a single background image or video element for later drawing.
   * @param {Object} background - Descriptor with url and type fields
   * @returns {Promise<HTMLImageElement|HTMLVideoElement>} The loaded background element
   */
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
  
  /**
   * Builds the heads-up display with lifebar, score, combo, accuracy and text.
   */
  createHud() {
    /** @type {BackgroundGradient} Animated gradient behind the HUD */
    this.backgroundGradient = new BackgroundGradient(0, 0.4, 5000);

    /** @type {Phaser.Sprite} Root sprite of the HUD */
    this.hud = game.add.sprite(0, 0);
    
    /** @type {Phaser.Sprite} Full-screen flash shape keyed by the temperature meter */
    this.hudFlashShape = game.add.sprite(game.width / 2, game.height / 2, 'ui_hud_flash_shape');
    this.hudFlashShape.anchor.set(0.5);
    this.hudFlashShape.alpha = 0;
    this.hud.addChild(this.hudFlashShape);
    
    /** @type {Phaser.Sprite} Top HUD strip */
    this.hudTop = game.add.sprite(0, -40, 'ui_hud_background_top');
    this.hudTop.alpha = 0;
    this.hud.addChild(this.hudTop);
    
    /** @type {Phaser.Sprite} Bottom HUD strip */
    this.hudBottom = game.add.sprite(0, 40, 'ui_hud_background_bottom');
    this.hudBottom.alpha = 0;
    this.hud.addChild(this.hudBottom);
    
    /** @type {Phaser.Sprite} Overlay sprite sitting above the HUD */
    this.overHud = game.add.sprite(0, 0);
    
    const difficulty = this.song.chart.difficulties[this.difficultyIndex];
    
    /** @type {Phaser.Sprite} Banner showing the difficulty name */
    this.difficultyBanner = game.add.sprite(0, 0, "ui_difficulty_banner", 0);
    this.difficultyBanner.tint = window.getDifficultyColor(difficulty.rating, true);
    this.hudTop.addChild(this.difficultyBanner);
    
    /** @type {Text} Label of the current difficulty */
    this.difficultyTypeText = new Text(5, 1, difficulty.type.substr(0, 9), FONTS.default, this.difficultyBanner);
    this.difficultyTypeText.alpha = 0.7;
    game.add.tween(this.difficultyTypeText).to({ alpha: 1 }, 400, "Linear", true).repeat(-1).yoyo(true);
    
    const title = this.song.chart.titleTranslit || this.song.chart.title;
    
    /** @type {Text} Scrolling song title label */
    this.songTitleText = new Text(41, 1, "", null, this.hudTop);
    this.songTitleText.write(title, 41);
    
    /** @type {Text} Name of the active character */
    this.playerName = new Text(5, 9, "", FONTS.tiny_shaded, this.hudTop);
    this.playerName.write(this.currentCharacter ? this.currentCharacter.name : "NONE", 8);
    
    this.playerName.tint = this.currentCharacter ? Math.max(0x787878, this.currentCharacter.appearance.tints?.hair || 0x787878) : 0xffffff;
    
    /** @type {SkillBar} Bar showing the character's skill usage */
    this.skillBar = new SkillBar(6, 16);
    this.hudTop.addChild(this.skillBar);
    
    if (!this.currentCharacter) this.skillBar.visible = false;
    
    /** @type {Text} Numeric score label */
    this.scoreText = new Text(35, 14, "0".repeat(9), FONTS.tiny_number, this.hudTop);
    
    /** @type {Phaser.Sprite} Left segment of the lifebar */
    this.lifebarStart = game.add.sprite(37, 9, "ui_lifebar", 0);
    /** @type {Phaser.Sprite} Stretching middle segment of the lifebar */
    this.lifebarMiddle = game.add.sprite(1, 0, "ui_lifebar", 1);
    this.lifebarMiddle.width = 145;
    /** @type {Phaser.Sprite} Right segment of the lifebar */
    this.lifebarEnd = game.add.sprite(146, 0, "ui_lifebar", 2);
    
    this.hudTop.addChild(this.lifebarStart);
    this.lifebarStart.addChild(this.lifebarMiddle);
    this.lifebarStart.addChild(this.lifebarEnd);
    
    // Autoplay text
    /** @type {Text} Label shown while autoplay is enabled */
    this.autoplayText = new Text(4, 120, this.autoplay ? "AUTOPLAY" : "", FONTS.tiny_stroke, this.hud);
    
    /** @type {Text} Numeric health label */
    this.healthText = new Text(185, 9, "100", FONTS.tiny_number, this.hudTop);
    
    /** @type {Phaser.Sprite} Sprite showing the last judgement result */
    this.judgementText = game.add.sprite(game.width / 2, 75, "judgement", 0);
    this.judgementText.alpha = 0;
    this.judgementText.anchor.set(0.5);
    
    /** @type {Phaser.Sprite} Accuracy bar sprite */
    this.accuracyBar = game.add.sprite(51, 136, "ui_accuracy_bar");
    this.hudBottom.addChild(this.accuracyBar);
    
    /** @type {Text} Current combo count label */
    this.comboText = new Text(240 - 1, 140 - 6, "0", FONTS.biscuitlocker_combo, this.hudBottom);
    this.comboText.anchor.set(1);
  }
  
  /**
   * Recreates the visualizer matching the current setting, or removes it.
   * @param {number} visualizerX - X position of the visualizer
   * @param {number} visualizerY - Y position of the visualizer
   * @param {number} visualizerWidth - Width of the visualizer area
   * @param {number} visualizerHeight - Height of the visualizer area
   */
  createVisualizer(visualizerX = 2, visualizerY = 131, visualizerWidth = 46, visualizerHeight = 7) {
    // Remove existing visualizer
    if (this.visualizer) {
      this.visualizer.destroy();
      /** @type {?Object} The active visualizer instance, or null when none is shown */
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
  
  /**
   * Wires the audio temperature meter to the HUD flash effects.
   */
  setupSongTemperature() {
    const meter = new AudioTemperatureMeter(this, this.audio, this.song.chart);
    
    meter.onHighTemperature.add(() => {
      this.startHudFlash();
    });
    
    meter.onLowTemperature.add(() => {
      this.stopHudFlash();
    });
    
    /** @type {AudioTemperatureMeter} Meter tracking the song's audio temperature */
    this.temperature = meter;
  }
  
  /**
   * Instantiates the center-lane Player used for gameplay.
   */
  setupPlayer() {
    this.player = new Player(this, "center");
  }
  
  /**
   * Creates the lyrics text element and controller when a lyrics file exists.
   */
  setupLyrics() {
    if (this.hasLyricsFile) {
      const lrcContent = this.song.chart.lyricsContent; 
      
      const lyricsPosition = Account.settings.lyricsPosition ? 40 : 90;
      
      // Create lyrics text element
      /** @type {?Text} On-screen label rendering the current lyrics line */
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
  
  /**
   * Sets the initial chart background or clears it when none is present.
   */
  setInitialBackground() {
    // Set initial background
    if (this.song.chart.backgroundUrl && this.song.chart.backgroundUrl !== "no-media") {
      this.loadBackgroundImage(this.song.chart.background, this.song.chart.backgroundUrl);
    } else {
      this.clearBackground();
    }
  }
  
  /**
   * Begins playback: shows the song info, schedules the audio start and HUD reveal.
   */
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
  
  /**
   * Opens the Chart Modifiers state while the start button is held at kickoff.
   */
  checkModifiersScreenButton() {
    if (gamepad.held.start) {
      game.state.start("ChartModifiers", true, false, "Play", this.originalSong, this.difficultyIndex, this.playtestMode, this.autoplay);
    }
  }
  
  /**
   * Animates an intro banner with the song's title, subtitle, artist and credit.
   */
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
        prefix: __('Chart (by|por) '),
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
  
  /**
   * Starts the pulsing HUD flash effect synced to the song's beat.
   */
  startHudFlash() {
    this.hudFlashShape.alpha = 1;
    
    const interval = this.player.renderer.beatToSec(1) * 1000;
    
    game.add.tween(this.hudFlashShape).to({ alpha: 0 }, interval, Phaser.Easing.Quadratic.Out, true).repeat(-1);
    game.add.tween(this.hudFlashShape.scale).to({ x: 0.9, y: 0.9 }, interval, Phaser.Easing.Quadratic.Out, true).repeat(-1);
  }
  
  /**
   * Stops the HUD flash effect and fades the flash shape away.
   */
  stopHudFlash() {
    game.tweens.removeFrom(this.hudFlashShape);
    game.add.tween(this.hudFlashShape).to({ alpha: 0 }, 100, Phaser.Easing.Quadratic.Out, true);
    game.add.tween(this.hudFlashShape.scale).to({ x: 1, y: 1 }, 100, Phaser.Easing.Quadratic.Out, true).repeat(-1);
  }
  
  /**
   * Slides the HUD panels, background and receptors into view.
   * @param {number} duration - Tween duration in milliseconds
   * @param {number} backgroundAlpha - Target background opacity
   * @param {number} receptorsAlpha - Receptors alpha to restore during the reveal
   */
  showHud(duration = 500, backgroundAlpha = Account.settings.backgroundOpacity, receptorsAlpha = 1) {
    game.add.tween(this.backgroundSprite).to({ alpha: backgroundAlpha }, duration, Phaser.Easing.Quadratic.Out, true);
    game.add.tween(this.hudTop).to({ y: 0, alpha: 1 }, duration, Phaser.Easing.Quadratic.Out, true);
    game.add.tween(this.hudBottom).to({ y: 0, alpha: 1 }, duration, Phaser.Easing.Quadratic.Out, true);
  }
  
  /**
   * Slides the HUD panels and background out of view.
   * @param {number} duration - Tween duration in milliseconds
   * @param {number} backgroundAlpha - Target background opacity while hidden
   * @param {number} receptorsAlpha - Receptors alpha to restore during the hide
   */
  hideHud(duration = 500, backgroundAlpha = Account.settings.backgroundOpacity, receptorsAlpha = 1) {
    game.add.tween(this.backgroundSprite).to({ alpha: backgroundAlpha }, duration, Phaser.Easing.Quadratic.In, true);
    game.add.tween(this.hudTop).to({ y: -40, alpha: 0 }, duration, Phaser.Easing.Quadratic.In, true);
    game.add.tween(this.hudBottom).to({ y: 40, alpha: 0 }, duration, Phaser.Easing.Quadratic.In, true);
  }
  
  /**
   * Plays the character close shot sequence with a countdown timer.
   * @param {number} duration - Total duration of the close shot in milliseconds
   */
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
  
  /**
   * Plays a full-screen glitch animation layered over the HUD.
   * @param {number} duration - Lifespan of the glitch effect in milliseconds
   */
  showGlitchAnimation(duration = 1000) {
    const glitch = game.add.sprite(0, 0, 'ui_glitch_animation');
    glitch.animations.add('glitch', [0, 1, 2, 3, 4, 5, 6], 12, true);
    glitch.animations.play('glitch');
    glitch.lifespan = duration;
    glitch.blendMode = PIXI.blendModes.ADD;
    this.overHud.addChild(glitch);
  }
  
  /**
   * Plays the full combo (or flawless) celebration overlay when reached.
   */
  showFullCombo() {
    if (this.fullComboAnimationStarted) {
      return;
    }
    
    // Create overlay parent
    /** @type {Phaser.Sprite} Full combo celebration overlay */
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
    
    /** @type {Phaser.Sprite} Gradient layer over the full combo background */
    this.fullComboGradient = game.add.sprite(0, 0, bitmap);
    this.fullComboGradient.alpha = 0;
    this.fullComboOverlay.addChild(this.fullComboGradient);
    
    // Create full combo message
    /** @type {Phaser.Graphics} Bordered bar behind the full combo message */
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
    
    /** @type {Text} "FULL COMBO!!" or "FLAWLESS!!" message */
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
  
  /**
   * Draws a background element onto the background canvas, handling errors.
   * @param {HTMLImageElement|HTMLVideoElement} element - The element to draw
   */
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
  
  /**
   * Draws the default chart background as a fallback when one fails to load.
   */
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
  
  /**
   * Clears the background canvas to black and reveals the gradient overlay.
   */
  clearBackground() {
    this.backgroundSprite.ctx.fillStyle = "#000000";
    this.backgroundSprite.ctx.fillRect(0, 0, game.width, game.height);
    this.backgroundSprite.dirty();
    this.backgroundGradient.visible = true;
  }  
  
  /**
   * Loads or reuses a background image and draws it onto the canvas.
   * @param {string} filename - Chart identifier for the background
   * @param {string} url - URL of the background image
   */
  loadBackgroundImage(filename, url) {
    if (filename == 'undefined' || !filename || !url) return;
    
    // Pause any existing video
    if (this.video) {
      this.video.pause();
    }
    
    // Check if there is already a background preloaded
    if (this.preloadedBackgroundElements[filename]) {
      const element = this.preloadedBackgroundElements[filename];
      
      // Handle previous bg effects
      this.handlePreviousBgFadeOut();
      
      // Check if element is errored
      if (!element || element.__errored) {
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
  
  /**
   * Loads or reuses a background video and begins playback.
   * @param {string} filename - Chart identifier for the background
   * @param {string} url - URL of the background video
   * @param {Function} [onloadCallback] - Called when the video is ready
   * @param {Function} [onerrorCallback] - Called if the video fails to load
   */
  loadBackgroundVideo(filename, url, onloadCallback, onerrorCallback) {
    if (filename == 'undefined' || !filename || !url) {
      onerrorCallback?.();
      return;
    }
        
    // Pause any existing video
    if (this.video && this.video != this.preloadedBackgroundElements[filename]) {
      this.video.pause();
    }
    
    // Check if there is already a background preloaded
    if (this.preloadedBackgroundElements[filename]) {
      const element = this.preloadedBackgroundElements[filename];
      
      // Handle previous bg effects
      this.handlePreviousBgFadeOut();
      
      // Check if element is errored
      if (!element || element.__errored) {
        console.warn(`Preloaded video is errored: ${filename}`);
        this.drawFallbackBackground();
        onerrorCallback?.();
        return;
      }
      
      // Use the preloaded background
      /** @type {HTMLVideoElement} Video element currently used as the background */
      this.video = element;
      
      onloadCallback?.();
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
        onloadCallback?.();
      }, { once: true });
      
      video.onerror = () => {
        console.warn(`Failed to load video in realtime: ${url}`);
        video.__errored = true;
        this.preloadedBackgroundElements[filename] = video;
        this.drawFallbackBackground();
        onerrorCallback?.();
      };
    }
    
    if (this.video && !this.video.__errored) {
      this.playVideo(this.video);
      this.backgroundGradient.visible = false;
      this.video.onload = () => {
        onloadCallback?.();
        this.video.onload = false;
      };
      this.video.onerror = () => {
        console.warn(`Video playback error: ${filename}`);
        this.video.__errored = true;
        this.backgroundGradient.visible = true;
        this.drawFallbackBackground();
        onerrorCallback?.();
        this.video.onerror = null;
      };
    }
  }
  
  /**
   * Starts playback of the given video and hides the gradient overlay.
   * @param {HTMLVideoElement} video - The video element to play
   */
  playVideo(video) {
    this.video = video || this.video;
    this.video.play();
    this.video.currentTime = 0;
    this.backgroundGradient.visible = false;
  }
  
  /**
   * Applies a chart background at its scheduled beat, honoring fade options.
   * @param {Object} bg - The background descriptor from the chart
   */
  applyBackground(bg) {
    if (bg.file == '-nosongbg-') {
      this.clearBackground();
      this.currentBackground = bg;
      return;
    }
    
    // Cancel any existing fade tween
    if (this._bgFadeTween) {
      this._bgFadeTween.stop();
      this._bgFadeTween = null;
    }
    
    // Cancel any existing effect timer
    if (this._bgEffectTimer) {
      clearTimeout(this._bgEffectTimer);
      this._bgEffectTimer = null;
    }
    
    if (bg.type == 'video') {
      this.loadBackgroundVideo(bg.file, bg.url, () => {
        this.applyBgEffects(bg);
      }, () => {
        this.backgroundSprite.alpha = Account.settings.backgroundOpacity;
      });
    } else {
      this.loadBackgroundImage(bg.file, bg.url);
      this.applyBgEffects(bg);
    }
    this.currentBackground = bg;
  }
  
  /**
   * Handles fade-in, scheduled fade-out and opacity for a background.
   * @param {Object} bg - The background descriptor being applied
   */
  applyBgEffects(bg) {
    const alpha = bg.type == 'video' ? Account.settings.videoBackgroundOpacity : Account.settings.backgroundOpacity;
    const targetAlpha = parseFloat(bg.opacity) * alpha;
    
    // Cancel any existing fade tween
    if (this._bgFadeTween) {
      this._bgFadeTween.stop();
      this._bgFadeTween = null;
    }
    
    // Handle fade in
    if (bg.fadeIn && bg.fadeIn > 0) {
      this.backgroundSprite.alpha = 0;
      /** @type {?Phaser.Tween} Tween animating the current background fade-in */
      this._bgFadeTween = game.add.tween(this.backgroundSprite)
        .to({ alpha: targetAlpha }, bg.fadeIn * 1000, Phaser.Easing.Quadratic.InOut, true);
    } else {
      this.backgroundSprite.alpha = targetAlpha;
    }
    
    // Handle fade out (schedule it)
    if (bg.fadeOut && bg.fadeOut > 0) {
      // Calculate duration until fade out starts
      // We need to know when this background will be replaced
      // Since we don't know when the next BG change is, we store the fadeOut info
      /** @type {?Object} Pending fade-out parameters for the current background */
      this._pendingFadeOut = {
        duration: bg.fadeOut * 1000,
        targetAlpha: 0
      };
    } else {
      this._pendingFadeOut = null;
    }
    
    // Handle effect (bg.effect)
    // StepMania effects: 0=none, 1=stretch, 2=scroll, 3=...
    if (bg.effect && bg.effect > 0) {
      // Commented, the existing implementation is poor and doesn't handle them correctly
      // this.applyBgEffect(bg);
    }
  }
  
  /**
   * Applies the StepMania-style background effect loop (stretch, scroll or pulse).
   * @param {Object} bg - The background descriptor carrying an effect id
   */
  applyBgEffect(bg) {
    // Cancel existing effect
    if (this._bgEffectTimer) {
      clearInterval(this._bgEffectTimer);
      this._bgEffectTimer = null;
    }
    
    switch (parseInt(bg.effect)) {
      case 1: // Stretch - horizontal distortion
        /** @type {?number} Interval id driving the active background effect */
        this._bgEffectTimer = setInterval(() => {
          if (!this.backgroundSprite || this.shootingDown) {
            clearInterval(this._bgEffectTimer);
            this._bgEffectTimer = null;
            return;
          }
          const wave = Math.sin(Date.now() * 0.002) * 0.05 + 1;
          this.backgroundSprite.scale.x = wave;
        }, 50);
        break;
        
      case 2: // Scroll - vertical pan
        this._bgEffectTimer = setInterval(() => {
          if (!this.backgroundSprite || this.shootingDown) {
            clearInterval(this._bgEffectTimer);
            this._bgEffectTimer = null;
            return;
          }
          const offset = (Date.now() * 0.02) % 112;
          this.backgroundSprite.crop(new Phaser.Rectangle(0, offset, 240, 140));
        }, 50);
        break;
        
      case 3: // Pulse - alpha oscillation
        this._bgEffectTimer = setInterval(() => {
          if (!this.backgroundSprite || this.shootingDown) {
            clearInterval(this._bgEffectTimer);
            this._bgEffectTimer = null;
            return;
          }
          const pulse = 0.6 + Math.sin(Date.now() * 0.003) * 0.4;
          this.backgroundSprite.alpha = parseFloat(bg.opacity) * pulse * 
            (bg.type == 'video' ? Account.settings.videoBackgroundOpacity : Account.settings.backgroundOpacity);
        }, 50);
        break;
        
      default:
        // No effect
        break;
    }
  }
  
  /**
   * Fades out the previous background when a fade-out was scheduled for it.
   */
  handlePreviousBgFadeOut() {
    // If there's a pending fade out for the current background
    if (this._pendingFadeOut && this.currentBackground) {
      // Fade out current background
      if (this._bgFadeTween) {
        this._bgFadeTween.stop();
      }
      this._bgFadeTween = game.add.tween(this.backgroundSprite)
        .to({ alpha: 0 }, this._pendingFadeOut.duration, Phaser.Easing.Quadratic.InOut, true)
        .onComplete.add(() => {
          if (this.backgroundSprite) {
            this.backgroundSprite.alpha = 0;
          }
        });
      this._pendingFadeOut = null;
    }
  }
  
  /**
   * Collects the game results from a player into a plain result object.
   * @param {Object} [player] - The player whose results are gathered
   * @returns {Object} The game results summary
   */
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
      difficultyRating: this.song.chart.difficulties[this.difficultyIndex].rating
    };
  }
  
  /**
   * Restarts the current song with the same settings.
   */
  restartSong() {
    game.state.start("Play", true, false, this.originalSong, this.difficultyIndex, this.playtestMode, this.autoplay, this.playlistKey);
  }
  
  /**
   * Finalizes the run: updates stats, experience and records, then opens Results.
   */
  songEnd() {
    // Forget preloaded backgrounds
    setTimeout(() => {
      Object.entries(this.preloadedBackgroundElements).map(entry => entry[1] || null).forEach(element => {
        if (element) {
          element.src = "";
        }
      });
    });
    
    // Return to editor if on playtest mode
    if (this.playtestMode) {
      game.state.start("Editor", true, false, this.originalSong);
      return;
    }
    
    // Update character stats
    const gameResults = this.getGameResults(this.player);
    
    // Track full combo and flawless combo stats
    const judgements = this.player.judgementCounts;
    const totalNotes = this.player.totalNotes;
    const isFullCombo = judgements.miss === 0;
    const isFlawless = isFullCombo && (judgements.marvelous + judgements.perfect) === totalNotes;
    const isAbsoluteFlawless = isFullCombo && judgements.marvelous === totalNotes;
    
    if (!this.autoplay) {
      // Update stats
      if (isFullCombo) {
        Account.stats.fullCombos = (Account.stats.fullCombos || 0) + 1;
        
        // Update full combo streak
        Account.stats.currentFullComboStreak = (Account.stats.currentFullComboStreak || 0) + 1;
        if (Account.stats.currentFullComboStreak > (Account.stats.maxFullComboStreak || 0)) {
          Account.stats.maxFullComboStreak = Account.stats.currentFullComboStreak;
        }
        
        // Track flawless
        if (isFlawless) {
          Account.stats.flawlessFullCombos = (Account.stats.flawlessFullCombos || 0) + 1;
          Account.stats.flawlessStreak = (Account.stats.flawlessStreak || 0) + 1;
        } else {
          Account.stats.flawlessStreak = 0;
        }
        
        // Track absolute flawless
        if (isAbsoluteFlawless) {
          Account.stats.absoluteFlawless = (Account.stats.absoluteFlawless || 0) + 1;
        }
      } else {
        // Reset streaks on non-full combo
        Account.stats.currentFullComboStreak = 0;
        Account.stats.flawlessStreak = 0;
      }
      
      saveAccount();
    }
    
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
      gameResults: gameResults,
      playlistKey: this.playlistKey,
      isFullCombo: isFullCombo,
      isFlawless: isFlawless,
      isAbsoluteFlawless: isAbsoluteFlawless
    };
    
    // Hide HUD
    this.hideHud(500, 1, 0);
    
    game.state.start("Results", true, false, gameData);
  }
  
  /**
   * Accumulates the account statistics from the completed game.
   * @param {Object} gameResults - The game results to tally
   */
  updateUserStats(gameResults) {
    if (!Account.stats) {
      Account.stats = { ...DEFAULT_ACCOUNT.stats };
    }
    
    if (gameResults.complete) {
      Account.stats.totalGamesPlayed++;
      const difficultyType = this.song.chart.difficulties[this.difficultyIndex].type;
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
  
  /**
   * Toggles between the paused and running states of the song.
   */
  togglePause() {
    if (this.isAnimating) return;
    
    if (!this.isPaused) {
      this.pause();
    } else {
      this.resume();
    }
  }
  
  /**
   * Pauses gameplay and playback, then shows the pause menu.
   */
  pause() {
    if (!this.started) return;
    this.isPaused = true;
    this.pauseStartTime = game.time.now;
    this.audio?.pause();
    this.video?.pause();
    this.showPauseMenu();
  }
  
  /**
   * Resumes gameplay and playback, then hides the pause menu.
   */
  resume() {
    this.isPaused = false;
    this.totalPausedDuration += game.time.now - this.pauseStartTime;
    this.video?.play();
    this.audio?.play();
    this.hidePauseMenu();
  }
  
  /**
   * Builds a text block listing the current judgement counts.
   * @returns {string} The judgement text used in the pause menu
   */
  getStatsContent() {
    return Object.entries(this.player.judgementCounts).map(entry => `${entry[0]}: ${entry[1]}`.toUpperCase()).join('\n');
  }
  
  /**
   * Shows the pause menu with continue, autoplay, restart, retry and quit options.
   */
  showPauseMenu() {
    /** @type {Phaser.Graphics} Dark overlay dimming the gameplay behind the pause menu */
    this.pauseBg = game.add.graphics(0, 0);
    
    this.pauseBg.beginFill(0x000000, 0.6);
    this.pauseBg.drawRect(0, 0, game.width, game.height);
    this.pauseBg.endFill();
    
    /** @type {Text} Label listing the current judgement counts */
    this.pauseStatsText = new Text(game.width - 20, game.height / 2 + 4, "", FONTS.default);
    this.pauseStatsText.anchor.set(1, 0.5);
    this.pauseStatsText.tint = 0xECECEC;
    
    const statsContent = this.getStatsContent();
    
    this.pauseStatsText.write(statsContent);
    
    /** @type {CarouselMenu} Pause menu options (continue, autoplay, restart, quit) */
    this.pauseCarousel = new CarouselMenu(10, game.height / 2 - 20, 80, 60, {
      bgcolor: "brown",
      fgcolor: "#ffffff",
      align: "center",
      animate: true
    });
    
    this.pauseCarousel.addItem(__("Continue||Continuar"), () => this.resume());
    if (this.autoplay && !this.playtestMode) {
      this.pauseCarousel.addItem(__("(Disable|Desactivar) Autoplay"), () => {
        Account.settings.autoplay = false;
        game.state.start("SongSelect", true, false, null, null, true, this.playlistKey);
      });
    }
    if (this.playtestMode) {
      if (this.autoplay) {
        this.pauseCarousel.addItem(__("(Disable|Desactivar) Autoplay"), () => game.state.start("Play", true, false, this.song, this.difficultyIndex, true, false, this.playlistKey));
      } else {
        this.pauseCarousel.addItem(__("(Enable|Activar) Autoplay"), () => game.state.start("Play", true, false, this.song, this.difficultyIndex, true, true, this.playlistKey));
      }
    }
    this.pauseCarousel.addItem("Restart||Reiniciar", () => this.restartSong());
    this.pauseCarousel.addItem(this.playtestMode ? __("< (Back To Editor|Volver Al Editor)") : __("Give Up||Rendirse"), () => this.songEnd());
    
    game.onMenuIn.dispatch('pause', this.pauseCarousel);
    
    if (!this.playtestMode) {
      this.pauseCarousel.addItem(__("QUIT||SALIR"), () => game.state.start("MainMenu"));
    }
    
    this.pauseCarousel.onCancel.add(() => this.resume());
  }
  
  /**
   * Removes the pause menu objects from the scene.
   */
  hidePauseMenu() {
    if (this.pauseCarousel) {
      this.pauseBg.destroy();
      this.pauseStatsText.destroy();
      this.pauseCarousel.destroy();
      this.pauseCarousel = null;
    }
  }
  
  /**
   * Returns the current play time in seconds and beats, accounting for pauses.
   * @returns {Object} Object with numeric "now" and "beat" fields
   */
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
  
  /**
   * Converts a time in seconds to beats using the player's timing.
   * @param {number} sec - Time in seconds
   * @returns {number} The equivalent beat
   */
  secToBeat(sec) {
    return this.player ? this.player.secToBeat(sec) : 0;
  }
  
  /**
   * Enqueues and applies chart backgrounds as their beats arrive, then updates video.
   */
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
  
  /**
   * Redraws the current video frame at the configured frame rate.
   */
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
  
  /**
   * Phaser lifecycle hook called every frame; drives the main gameplay loop.
   */
  update() {
    gamepad.update();
        
    if (this.isPaused) return;
    
    // Pause with start button
    if (gamepad.pressed.start && !this.lastStart) {
      this.togglePause();
    }
    /** @type {boolean} Start button state from the previous frame */
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
    if (gamepad.pressed.select) {
      this.metronome.toggle();
    }
    
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
  
  /**
   * Phaser render hook that renders the player's note objects.
   */
  render() {
    if (this.player) {
      this.player.render();
    }
  }
  
  /**
   * Phaser lifecycle hook called when leaving the state; tears down playback.
   */
  shutdown() {
    this.shootingDown = true;
    
    if (this._bgEffectTimer) {
      clearInterval(this._bgEffectTimer);
      this._bgEffectTimer = null;
    }
    
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
    
    if (this.temperature) {
      this.temperature.destroy();
      this.temperature = null;
    }
    
    // Stop recording and show video
    if (window.recordNextGame) {
      game.recorder.stop();
      window.recordNextGame = false;
    }
    
    this.song = null;
  }
}
