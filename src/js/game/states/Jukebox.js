class Jukebox {
  init(songs = null, startIndex = 0) {
    this.songs = songs || (window.localSongs && window.externalSongs ? [...window.localSongs, ...window.externalSongs] : window.localSongs) || [];
    this.currentIndex = startIndex || 0;
    this.currentSong = this.songs[this.currentIndex];
    this.isPlaying = false;
    this.isShuffled = false;
    this.menuVisible = false;
    this.originalSongOrder = [...this.songs];
    this.visualizerMode = 'symmetrical';
    this.seekSpeed = 1; // seconds per key press
    this.lastSeekTime = 0;
    this.seekCooldown = 60; // ms between seek actions
    this.doublePressTimeout = 200; // ms between presses to be considered a double press
    
    // Background system
    this.currentBackground = null;
    this.backgroundQueue = [];
    this.backgroundSprite = null;
    this.videoElement = null;
    
    // Visualizer
    this.visualizer = null;
  }

  create() {
    game.camera.fadeIn(0x000000);
    
    // Setup background
    this.setupBackground();
    
    // Setup audio player
    this.setupAudioPlayer();
    
    // Setup UI
    this.setupUI();
    
    // Setup visualizer
    this.setupVisualizer();
    
    // Add navigation hint
    this.navigationHint = new NavigationHint(3);
    
    // Load first song
    this.loadSong(this.currentIndex);
    
    // Execute addon behaviors
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  setupBackground() {
    this.backgroundSprite = game.add.sprite(0, 0);
    this.backgroundSprite.alpha = 0.4;
    
    // Create video element for background videos
    this.videoElement = document.createElement("video");
    this.videoElement.muted = true;
    this.videoElement.loop = true;
  }

  setupAudioPlayer() {
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    this.audioElement = document.createElement("audio");
    this.audioElement.volume = [0,25,50,75,100][Account.settings.volume] / 100;
    
    this.audioElement.addEventListener('timeupdate', () => {
      this.updateProgressBar();
      this.updateTimeDisplay();
    });
    
    this.audioElement.addEventListener('ended', () => {
      this.nextSong();
    });
  }

  setupUI() {
    // Background gradient for readability
    this.uiBackground = game.add.graphics(0, 0);
    this.uiBackground.beginFill(0x000000, 0.7);
    this.uiBackground.drawRect(0, 80, game.width, 32);
    this.uiBackground.endFill();
    
    // Song banner
    this.bannerSprite = game.add.sprite(4, 4);
    
    // Song metadata
    this.songTitle = new Text(104, 4, "", FONTS.shaded);
    this.songArtist = new Text(104, 14, "", FONTS.default);
    this.songCredit = new Text(104, 24, "", FONTS.default);
    
    // Playback time displays
    this.currentTimeText = new Text(4, 84, "0:00", FONTS.default);
    this.durationText = new Text(188, 84, "0:00", FONTS.default);
    this.durationText.anchor.x = 1;
    
    // Progress bar
    this.progressBarBg = game.add.graphics(30, 86);
    this.progressBarBg.lineStyle(2, 0x666666, 1);
    this.progressBarBg.moveTo(0, 0);
    this.progressBarBg.lineTo(132, 0);
    
    this.progressBar = game.add.graphics(30, 86);
    
    const center = game.width / 2;
    
    // Playback controls
    // TODO: Implement playback controls
  }

  setupVisualizer() {
    this.visualizer = new FullScreenAudioVisualizer(this.audioElement, {
      visualizationType: this.visualizerMode,
      barColor: 0x76fcde,
      barWidth: 3,
      barSpacing: 1,
      barBaseHeight: 5,
      barMaxHeight: 40,
      alpha: 0.6,
      fftSize: 512,
      smoothing: 0.7
    });
  }

  loadSong(index) {
    if (index < 0 || index >= this.songs.length) return;
    
    // Stop current playback
    this.audioElement.pause();
    this.isPlaying = false;
    
    // Update current index and song
    this.currentIndex = index;
    this.currentSong = this.songs[this.currentIndex];
    
    // Load audio
    this.audioElement.src = this.currentSong.audioUrl;
    
    // Update UI
    this.updateSongDisplay();
    this.updateBackground();
    
    // Start playback
    this.play();
  }

  updateSongDisplay() {
    const song = this.currentSong;
    
    // Update text displays
    this.songTitle.write(song.titleTranslit || song.title || "Unknown Title");
    this.songArtist.write(`Artist: ${song.artistTranslit || song.artist || "Unknown"}`);
    this.songCredit.write(`Credit: ${song.credit || "Unknown"}`);
    
    // Load banner
    if (song.banner && song.banner !== "no-media") {
      const bannerImg = new Image();
      bannerImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 96;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bannerImg, 0, 0, 96, 32);
        const texture = PIXI.Texture.fromCanvas(canvas);
        this.bannerSprite.loadTexture(texture);
      };
      bannerImg.src = song.banner;
    } else {
      this.bannerSprite.loadTexture(null);
    }
  }

  updateBackground() {
    // Clear current background
    this.backgroundSprite.loadTexture(null);
    this.videoElement.src = "";
    
    // Load song background
    if (this.currentSong.background && this.currentSong.background !== "no-media") {
      const bgImg = new Image();
      bgImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 192;
        canvas.height = 112;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgImg, 0, 0, 192, 112);
        const texture = PIXI.Texture.fromCanvas(canvas);
        this.backgroundSprite.loadTexture(texture);
      };
      bgImg.src = this.currentSong.background;
    }
    
    // Handle background videos
    if (this.currentSong.videoUrl) {
      this.videoElement.src = this.currentSong.videoUrl;
      this.videoElement.play();
      
      // Update video frame periodically
      this.lastVideoUpdate = game.time.now;
    }
  }

  updateDurationDisplay() {
    const duration = this.audioElement.duration;
    if (isNaN(duration) || duration == Infinity) {
      this.durationText.write("--:--");
      return;
    };
    
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    this.durationText.write(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }

  updateProgressBar() {
    const currentTime = this.audioElement.currentTime;
    const duration = this.audioElement.duration;
    
    if (isNaN(duration) || duration === 0) return;
    
    const progress = currentTime / duration;
    const barWidth = 132 * progress;
    
    this.progressBar.clear();
    this.progressBar.lineStyle(2, 0x76fcde, 1);
    this.progressBar.moveTo(0, 0);
    this.progressBar.lineTo(barWidth, 0);
  }

  updateTimeDisplay() {
    const currentTime = this.audioElement.currentTime;
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    this.currentTimeText.write(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }

  play() {
    this.audioElement.play().then(() => {
      this.isPlaying = true;
    }).catch(error => {
      console.warn("Playback failed:", error);
      this.isPlaying = false;
    });
  }

  pause() {
    this.audioElement.pause();
    this.isPlaying = false;
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  nextSong() {
    let nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.songs.length) {
      nextIndex = 0; // Loop to beginning
    }
    this.loadSong(nextIndex);
  }

  previousSong() {
    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.songs.length - 1; // Loop to end
    }
    this.loadSong(prevIndex);
  }

  toggleShuffle() {
    this.isShuffled = !this.isShuffled;
    
    if (this.isShuffled) {
      // Shuffle the playlist (Fisher-Yates algorithm)
      const shuffled = [...this.songs];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      this.songs = shuffled;
    } else {
      // Restore original order
      this.songs = [...this.originalSongOrder];
    }
  }

  seekForward() {
    const currentTime = this.audioElement.currentTime;
    const newTime = Math.min(currentTime + this.seekSpeed, this.audioElement.duration || Infinity);
    this.audioElement.currentTime = newTime;
  }

  seekBackward() {
    const currentTime = this.audioElement.currentTime;
    const newTime = Math.max(currentTime - this.seekSpeed, 0);
    this.audioElement.currentTime = newTime;
  }

  changeVisualizerMode() {
    const modes = ['bars', 'symmetrical', 'waveform', 'circular'];
    const currentIndex = modes.indexOf(this.visualizerMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.visualizerMode = modes[nextIndex];
    
    this.visualizer.setVisualizationType(this.visualizerMode);
    this.visualizerModeText.write(`Visualizer: ${this.visualizerMode}`);
  }

  showMenu() {
    this.menuVisible = true;
    
    const menu = new CarouselMenu(60, 40, 72, 40, {
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      align: 'center'
    });
    
    menu.addItem("Resume", () => {
      menu.destroy();
    });
    
    menu.addItem("Play/Pause", () => {
      this.togglePlayback();
      menu.destroy();
    });
    
    menu.addItem("Next Song", () => {
      this.nextSong();
      menu.destroy();
    });
    
    menu.addItem("Previous Song", () => {
      this.previousSong();
      menu.destroy();
    });
    
    menu.addItem("Toggle Shuffle", () => {
      this.toggleShuffle();
      menu.destroy();
    });
    
    menu.addItem("Exit Jukebox", () => {
      this.exitJukebox();
    });
    
    menu.onCancel.add(() => {
      menu.destroy();
    });
    
    menu.events.onDestroy.add(() => this.menuVisible = false);
  }

  exitJukebox() {
    // Clean up
    this.audioElement.pause();
    this.audioElement.src = "";
    
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = "";
    }
    
    if (this.visualizer) {
      this.visualizer.destroy();
    }
    
    // Return to main menu
    game.state.start("MainMenu");
  }

  update() {
    // Update visualizer
    if (this.visualizer) {
      this.visualizer.update();
    }
    
    this.updateDurationDisplay();
    
    // Update video background if playing
    if (this.videoElement.src && this.videoElement.readyState >= 2) {
      const currentTime = game.time.now;
      if (currentTime - this.lastVideoUpdate >= 33) { // ~30fps
        this.lastVideoUpdate = currentTime;
        const canvas = document.createElement('canvas');
        canvas.width = 192;
        canvas.height = 112;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.videoElement, 0, 0, 192, 112);
        const texture = PIXI.Texture.fromCanvas(canvas);
        this.backgroundSprite.loadTexture(texture);
      }
    }
    
    this.handleInput();
  }

  handleInput() {
    const currentTime = game.time.now;
    
    // Update gamepad
    gamepad.update();
    
    // Don't trigger actions if menu is visible
    if (this.menuVisible) return;
    
    // Play/Pause
    if (gamepad.pressed.a) {
      this.togglePlayback();
    }
    
    // Shuffle toggle
    if (gamepad.pressed.b) {
      this.toggleShuffle();
    }
    
    // Visualizer mode change
    if (gamepad.pressed.select) {
      this.changeVisualizerMode();
    }
    
    // Menu
    if (gamepad.pressed.start) {
      this.showMenu();
    }
    
    // Seek handling with cooldown
    if (currentTime - this.lastSeekTime > this.seekCooldown) {
      // Single press - seek
      if (gamepad.held.left) {
        this.seekBackward();
        this.lastSeekTime = currentTime;
      }
      
      if (gamepad.held.right) {
        this.seekForward();
        this.lastSeekTime = currentTime;
      }
    }
      
    // Double press detection for song change
    if (gamepad.pressed.left && currentTime - this.lastLeftPress < this.doublePressTimeout) {
      this.previousSong();
      this.lastSeekTime = currentTime;
    }
      
    if (gamepad.pressed.right && currentTime - this.lastRightPress < this.doublePressTimeout) {
      this.nextSong();
      this.lastSeekTime = currentTime;
    }
    
    // Track press times for double press detection
    if (gamepad.pressed.left) {
      this.lastLeftPress = currentTime;
    }
    
    if (gamepad.pressed.right) {
      this.lastRightPress = currentTime;
    }
  }

  shutdown() {
    // Clean up resources
    this.audioElement.pause();
    this.audioElement.src = "";
    
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = "";
    }
    
    if (this.visualizer) {
      this.visualizer.destroy();
    }
  }
}
