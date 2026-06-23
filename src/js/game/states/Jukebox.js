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
    
    // Volume tunning
    this.volumeCooldown = 100;
    this.lastVolumeUpdate = 0;
    
    // Visualizer
    this.visualizer = null;
    
    // LRC system
    this.lyrics = null;
    this.hasLyrics = false;
    
    // Fullscreen mode
    this.fullscreenMode = false;
    
    // Button states and timers
    this.buttonActiveTimers = {};
    this.mouseSeekLeftHeld = false;
    this.mouseSeekRightHeld = false;
    this.isMouseSeeking = false;
    
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
    
    // Setup wheel seek
    this.setupWheelSeek();
    
    // Setup visualizer
    this.setupVisualizer();
    
    // Setup lyrics
    this.setupLyrics();
    
    // Add navigation hint
    this.navigationHint = new NavigationHint('jukebox');
    
    // Load first song
    this.loadSong(this.currentIndex);
    
    // Execute addon behaviors
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  setupBackground() {
    this.backgroundSprite = new CanvasBackground(0, 0);
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
    this.audioElement.volume = Account.settings.volume / 100;
    
    this.audioElement.addEventListener('timeupdate', () => {
      this.updateProgressBar();
      this.updateTimeDisplay();
    });
    
    this.audioElement.addEventListener('ended', () => {
      this.nextSong(true);
    });
    
    this.audioElement.addEventListener('error', (e) => {
      console.warn("Audio error:", e);
    });
  }

  setupUI() {
    // Window manager
    this.windowManager = new WindowManager();
    
    // Background gradient for readability
    this.uiBackground = game.add.graphics(0, 0);
    this.uiBackground.beginFill(0x000000, 0.7);
    this.uiBackground.drawRect(0, 100, game.width, 40);
    this.uiBackground.endFill();
    
    // Song banner
    this.bannerSprite = new CanvasBackground(4, 4);
    
    // Song metadata
    this.songTitle = new Text(102, 4, "", FONTS.shaded);
    this.songArtist = new Text(104, 14, "", FONTS.default);
    this.songCredit = new Text(104, 24, "", FONTS.default);
    
    // Playback time displays
    this.currentTimeText = new Text(4, 104, "0:00", FONTS.default);
    this.durationText = new Text(240 - 4, 104, "0:00", FONTS.default);
    this.durationText.anchor.x = 1;
    
    // Progress bar
    this.progressBarBg = game.add.graphics(24, 106);
    this.progressBarBg.lineStyle(2, 0x666666, 1);
    this.progressBarBg.moveTo(0, 0);
    this.progressBarBg.lineTo(188, 0);
    
    this.progressBar = game.add.graphics(24, 106);
    
    // Mouse interactivity for progress bar
    this.progressBarInteractive = game.add.sprite(24, 104);
    this.progressBarInteractive.width = 188;
    this.progressBarInteractive.height = 6;
    this.progressBarInteractive.inputEnabled = true;
    this.progressBarInteractive.useHandCursor = true;
    
    // Mouse seek with progress bar
    this.progressBarInteractive.events.onInputDown.add(() => {
      this.seekToMousePosition();
      this.isMouseSeeking = true;
    });
    this.progressBarInteractive.events.onInputUp.add(() => {
      this.isMouseSeeking = false;
    });
    
    // Create playback controls
    this.createPlaybackControls();
    
    // Create lyrics display
    this.lyricsText = new Text(game.width / 2, 64, "", FONTS.default_stroke);
    this.lyricsText.anchor.set(0.5);
    this.lyricsText.visible = true; // Always visible
    
    // Shuffle Label
    this.shuffleLabel = new Text(5, 90, "");
    this.shuffleLabel.visible = false;
    
    // Volume Label
    this.volumeLabel = new Text(game.width - 5, 90, "");
    this.volumeLabel.visible = false;
    this.volumeLabel.anchor.x = 1;
  }
  
  setupWheelSeek() {
    if (mouse) {
      mouse.onWheel.add((direction) => {
        if (this.menuVisible || this.songListMenuVisible) return;
        
        if (direction === 'up') {
          this.seekForward();
        } else if (direction === 'down') {
          this.seekBackward();
        }
        
        this.flashProgressBar();
      });
    }
  }

  createPlaybackControls() {
    const centerX = game.width / 2;
    const yPos = 90;
    const buttonSpacing = 2; // 2px separation between buttons
    
    const buttonWidths = {
      visualization: 9,
      skip: 9,
      seek: 9,
      pause: 16,
      menu: 9
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
    
    // Menu button (rightmost)
    this.menuButton = game.add.sprite(currentX + buttonWidths.menu/2, yPos, "ui_jukebox_menu", 0);
    this.menuButton.anchor.set(0.5);
    
    // Setup mouse listeners
    this.visualizationButton.inputEnabled = true;
    this.visualizationButton.useHandCursor = true;
    this.visualizationButton.events.onInputDown.add(() => {
      this.changeVisualizerMode();
      this.setButtonActive('visualization', 100);
    });
    
    this.skipLeftButton.inputEnabled = true;
    this.skipLeftButton.useHandCursor = true;
    this.skipLeftButton.events.onInputDown.add(() => {
      this.previousSong();
      this.setButtonActive('skipLeft', 100);
    });
    
    this.seekLeftButton.inputEnabled = true;
    this.seekLeftButton.useHandCursor = true;
    this.seekLeftButton.events.onInputDown.add(() => this.mouseSeekLeftHeld = true);
    this.seekLeftButton.events.onInputUp.add(() => this.mouseSeekLeftHeld = false);
    
    this.pauseButton.inputEnabled = true;
    this.pauseButton.useHandCursor = true;
    this.pauseButton.events.onInputDown.add(() => {
      this.togglePlayback();
      this.setButtonActive('pause', 100);
    });
    
    this.seekRightButton.inputEnabled = true;
    this.seekRightButton.useHandCursor = true;
    this.seekRightButton.events.onInputDown.add(() => this.mouseSeekRightHeld = true);
    this.seekRightButton.events.onInputUp.add(() => this.mouseSeekRightHeld = false);
    
    this.skipRightButton.inputEnabled = true;
    this.skipRightButton.useHandCursor = true;
    this.skipRightButton.events.onInputDown.add(() => {
      this.nextSong();
      this.setButtonActive('skipRight', 100);
    });
    
    this.menuButton.inputEnabled = true;
    this.menuButton.useHandCursor = true;
    this.menuButton.events.onInputDown.add(() => {
      this.showMenu();
      this.setButtonActive('menu');
    });
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
      this.loadLyrics(this.currentSong.lyricsContent);
    } else {
      this.lyrics = null;
      this.hasLyrics = false;
    }
  }

  loadLyrics(lrcContent) {
    if (lrcContent && lrcContent != "") {
      this.lyrics = new Lyrics({
        textElement: this.lyricsText,
        maxLineLength: 25,
        lrc: lrcContent
      });
      
      this.hasLyrics = true;
    } else {
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

  resetPlaybackPosition() {
    if (this.audioElement && this.currentSong) {
      const songKey = this.getSongKey(this.currentSong);
      this.playbackPositions[songKey] = 0;
    }
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

  loadSong(index, reset) {
    if (index < 0 || index >= this.songs.length) return;
    
    // Save or reset current playback position before switching
    if (reset) {
      this.resetPlaybackPosition();
    } else {
      this.savePlaybackPosition();
    }
    
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
    this.songTitle.write(song.titleTranslit || song.title || "Unknown Title", 33);
    this.songArtist.write(song.artistTranslit || song.artist || "Unknown Artist", 33);
    this.songCredit.write(song.credit || "", 33);
    
    // Load banner
    this.bannerSprite.ctx.clearRect(0, 0, 96, 32);
    this.bannerSprite.dirty();
    
    if (song.bannerUrl && song.bannerUrl !== "no-media") {
      const bannerImg = new Image();
      bannerImg.onload = () => {
        this.bannerSprite.ctx.drawImage(bannerImg, 0, 0, 96, 32);
        this.bannerSprite.dirty();
      };
      bannerImg.src = song.bannerUrl;
    }
  }

  updateBackground() {
    // TODO: Implement background videos correctly 
    
    // Clear current background
    this.backgroundSprite.ctx.clearRect(0, 0, 240, 140);
    this.backgroundSprite.dirty();
    this.videoElement.src = "";
    
    // Load song background
    if (this.currentSong.backgroundUrl && this.currentSong.backgroundUrl !== "no-media") {
      const bgImg = new Image();
      bgImg.onload = () => {
        this.backgroundSprite.ctx.drawImage(bgImg, 0, 0, 240, 140);
        this.backgroundSprite.dirty();
      };
      bgImg.src = this.currentSong.backgroundUrl;
    }
    
    // Handle background videos
    if (this.currentSong.videoUrl) {
      //this.videoElement.src = this.currentSong.videoUrl;
      //this.videoElement.play();
      
      // Update video frame periodically
      this.lastVideoUpdate = game.time.now;
    }
  }

  updateDurationDisplay() {
    const duration = this.audioElement.duration;
    this.durationText.write(TimeUtils.formatTime(duration));
  }

  updateProgressBar() {
    const currentTime = this.audioElement.currentTime;
    const duration = this.audioElement.duration;
    
    if (!TimeUtils.isValidTime(duration)) return;
    
    const progress = currentTime / duration;
    const barWidth = 188 * progress;
    
    this.progressBar.clear();
    this.progressBar.lineStyle(2, this.isMouseSeeking ? 0xffffff : 0x76fcde, 1);
    this.progressBar.moveTo(0, 0);
    this.progressBar.lineTo(barWidth, 0);
  }

  updateTimeDisplay() {
    const currentTime = this.audioElement.currentTime;
    this.currentTimeText.write(TimeUtils.formatTime(currentTime));
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
    this.pauseButton.frame = this.buttonActiveTimers.pause > currentTime ? 2 : pauseFrame;
    
    // Update seek buttons based on held state
    this.seekLeftButton.frame = this.mouseSeekLeftHeld ? 1 : 0;
    this.seekRightButton.frame = this.mouseSeekRightHeld ? 1 : 0;
    
    // Update skip buttons based on active timers
    this.skipLeftButton.frame = this.buttonActiveTimers.skipLeft > currentTime ? 1 : 0;
    this.skipRightButton.frame = this.buttonActiveTimers.skipRight > currentTime ? 1 : 0;
    
    // Update visualization button based on active timer
    this.visualizationButton.frame = this.buttonActiveTimers.visualization > currentTime ? 1 : 0;
  }
  
  updateVolumeLabel() {
    // Hide volume label
    if (this.volumeLabel.visible && game.time.now - this.lastVolumeUpdate >= 1000) {
      this.volumeLabel.visible = false;
    }
  }

  setButtonActive(buttonName, duration = 100) {
    this.buttonActiveTimers[buttonName] = game.time.now + duration;
  }

  changeVolume(delta) {
    let currentVolume = Account.settings.volume;
    let newVolume = currentVolume + delta;
    
    // Clamp volume between 0 and 100
    newVolume = Phaser.Math.clamp(newVolume, 0, 100);
    
    if (newVolume !== currentVolume) {
      Account.settings.volume = newVolume;
      saveAccount();
      
      // Update audio volume
      this.audioElement.volume = newVolume / 100;
      
      // Show volume feedback
      const volumeLevels = ["MUTE", "25%", "50%", "75%", "100%"];
      this.volumeLabel.write(`VOLUME: ${newVolume > 0 ? newVolume + '%' : 'MUTE'}`);
      this.volumeLabel.visible = true;
      this.lastVolumeUpdate = game.time.now;
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

  nextSong(reset) {
    let nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.songs.length) {
      nextIndex = 0; // Loop to beginning
    }
    this.loadSong(nextIndex, reset);
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
    
    // Show shuffle state label
    this.shuffleLabel.visible = true;
    this.shuffleLabel.write(`SHUFFLE: ${this.isShuffled ? 'ON' : 'OFF'}`);
    
    game.time.events.add(1500, () => this.shuffleLabel.visible = false);
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
  
  seekToMousePosition() {
    if (!this.audioElement || !this.audioElement.duration || !TimeUtils.isValidTime(this.audioElement.duration)) {
      return;
    }
    
    const pointer = mouse.pointer;
    
    // Calculate click position relative to progress bar
    const barStartX = 24;
    const barEndX = 24 + 188;
    const mouseX = pointer.worldX;
    
    // Clamp to bar bounds
    const clampedX = Math.max(barStartX, Math.min(barEndX, mouseX));
    
    // Calculate progress percentage (0 to 1)
    const progress = (clampedX - barStartX) / 188;
    
    // Calculate new time
    const newTime = progress * this.audioElement.duration;
    
    // Seek to position
    const wasPlaying = this.isPlaying;
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
    menuBg.width = game.width;
    menuBg.height = game.width;
    menuBg.inputEnabled = true;
    
    menuBg.beginFill(0x000000, 0.5);
    menuBg.drawRect(0, 0, game.width, game.height);
    menuBg.endFill();
    
    const menu = this.windowManager.createWindow(3, 1, 24, 15, "1");
    
    // Add all songs to the menu
    this.songs.forEach((song, index) => {
      const title = song.titleTranslit || song.title || `Song ${index + 1}`;
      const isCurrent = index === this.currentIndex;
      
      menu.addItem(
        title,
        isCurrent ? "NOW PLAYING" : "",
        () => {
          if (index !== this.currentIndex) {
            this.loadSong(index);
          }
          menu.destroy();
          menuBg.destroy();
          setTimeout(() => this.songListMenuVisible = false);
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
      setTimeout(() => this.songListMenuVisible = false);
    });
    
    // Set initial selection to current song
    menu.selectIndex(this.currentIndex);
    
    this.windowManager.focus(menu);
  }

  showMenu() {
    this.menuVisible = true;
    
    this.setButtonActive('menu', 100);
    
    const menuBg = game.add.graphics(0, 0);
    menuBg.width = game.width;
    menuBg.height = game.width;
    menuBg.inputEnabled = true;
    
    if (this.fullscreenMode) {
      menuBg.beginFill(0x000000, 0.5);
      menuBg.drawRect(0, 0, game.width, game.height);
      menuBg.endFill();
    }
    
    const menu = this.windowManager.createWindow(20, 4, 9, 8, "1");
    
    menu.addItem("Song List", ">", () => {
      menu.destroy();
      menuBg.destroy();
      this.menuVisible = false;
      this.showSongList();
    });
    
    menu.addSettingItem("Shuffle", ["ON", "OFF"], this.isShuffled ? 0 : 1, () => this.toggleShuffle());
    
    menu.addItem("Close Menu", "", () => {
      menu.destroy();
      menuBg.destroy();
      setTimeout(() => this.menuVisible = false);
    }, true);
    
    menu.addItem("< Exit Jukebox", "", () => {
      this.exitJukebox();
    });
    
    this.windowManager.focus(menu);
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
    this.updateVolumeLabel();
    
    // Update video background if playing
    if (this.videoElement.src && this.videoElement.readyState >= 2) {
      const currentTime = game.time.now;
      if (currentTime - this.lastVideoUpdate >= 33) { // ~30fps
        this.lastVideoUpdate = currentTime;
        this.backgroundSprite.ctx.drawImage(this.videoElement, 0, 0, 240, 140);
        this.backgroundSprite.dirty();
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
    
    // Update gamepad and window manager
    gamepad.update();
    this.windowManager.update();
    
    // Don't trigger actions if menu is visible
    if (this.menuVisible || this.songListMenuVisible) return;
    
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
    
    // Handle volume
    if (currentTime - this.lastVolumeUpdate > this.volumeCooldown) {
      // Volume control (UP/DOWN)
      if (gamepad.held.up) {
        this.changeVolume(1); // Increase volume
      }
      
      if (gamepad.held.down) {
        this.changeVolume(-1); // Decrease volume
      }
    }
    
    // Seek handling
    if (currentTime - this.lastSeekTime > this.seekCooldown) {
      // Single press - seek
      if (gamepad.held.left || this.mouseSeekLeftHeld) {
        this.seekBackward();
        this.lastSeekTime = currentTime;
      }
      
      if (gamepad.held.right || this.mouseSeekRightHeld) {
        this.seekForward();
        this.lastSeekTime = currentTime;
      }
    }
    
    // Mouse seek
    if (this.isMouseSeeking) {
      if (currentTime - this.lastSeekTime > this.seekCooldown) {
        this.seekToMousePosition();
      }
      
      this.updateProgressBar();
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
