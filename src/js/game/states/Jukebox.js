class Jukebox {
  init(songs = null, startIndex = 0) {
    this.songs = songs || (window.localSongs && window.externalSongs ? [...window.localSongs, ...window.externalSongs] : window.localSongs) || [];
    this.currentIndex = startIndex || 0;
    this.currentSong = this.songs[this.currentIndex];
    this.isPlaying = false;
    this.isShuffled = false;
    this.menuVisible = false;
    this.songListMenuVisible = false;
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
    
    // LRC system
    this.lyrics = null;
    this.hasLyrics = false;
    
    // Fullscreen mode
    this.fullscreenMode = false;
    
    // Button states and timers
    this.buttonActiveTimers = {};
    this.lastLeftPress = 0;
    this.lastRightPress = 0;
    this.lastSelectPress = 0;
    this.lastBPress = 0;
    
    // Remember playback position
    this.playbackPositions = {};
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
    
    // Setup lyrics
    this.setupLyrics();
    
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
    
    this.audioElement.addEventListener('error', (e) => {
      console.warn("Audio error:", e);
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
    this.songTitle = new Text(102, 4, "", FONTS.shaded);
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
    
    // Create playback controls
    this.createPlaybackControls();
    
    // Create lyrics display
    this.lyricsText = new Text(game.width / 2, 51, "", FONTS.stroke);
    this.lyricsText.anchor.set(0.5);
    this.lyricsText.visible = true; // Always visible
  }

  createPlaybackControls() {
    const centerX = game.width / 2;
    const yPos = 70;
    const buttonSpacing = 2; // 2px separation between buttons
    
    const buttonWidths = {
        visualization: 8,
        skip: 8,
        seek: 8,
        pause: 12,
        menu: 8
    };
    
    // Calculate total width including buttons and spacing
    const totalWidth = 
        buttonWidths.visualization + buttonSpacing +
        buttonWidths.skip + buttonSpacing +
        buttonWidths.seek + buttonSpacing +
        buttonWidths.pause + buttonSpacing +
        buttonWidths.seek + buttonSpacing +
        buttonWidths.skip + buttonSpacing +
        buttonWidths.menu;
    
    const startX = centerX - (totalWidth / 2);
    let currentX = startX;
    
    // Visualization button (leftmost)
    this.visualizationButton = game.add.sprite(currentX + buttonWidths.visualization/2, yPos, "ui_jukebox_visualization", 0);
    this.visualizationButton.anchor.set(0.5);
    currentX += buttonWidths.visualization + buttonSpacing;
    
    // Left skip button
    this.skipLeftButton = game.add.sprite(currentX + buttonWidths.skip/2, yPos, "ui_jukebox_skip", 0);
    this.skipLeftButton.anchor.set(0.5);
    this.skipLeftButton.scale.x = -1; // Flip horizontally for left arrow
    currentX += buttonWidths.skip + buttonSpacing;
    
    // Left seek button
    this.seekLeftButton = game.add.sprite(currentX + buttonWidths.seek/2, yPos, "ui_jukebox_seek", 0);
    this.seekLeftButton.anchor.set(0.5);
    this.seekLeftButton.scale.x = -1; // Flip horizontally for left arrow
    currentX += buttonWidths.seek + buttonSpacing;
    
    // Pause/Play toggle button (center) - larger button
    this.pauseButton = game.add.sprite(currentX + buttonWidths.pause/2, yPos, "ui_jukebox_pause_toggle", 0);
    this.pauseButton.anchor.set(0.5);
    currentX += buttonWidths.pause + buttonSpacing;
    
    // Right seek button
    this.seekRightButton = game.add.sprite(currentX + buttonWidths.seek/2, yPos, "ui_jukebox_seek", 0);
    this.seekRightButton.anchor.set(0.5);
    currentX += buttonWidths.seek + buttonSpacing;
    
    // Right skip button
    this.skipRightButton = game.add.sprite(currentX + buttonWidths.skip/2, yPos, "ui_jukebox_skip", 0);
    this.skipRightButton.anchor.set(0.5);
    currentX += buttonWidths.skip + buttonSpacing;
    
    // Fullscreen button (rightmost)
    this.menuButton = game.add.sprite(currentX + buttonWidths.menu/2, yPos, "ui_jukebox_menu", 0);
    this.menuButton.anchor.set(0.5);
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

  setupLyrics() {
    // Check if current song has lyrics
    if (this.currentSong.lyrics) {
      this.loadLyrics(this.currentSong.lyrics);
    } else {
      this.lyrics = null;
      this.hasLyrics = false;
    }
  }

  async loadLyrics(lyricsUrl) {
    try {
      const lrcContent = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', lyricsUrl);
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 0) { // 0 for file:// protocol
            resolve(xhr.responseText);
          } else {
            reject(new Error(`Failed to load lyrics: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error loading lyrics'));
        xhr.send();
      });
      
      this.lyrics = new Lyrics({
        textElement: this.lyricsText,
        maxLineLength: 25,
        lrc: lrcContent
      });
      
      this.hasLyrics = true;
      
    } catch (error) {
      console.warn("Could not load lyrics:", error);
      this.lyrics = null;
      this.hasLyrics = false;
    }
  }

  getSongKey(song) {
    // Create unique key for song
    if (song.folderName) {
      return `local_${song.folderName}`;
    } else if (song.audioUrl) {
      let hash = 0;
      for (let i = 0; i < song.audioUrl.length; i++) {
        const char = song.audioUrl.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return `external_${hash.toString(36)}`;
    }
    return `unknown_${Date.now()}`;
  }

  savePlaybackPosition() {
    if (this.audioElement && this.currentSong) {
      const songKey = this.getSongKey(this.currentSong);
      this.playbackPositions[songKey] = this.audioElement.currentTime;
    }
  }

  loadPlaybackPosition() {
    if (this.currentSong) {
      const songKey = this.getSongKey(this.currentSong);
      const savedPosition = this.playbackPositions[songKey];
      if (savedPosition && savedPosition > 0) {
        return savedPosition;
      }
    }
    return 0;
  }

  loadSong(index) {
    if (index < 0 || index >= this.songs.length) return;
    
    // Save current playback position before switching
    this.savePlaybackPosition();
    
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
    
    // Load lyrics for new song
    this.setupLyrics();
    
    // Start playback from saved position or beginning
    const startTime = this.loadPlaybackPosition();
    this.audioElement.currentTime = startTime;
    
    this.play();
  }

  updateSongDisplay() {
    const song = this.currentSong;
    
    // Update text displays
    this.songTitle.write(song.titleTranslit || song.title || "Unknown Title", 21);
    this.songArtist.write(song.artistTranslit || song.artist || "Unknown Artist", 21);
    this.songCredit.write(song.credit || "", 21);
    
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
    // TODO: Implement background videos correctly 
    
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

  updateFullscreenMode() {
    if (this.fullscreenMode) {
      // Fullscreen mode: background alpha 1, hide UI elements except lyrics
      this.backgroundSprite.alpha = 1;
      this.uiBackground.visible = false;
      this.bannerSprite.visible = false;
      this.songTitle.visible = false;
      this.songArtist.visible = false;
      this.songCredit.visible = false;
      this.currentTimeText.visible = false;
      this.durationText.visible = false;
      this.progressBarBg.visible = false;
      this.progressBar.visible = false;
      this.visualizationButton.visible = false;
      this.skipLeftButton.visible = false;
      this.seekLeftButton.visible = false;
      this.pauseButton.visible = false;
      this.seekRightButton.visible = false;
      this.skipRightButton.visible = false;
      this.menuButton.visible = false;
      this.navigationHint.visible = false;
    } else {
      // Normal mode: restore all UI elements
      this.backgroundSprite.alpha = 0.4;
      this.uiBackground.visible = true;
      this.bannerSprite.visible = true;
      this.songTitle.visible = true;
      this.songArtist.visible = true;
      this.songCredit.visible = true;
      this.currentTimeText.visible = true;
      this.durationText.visible = true;
      this.progressBarBg.visible = true;
      this.progressBar.visible = true;
      this.visualizationButton.visible = true;
      this.skipLeftButton.visible = true;
      this.seekLeftButton.visible = true;
      this.pauseButton.visible = true;
      this.seekRightButton.visible = true;
      this.skipRightButton.visible = true;
      this.menuButton.visible = true;
      this.navigationHint.visible = true;
    }
    
    // Lyrics are always visible in both modes
    this.lyricsText.visible = true;
  }

  toggleFullscreen() {
    this.fullscreenMode = !this.fullscreenMode;
    this.updateFullscreenMode();
  }

  updateButtonStates() {
    const currentTime = game.time.now;
    
    // Update menu button based on active timer
    this.menuButton.frame = this.buttonActiveTimers.menu > currentTime ? 1 : 0;
    
    if (this.menuVisible || this.songListMenuVisible) return;
    
    // Update pause button based on playback state
    const pauseFrame = this.isPlaying ? 0 : 1; // 0 = pause icon, 1 = play icon
    this.pauseButton.frame = pauseFrame;
    
    // Update seek buttons based on held state
    this.seekLeftButton.frame = gamepad.held.left ? 1 : 0;
    this.seekRightButton.frame = gamepad.held.right ? 1 : 0;
    
    // Update skip buttons based on active timers
    this.skipLeftButton.frame = this.buttonActiveTimers.skipLeft > currentTime ? 1 : 0;
    this.skipRightButton.frame = this.buttonActiveTimers.skipRight > currentTime ? 1 : 0;
    
    // Update visualization button based on active timer
    this.visualizationButton.frame = this.buttonActiveTimers.visualization > currentTime ? 1 : 0;
  }

  setButtonActive(buttonName, duration = 100) {
    this.buttonActiveTimers[buttonName] = game.time.now + duration;
  }

  changeVolume(delta) {
    let currentVolume = Account.settings.volume;
    let newVolume = currentVolume + delta;
    
    // Clamp volume between 0 and 4 (0%, 25%, 50%, 75%, 100%)
    newVolume = Phaser.Math.clamp(newVolume, 0, 4);
    
    if (newVolume !== currentVolume) {
      Account.settings.volume = newVolume;
      saveAccount();
      
      // Update audio volume
      this.audioElement.volume = [0,25,50,75,100][newVolume] / 100;
      
      // Show volume feedback
      const volumeLevels = ["MUTE", "25%", "50%", "75%", "100%"];
      notifications.show(`VOLUME: ${volumeLevels[newVolume]}`, 1000);
    }
  }

  play() {
    this.audioElement.play().then(() => {
      this.isPlaying = true;
    }).catch(error => {
      console.warn("Playback failed:", error);
      this.isPlaying = false;
      // On error, try to start from beginning
      this.audioElement.currentTime = 0;
      this.play();
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
    
    // Show active frame on pause button
    this.pauseButton.frame = 2; // Active frame
    this.setButtonActive('pause', 100);
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
    
    // Show active frame on visualization button for shuffle
    this.setButtonActive('visualization', 100);
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
    
    // Show active frame on visualization button
    this.setButtonActive('visualization', 100);
  }

  showSongList() {
    this.songListMenuVisible = true;
    
    const menuBg = game.add.graphics(0, 0);
    menuBg.beginFill(0x000000, 0.7);
    menuBg.drawRect(0, 0, game.width, game.height);
    menuBg.endFill();
    
    const menu = new CarouselMenu(20, 20, 152, 72, {
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      align: 'left',
      disableScrollBar: false
    });
    
    // Add all songs to the menu
    this.songs.forEach((song, index) => {
      const title = song.titleTranslit || song.title || `Song ${index + 1}`;
      const isCurrent = index === this.currentIndex;
      const displayText = isCurrent ? `> ${title}` : `  ${title}`;
      
      menu.addItem(
        displayText,
        () => {
          if (index !== this.currentIndex) {
            this.loadSong(index);
          }
          menu.destroy();
          menuBg.destroy();
          this.songListMenuVisible = false;
        },
        { 
          song: song, 
          index: index,
          bgcolor: isCurrent ? '#9b59b6' : 'brown'
        }
      );
    });
    
    menu.onCancel.add(() => {
      menu.destroy();
      menuBg.destroy();
      this.songListMenuVisible = false;
    });
    
    // Set initial selection to current song
    menu.selectedIndex = this.currentIndex;
    menu.updateSelection();
  }

  showMenu() {
    this.menuVisible = true;
    
    this.setButtonActive('menu', 100);
    
    const menuBg = game.add.graphics(0, 0);
    menuBg.beginFill(0x000000, 0.7);
    menuBg.drawRect(0, 0, game.width, game.height);
    menuBg.endFill();
    
    const menu = new CarouselMenu(60, 40, 72, 40, {
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      align: 'center'
    });
    
    menu.addItem("Continue", () => {
      menu.destroy();
      menuBg.destroy();
      this.menuVisible = false;
    });
    
    menu.addItem("Song List", () => {
      menu.destroy();
      menuBg.destroy();
      this.menuVisible = false;
      this.showSongList();
    });
    
    menu.addItem("Toggle Shuffle", () => {
      this.toggleShuffle();
      menu.destroy();
      menuBg.destroy();
      this.menuVisible = false;
    });
    
    menu.addItem("Exit Jukebox", () => {
      this.exitJukebox();
    });
    
    menu.onCancel.add(() => {
      menu.destroy();
      menuBg.destroy();
      this.menuVisible = false;
    });
  }

  exitJukebox() {
    // Save current playback position before exiting
    this.savePlaybackPosition();
    
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
    
    if (this.lyrics) {
      this.lyrics.destroy();
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
    this.updateButtonStates();
    this.updateLyrics();
    
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

  updateLyrics() {
    if (this.hasLyrics && this.lyrics && this.audioElement) {
      const currentTime = this.audioElement.currentTime;
      this.lyrics.move(currentTime);
    } else {
      this.lyricsText.write(""); // Clear lyrics if none available
    }
  }

  handleInput() {
    const currentTime = game.time.now;
    
    // Update gamepad
    gamepad.update();
    
    // Don't trigger actions if menu is visible
    if (this.menuVisible || this.songListMenuVisible) return;
    
    // Volume control (UP/DOWN)
    if (gamepad.pressed.up) {
      this.changeVolume(1); // Increase volume
    }
    
    if (gamepad.pressed.down) {
      this.changeVolume(-1); // Decrease volume
    }
    
    // Play/Pause (A button)
    if (gamepad.pressed.a) {
      this.togglePlayback();
    }
    
    // Fullscreen toggle (B button)
    if (gamepad.pressed.b) {
      this.toggleFullscreen();
    }
    
    // Visualizer mode change (Select button)
    if (gamepad.pressed.select) {
      this.changeVisualizerMode();
    }
    
    // Shuffle toggle (Double press Select)
    if (gamepad.pressed.select && currentTime - this.lastSelectPress < this.doublePressTimeout) {
      this.toggleShuffle();
    }
    
    // Menu (Start button)
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
      this.setButtonActive('skipLeft', 100);
      this.lastSeekTime = currentTime;
    }
    
    if (gamepad.pressed.right && currentTime - this.lastRightPress < this.doublePressTimeout) {
      this.nextSong();
      this.setButtonActive('skipRight', 100);
      this.lastSeekTime = currentTime;
    }
    
    // Track press times for double press detection
    if (gamepad.pressed.left) {
      this.lastLeftPress = currentTime;
    }
    
    if (gamepad.pressed.right) {
      this.lastRightPress = currentTime;
    }
    
    if (gamepad.pressed.select) {
      this.lastSelectPress = currentTime;
    }
    
    if (gamepad.pressed.b) {
      this.lastBPress = currentTime;
    }
  }

  shutdown() {
    // Save current playback position before shutting down
    this.savePlaybackPosition();
    
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
    
    if (this.lyrics) {
      this.lyrics.destroy();
    }
  }
}
