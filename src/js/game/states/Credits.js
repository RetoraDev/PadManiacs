class Credits {
  init(returnState = 'MainMenu', returnStateParams = {}) {
    this.returnState = returnState;
    this.returnStateParams = returnStateParams;
    this.scrollSpeed = 15; // pixels per second
    this.isWaitingForInput = false;
    this.backgroundInterval = 8000; // Change background every 8 seconds
    this.availableBackgrounds = [];
  }

  create() {
    game.camera.fadeIn(0x000000);
    
    // Create background system
    this.setupBackground();
    
    // Start background music
    this.startBackgroundMusic();
    
    // Create credits container
    this.creditsContainer = game.add.group();
    
    // Base credits content
    const creditsContent = [
      { text: "PADMANIACS", font: FONTS.shaded, tint: 0x76fcde, spacing: 25 },
      { text: "Created by Retora", font: FONTS.default, tint: 0xffffff, spacing: 15 },
      
      // Dynamic song credits section
      { text: "SONG CREDITS", font: FONTS.shaded, tint: 0x76fcde, spacing: 20 }
    ];
    
    // Add credits from local songs
    const songCredits = this.getSongCredits();
    if (songCredits.length > 0) {
      creditsContent.push(...songCredits);
      creditsContent.push({ text: "", font: FONTS.default, tint: 0xffffff, spacing: 15 });
    }
    
    // Continue with remaining credits
    creditsContent.push(
      { text: "Special Thanks", font: FONTS.shaded, tint: 0x76fcde, spacing: 20 },
      { text: "StepMania Team", font: FONTS.default, tint: 0xffffff, spacing: 8 },
      { text: "photonstorm", font: FONTS.default, tint: 0xffffff, spacing: 8 },
      { text: "itch.io", font: FONTS.default, tint: 0xffffff, spacing: 8 },
      { text: "You!", font: FONTS.shaded, tint: 0xffffff, spacing: 25 },
      
      { text: COPYRIGHT, font: FONTS.default, tint: 0x888888, spacing: 40 },
    );
    
    // Create all text elements
    let currentY = game.height + 20; // Start below the screen
    
    creditsContent.forEach((credit, index) => {
      const text = new Text(game.width / 2, currentY, credit.text, credit.font, this.creditsContainer);
      text.anchor.set(0.5);
      text.wrapPreserveNewlines(112);
      text.tint = credit.tint;
      text.creditData = credit; // Store spacing info
      
      currentY += credit.spacing;
    });
    
    // Store total height for scrolling calculation
    this.totalHeight = currentY;
    this.startY = this.creditsContainer.y;
    
    // Setup completion detection
    this.creditsComplete = false;
    
    // Execute addon behaviors
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  setupBackground() {
    // Create background sprite
    this.backgroundSprite = game.add.sprite(0, 0);
    this.backgroundSprite.alpha = 0.7;
    
    // Collect all available backgrounds from songs
    this.collectBackgrounds();
    
    // Start background slideshow
    if (this.availableBackgrounds.length > 0) {
      this.showNextBackground();
      this.backgroundTimer = game.time.events.loop(this.backgroundInterval, this.showNextBackground, this);
    } else {
      // Fallback: create gradient background
      this.backgroundSprite.loadTexture("ui_background_gradient");
    }
  }

  collectBackgrounds() {
    this.availableBackgrounds = [];
    
    // Collect from local songs
    if (window.localSongs && Array.isArray(window.localSongs)) {
      window.localSongs.forEach(song => {
        if (song.background && song.background !== "no-media") {
          this.availableBackgrounds.push(song.backgroundUrl);
        }
        if (song.banner && song.banner !== "no-media") {
          this.availableBackgrounds.push(song.bannerUrl);
        }
      });
    }
    
    // Collect from external songs
    if (window.externalSongs && Array.isArray(window.externalSongs)) {
      window.externalSongs.forEach(song => {
        if (song.background && song.background !== "no-media") {
          this.availableBackgrounds.push(song.backgroundUrl);
        }
        if (song.banner && song.banner !== "no-media") {
          this.availableBackgrounds.push(song.bannerUrl);
        }
      });
    }
    
    // Remove duplicates
    this.availableBackgrounds = [...new Set(this.availableBackgrounds)];
    
    console.log(`Found ${this.availableBackgrounds.length} backgrounds for slideshow`);
  }

  showNextBackground() {
    if (this.availableBackgrounds.length === 0) return;
    
    const nextBackground = game.rnd.pick(this.availableBackgrounds);
    
    // Create temporary image to load and display
    const tempImg = new Image();
    tempImg.onload = () => {
      // Create canvas for the background
      const canvas = document.createElement('canvas');
      canvas.width = 192;
      canvas.height = 112;
      const ctx = canvas.getContext('2d');
      
      // Draw and scale the image to fit
      ctx.drawImage(tempImg, 0, 0, 192, 112);
      
      // Create texture and apply to sprite
      const texture = PIXI.Texture.fromCanvas(canvas);
      this.backgroundSprite.loadTexture(texture);
      
      // Fade in effect
      this.backgroundSprite.alpha = 0;
      game.add.tween(this.backgroundSprite).to({ alpha: 0.4 }, 1000, "Linear", true);
    };
    
    tempImg.src = nextBackground;
  }

  startBackgroundMusic() {
    // Stop any existing background music
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    // Get all available songs
    const allSongs = [];
    
    // Add local songs
    if (window.localSongs && Array.isArray(window.localSongs)) {
      allSongs.push(...window.localSongs);
    }
    
    // Add external songs
    if (window.externalSongs && Array.isArray(window.externalSongs)) {
      allSongs.push(...window.externalSongs);
    }
    
    // Filter songs that have audio
    const songsWithAudio = allSongs.filter(song => song.audioUrl);
    
    if (songsWithAudio.length > 0) {
      // Pick a random song
      const randomSong = game.rnd.pick(songsWithAudio);
      
      // Create audio element for credits music
      this.creditsMusic = document.createElement("audio");
      this.creditsMusic.src = randomSong.audioUrl;
      this.creditsMusic.volume = [0,25,50,75,100][Account.settings.volume] / 100;
      this.creditsMusic.loop = true;
      
      // Start playback
      this.creditsMusic.play().catch(error => {
        console.warn("Could not play credits music:", error);
      });
      
      console.log(`Playing credits music: ${randomSong.title || "Unknown Song"}`);
    }
  }

  getSongCredits() {
    const songCredits = [];
    const seenCredits = new Set();
    
    if (window.localSongs && Array.isArray(window.localSongs)) {
      window.localSongs.forEach(song => {
        // Check if song has credit information
        const credit = song.credit;
        const title = song.titleTranslit || song.title || "Unknown Song";
        
        if (credit && !seenCredits.has(credit.toLowerCase())) {
          seenCredits.add(credit.toLowerCase());
          
          // Add song title and credit
          songCredits.push(
            { text: title, font: FONTS.default, tint: 0xffffff, spacing: 8 },
            { text: `by ${credit}`, font: FONTS.default, tint: 0xe0e0e0, spacing: 12 }
          );
        }
      });
    }
    
    // Also add disclaimer
    songCredits.push(
      { text: "", font: FONTS.default, tint: 0xffffff, spacing: 8 },
      { text: "All songs and charts belong to their respective copyright holders.", font: FONTS.default, tint: 0x888888, spacing: 12 }
    );
    
    return songCredits;
  }

  update() {
    // Update audio visualizer
    if (this.visualizer) {
      this.visualizer.update();
    }
    
    // Update gamepad
    gamepad.update();
    
    if (this.creditsComplete) return;
    
    // Scroll credits upward
    this.creditsContainer.y -= this.scrollSpeed * (gamepad.held.any ? 4 : 1) * (game.time.elapsed / 1000);
    
    // Check if credits have finished scrolling
    const bottomOfCredits = this.creditsContainer.y + this.totalHeight;
    if (bottomOfCredits < 0 && !this.creditsComplete) {
      this.creditsComplete = true;
      this.onCreditsComplete();
    }
  }

  onCreditsComplete() {
    // Show continue prompt
    this.continueText = new Text(game.width / 2, game.height / 2, "Thank you for playing", FONTS.shaded);
    this.continueText.anchor.set(0.5);
    this.continueText.alpha = 0;
    
    game.add.tween(this.continueText).to({ alpha: 1 }, 1000, "Linear", true);
    
    // Wait for input to return
    this.isWaitingForInput = true;
    gamepad.signals.pressed.any.addOnce(() => {
      this.returnToMenu();
    });
  }

  returnToMenu() {
    // Fade out and transition to next game screen
    game.camera.fade(0x000000, 1000);
    game.camera.onFadeComplete.addOnce(() => {
      game.state.start(this.returnState, true, false, this.returnStateParams);
    });
  }

  shutdown() {
    // Clean up event listeners
    if (this.skipHandler) {
      gamepad.signals.pressed.any.remove(this.skipHandler);
    }
    
    // Clean up music
    if (this.creditsMusic) {
      this.creditsMusic.pause();
      this.creditsMusic.src = "";
    }
    
    // Clean up background timer
    if (this.backgroundTimer) {
      game.time.events.remove(this.backgroundTimer);
    }
  }
}
