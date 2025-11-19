class Play {
  init(song, difficultyIndex) {
    this.song = song;
    this.difficultyIndex = difficultyIndex;
    this.player = null;
    this.backgroundQueue = [];
    this.currentBackground = null;
    this.isPaused = false;
    this.pauseStartTime = 0;
    this.totalPausedDuration = 0;
    this.pendingSongStart = false;
    this.audioEndListener = null;
    this.started = false;
    this.startTime = 0;
    this.autoplay = Account.settings.autoplay;
    this.userOffset = Account.settings.userOffset;
    this.lastVideoUpdateTime = 0;
    this.lyrics = null;
    this.hasLyricsFile = song.chart.lyrics ? true : false;
    this.visualizerType = Account.settings.visualizer || 'NONE';
    this.lastVisualizerUpdateTime = 0;
    this.metronome = null;
    this.gameRecorder = null;
    
    // Initialize character system
    this.characterManager = new CharacterManager();
    this.currentCharacter = this.characterManager.getCurrentCharacter();
    this.skillSystem = new CharacterSkillSystem(this.currentCharacter);
    
    // Save last song to Account
    Account.lastSong = {
      url: song.chart.audioUrl,
      title: song.chart.title,
      artist: song.chart.artist,
      sampleStart: song.chart.sampleStart || 0,
      isExternal: song.chart.files !== undefined // Flag for external songs
    };
    saveAccount();
    
    // Game constants
    this.JUDGE_WINDOWS = JUDGE_WINDOWS;
    
    this.SCORE_VALUES = SCORE_VALUES;
  }
  
  create() {
    // Ensure background music is stopped during gameplay
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    game.camera.fadeIn(0x000000);
    
    // Create background
    this.backgroundLayer = game.add.group();
    this.backgroundSprite = game.add.sprite(0, 0, null, 0, this.backgroundLayer);
    this.backgroundSprite.alpha = 0.6;
    this.backgroundCanvas = document.createElement("canvas");
    this.backgroundCanvas.width = 192;
    this.backgroundCanvas.height = 112;
    this.backgroundCtx = this.backgroundCanvas.getContext("2d");
    
    // Create audio element
    this.audio = document.createElement("audio");
    this.audio.src = this.song.chart.audioUrl;
    this.audio.volume = [0,25,50,75,100][Account.settings.volume] / 100;
    
    this.visibilityChangeListener = () => {
      if (document.hidden) {
        if (!this.isPaused) this.pause();
      }
    };
    
    window.addEventListener('visibilitychange', this.visibilityChangeListener);
    
    // Create video element for background videos
    this.video = document.createElement("video");
    this.video.muted = true;
    this.video.loop = true;
    
    this.createHud();
    
    this.setupLyrics();
    
    this.setupPlayer();
    
    this.metronome = new Metronome(this);
    
    this.songStart();
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  createHud() {
    this.backgroundGradient = new BackgroundGradient(0, 0.4, 5000);

    this.hud = game.add.sprite(0, 0, "ui_hud_background", 0);
    
    const difficulty = this.song.chart.difficulties[this.song.difficultyIndex];
    
    this.difficultyBanner = game.add.sprite(0, 0, "ui_difficulty_banner", 0);
    this.difficultyBanner.tint = this.getDifficultyColor(difficulty.rating);
    this.hud.addChild(this.difficultyBanner);
    
    this.difficultyTypeText = new Text(5, 1, difficulty.type.substr(0, 7), null, this.difficultyBanner);
    
    const title = this.song.chart.titleTranslit || this.song.chart.title;
    
    this.songTitleText = new Text(34, 1, title, null, this.hud);
    
    this.playerName = new Text(4, 8, "Miku", FONTS.shaded, this.hud);
    this.playerName.tint = 0xffffff;
    
    if (title.length > 28) this.songTitleText.scrollwrite(title, 28);
    
    this.scoreText = new Text(22, 12, "0".repeat(9), null, this.hud);
    
    this.lifebarStart = game.add.sprite(21, 8, "ui_lifebar", 0);
    this.lifebarMiddle = game.add.sprite(1, 0, "ui_lifebar", 1);
    this.lifebarMiddle.width = 104;
    this.lifebarEnd = game.add.sprite(104, 0, "ui_lifebar", 2);
    
    this.hud.addChild(this.lifebarStart);
    this.lifebarStart.addChild(this.lifebarMiddle);
    this.lifebarStart.addChild(this.lifebarEnd);
    
    // Autoplay text
    this.autoplayText = new Text(4, 90, this.autoplay ? "AUTOPLAY" : "", FONTS.stroke, this.hud);
    
    this.healthText = new Text(137, 8, "100", FONTS.number, this.hud);
    this.healthText.anchor.x = 1;
    
    this.judgementText = new Text(game.width / 2, 60, "", FONTS.shaded);
    this.judgementText.anchor.set(0.5);
    
    this.acurracyBar = game.add.sprite(41, 108, "ui_acurracy_bar");
    this.hud.addChild(this.acurracyBar);
    
    this.comboText = new Text(191, 106, "0", FONTS.combo);
    this.comboText.anchor.set(1);
    
    this.createVisualizer();
  }
  
  createVisualizer() {
    const visualizerX = 2;
    const visualizerY = 103;
    const visualizerWidth = 36;
    const visualizerHeight = 7;

    // Remove existing visualizer
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }

    // Create new visualizer based on setting
    switch (this.visualizerType) {
      case 'ACURRACY':
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
      this.hud.addChild(this.visualizer.graphics);
    }
  }
  
  setupPlayer() {
    this.player = new Player(this);
  }
  
  setupLyrics() {
    if (this.hasLyricsFile && game.cache.checkTextKey('song_lyrics')) {
      const lrcContent = game.cache.getText('song_lyrics');
      
      // Create lyrics text element
      this.lyricsText = new Text(game.width / 2, 72, "", FONTS.stroke);
      this.lyricsText.anchor.set(0.5);
      
      // Initialize lyrics system
      this.lyrics = new Lyrics({
        textElement: this.lyricsText,
        maxLineLength: 25,
        lrc: lrcContent
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
  
  setBackground() {
    // Set initial background
    if (this.song.chart.background && this.song.chart.background !== "no-media") {
      this.loadBackgroundImage(this.song.chart.background);
    } else {
      // Default black background
      this.backgroundCtx.fillStyle = "#000000";
      this.backgroundCtx.fillRect(0, 0, 192, 112);
      this.updateBackgroundTexture();
    }
  }
  
  songStart() {
    this.setBackground();
    
    const FIXED_DELAY = 2000; 
    
    const chartOffset = this.song.chart.offset || 0;
    
    this.startTime = game.time.now + FIXED_DELAY - chartOffset * 1000;
    
    setTimeout(() => {
      this.audio.play();
      this.started = true;
      if (window.recordNextGame) game.recorder.start(this.audio, 0);
    }, FIXED_DELAY + this.userOffset);
    
    this.showCharacterCloseShot(FIXED_DELAY + this.userOffset);
    
    this.audioEndListener = this.audio.addEventListener("ended", () => this.songEnd(), { once: true });
  }
  
  showCharacterCloseShot(duration) {
    // Same implementation as in skill system
    const displayTime = Math.max(500, duration - 200);
    const closeShot = new CharacterCloseShot(2, 103, this.currentCharacter);
    closeShot.visible = false;
    this.hud.addChild(closeShot);

    const noiseSprite = game.add.sprite(2, 103, 'character_noise');
    noiseSprite.animations.add('static', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    noiseSprite.animations.play('static');
    this.hud.addChild(noiseSprite);

    game.time.events.add(100, () => {
      noiseSprite.destroy();
      closeShot.visible = true;
    });

    game.time.events.add(displayTime, () => {
      closeShot.visible = false;
      const endNoise = game.add.sprite(2, 103, 'character_noise');
      endNoise.animations.add('static', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
      endNoise.animations.play('static');
      
      game.time.events.add(100, () => {
        endNoise.destroy();
        closeShot.destroy();
      });
    });
  }
  
  loadBackgroundImage(url) {
    const img = new Image();
    img.onload = () => {
      this.backgroundCtx.drawImage(img, 0, 0, 192, 112);
      this.updateBackgroundTexture();
    };
    img.src = url;
  }
  
  loadBackgroundVideo(url) {
    this.video.src = url;
    this.video.play();
    this.backgroundGradient.visible = false;
  }
  
  clearBackgroundImage() {
    this.backgroundSprite.loadTexture(null);
    this.backgroundGradient.visible = false;
  }
  
  applyBackground(bg) {
    if (bg.file == '-nosongbg-') {
      this.clearBackgroundImage();
    } else if (bg.type == 'video') {
      this.loadBackgroundVideo(bg.url);
    } else {
      this.loadBackgroundImage(bg.url);
      this.video.src = "";
      this.backgroundGradient.visible = true;
    }
    this.currentBackground = bg;
    this.applyBgEffects(bg);
  }
  
  applyBgEffects(bg) {
    if (bg.fadeIn) {
      this.backgroundSprite.alpha = 0;
      game.add.tween(this.backgroundSprite).to({ alpha: parseFloat(bg.opacity) * 0.6 }, 500, "Linear",true);
    } else {
      this.backgroundSprite.alpha = bg.opacity * 0.6;
    }
    
    // TODO: When applying bg effects take in account bg.fadeOut and bg.effect
  }
  
  updateBackgroundTexture() {
    const texture = PIXI.Texture.fromCanvas(this.backgroundCanvas);
    this.backgroundSprite.loadTexture(texture);
  }
  
  songEnd() {
    // Update character stats
    const gameResults = {
      score: this.player.score,
      accuracy: this.player.accuracy,
      maxCombo: this.player.maxCombo,
      judgements: { ...this.player.judgementCounts },
      skillsUsed: this.skillSystem.getSkillsUsed()
    };
    
    this.characterManager.updateCharacterStats(gameResults);
    
    // Pass game data to Results state
    const gameData = {
      song: this.song,
      difficultyIndex: this.difficultyIndex,
      player: this.player
    };
    
    game.state.start("Results", true, false, gameData);
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
    this.isPaused = true;
    this.pauseStartTime = game.time.now;
    this.audio?.pause();
    if (this.video.src) this.video?.pause();
    this.showPauseMenu();
  }
  
  resume() {
    this.isPaused = false;
    this.totalPausedDuration += game.time.now - this.pauseStartTime;
    this.hidePauseMenu();
    if (this.pendingSongStart) {
      this.pendingSongStart = false;
      this.songStart();
    } else {
      if (this.video.src) this.video?.play();
      this.audio?.play();
    }
  }
  
  showPauseMenu() {
    const x = 10;
    const y = game.height / 2 - 20;
    const width = 80;
    const height = 60;
    
    this.pauseBg = game.add.graphics(0, 0);
    
    this.pauseBg.beginFill(0x000000, 0.6);
    this.pauseBg.drawRect(0, 0, 192, 112);
    this.pauseBg.endFill();
    
    this.pauseCarousel = new CarouselMenu(x, y, width, height, {
      bgcolor: "brown",
      fgcolor: "#ffffff",
      align: "center",
      animate: true
    });
    
    this.pauseCarousel.addItem("CONTINUE", () => this.resume());
    if (Account.settings.autoplay) {
      this.pauseCarousel.addItem("DISABLE AUTOPLAY", () => {
        Account.settings.autoplay = false;
        game.state.start("SongSelect", true, false, null, null, true);
      });
    }
    this.pauseCarousel.addItem("RESTART", () => game.state.start("Play", true, false, this.song, this.difficultyIndex));
    this.pauseCarousel.addItem("GIVE UP", () => this.songEnd());
    
    game.onMenuIn.dispatch('pause', this.pauseCarousel);
    
    this.pauseCarousel.addItem("QUIT", () => game.state.start("MainMenu"));
    
    this.pauseCarousel.onCancel.add(() => this.resume());
  }
  
  hidePauseMenu() {
    if (this.pauseCarousel) {
      this.pauseBg.destroy();
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
    if (this.currentBackground && this.currentBackground.type == "video" && game.time.now - this.lastVideoUpdateTime >= (game.time.elapsedMS * 3)) {
      this.lastVideoUpdateTime = game.time.now;
      this.backgroundCtx.drawImage(this.video, 0, 0, 192, 112);
      this.updateBackgroundTexture();
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
    
    this.player.update();
    
    this.updateBackgrounds();
    
    this.hud.bringToTop();
    this.hud.alpha = this.player.gameOver ? 0.5 : 1;
    
    this.judgementText.bringToTop();
    this.comboText.bringToTop();
  }
  
  render() {
    if (this.player) {
      this.player.render();
    }
  }
  
  shutdown() {
    this.audio.removeEventListener("ended", this.audioEndListener);
    window.removeEventListener("visibilitychange", this.visibilityChangeListener);
    this.audio.pause();
    this.audio.src = "";
    this.audio = null;
    if (this.video.src) {
      this.video.pause();
      this.video.src = "";
      this.video = null;
    }
    this.song.chart.backgrounds.forEach(bg => bg.activated = false);
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }
    if (this.metronome) {
      this.metronome.destroy();
      this.metronome = null;
    }
    
    // Stop recording and show video
    if (window.recordNextGame) {
      game.recorder.stop();
      window.recordNextGame = false;
    }
  }
}
