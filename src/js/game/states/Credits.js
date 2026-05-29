class Credits {
  init(returnState = 'MainMenu', returnStateParams = {}) {
    this.returnState = returnState;
    this.returnStateParams = returnStateParams;
    this.isWaitingForInput = false;
    this.backgroundInterval = 8000; // Change background every 8 seconds
    this.availableBackgrounds = [];
    this.bpmChanges = null;
    this.stops = null;
    this.startTime = 0;
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
      { text: "PADMANIACS", font: FONTS.bold_shadow, tint: 0x76fcde, spacing: 15 },
      { text: "Created by Retora", font: FONTS.default_shadow, tint: 0xffffff, spacing: 50 },
      
      // Dynamic song credits section
      { text: "SONG CREDITS", font: FONTS.bold_shadow, tint: 0x76fcde, spacing: 30 }
    ];
    
    // Add credits from local songs
    const songCredits = this.getSongCredits();
    if (songCredits.length > 0) {
      creditsContent.push(...songCredits);
      creditsContent.push({ text: "", font: FONTS.default, tint: 0xffffff, spacing: 25 });
    }
    
    // Credit Atelier Magicae for some sound effects
    creditsContent.push({ text: "SOUND EFFECTS", font: FONTS.bold_shadow, tint: 0x76fcde, spacing: 20 });
    creditsContent.push({ text: "Atelier Magicae", font: FONTS.default_shadow, tint: 0xffffff, spacing: 15 });
    creditsContent.push({ text: "Retora", font: FONTS.default_shadow, tint: 0xffffff, spacing: 15 });
    creditsContent.push({ text: "", font: FONTS.default, tint: 0xffffff, spacing: 15 });
    
    // Continue with remaining credits
    creditsContent.push(
      { text: "Special Thanks", font: FONTS.bold_shadow, tint: 0x76fcde, spacing: 20 },
      { text: "StepMania Team", font: FONTS.default_shadow, tint: 0xffffff, spacing: 8 },
      { text: "photonstorm", font: FONTS.default_shadow, tint: 0xffffff, spacing: 8 },
      { text: "itch.io", font: FONTS.default_shadow, tint: 0xffffff, spacing: 8 },
      { text: "You!", font: FONTS.bold_shadow, tint: [0xffffff, 0x05ff00], spacing: 25 },
      
      { text: COPYRIGHT, font: FONTS.default_shadow, tint: 0x888888, spacing: 40 },
    );
    
    // Create all text elements
    let currentY = game.height + 20; // Start below the screen
    
    creditsContent.forEach((credit, index) => {
      const text = new Text(game.width / 2, currentY, credit.text, credit.font, this.creditsContainer);
      text.anchor.set(0.5);
      text.wrap(200);
      text.creditData = credit; // Store spacing info
      
      if (typeof credit.tint == 'number') {
        text.tint = credit.tint;
      } else {
        text.tint = credit.tint[0];
        
        let currentFrame = 0;
        
        game.time.events.loop(100, () => {
          if (currentFrame < credit.tint.length-1) {
            text.tint = credit.tint[currentFrame];
            currentFrame++;
          } else {
            currentFrame = 0;
          }
        });
      }
      
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
      canvas.width = 240;
      canvas.height = 140;
      const ctx = canvas.getContext('2d');
      
      // Draw and scale the image to fit
      ctx.drawImage(tempImg, 0, 0, 240, 140);
      
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
      this.creditsMusic.volume = Account.settings.volume / 100;
      this.creditsMusic.loop = true;
      
      // Set bpm changes and stops
      this.bpmChanges = randomSong.bpmChanges;
      this.stops = randomSong.stops;
      this.startTime = game.time.now;
      
      // Start playback
      this.creditsMusic.play().catch(error => {
        console.warn("Could not play credits music:", error);
      });
      
      console.log(`Playing credits music: ${randomSong.title || "Unknown Song"}`);
    }
  }

  getSongCredits() {
    const songCredits = [];
    
    if (window.localSongs && Array.isArray(window.localSongs)) {
      window.localSongs.forEach(song => {
        // Check if song has credit information
        const title = song.titleTranslit || song.title || "Unknown Song";
        const artist = song.artistTranslit || song.artist;
        const credit = song.credit;
        
        if (credit) {
          // Add song title and credit
          songCredits.push(
            { text: artist, font: FONTS.default_shadow, tint: 0xffffff, spacing: 8 },
            { text: title, font: FONTS.bold_shadow, tint: 0xffffff, spacing: 8 },
            { text: `Chart by ${credit}`, font: FONTS.default_shadow, tint: 0xa0a0a0, spacing: 25 }
          );
        }
      });
    }
    
    // Also add disclaimer
    songCredits.push(
      { text: "", font: FONTS.default, tint: 0xffffff, spacing: 8 },
      { text: "All songs and charts belong to their respective copyright holders.", font: FONTS.default_shadow, tint: 0x888888, spacing: 12 }
    );
    
    return songCredits;
  }
  
  getSongTime() {
    const elapsed = game.time.now - this.startTime;
    return {
      now: elapsed / 1000,
      beat: this.secToBeat(elapsed / 1000)
    };
  }
  
  getLastBpm(beat) {
    return this.bpmChanges.length ? this.bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1].beat >= beat) : { bpm: 120 };
  }
  
  getLastBpmAtSec(sec) {
    return this.bpmChanges.length ? this.bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1].sec >= sec) : { bpm: 120 };
  }
  
  getLastStop(beat) {
    return this.stops.length ? this.stops.find((e, i, a) => i + 1 == a.length || a[i + 1].beat >= beat) : null;
  }

  beatToSec(beat) {
    if (!this.bpmChanges || this.bpmChanges.length === 0) return beat * 60 / 120;
    
    let b = this.getLastBpm(beat);
    let x = ((beat - b.beat) / b.bpm) * 60 + b.sec;
    let s = this.stops.filter(({ beat: i }) => i >= b.beat && i < beat).map(i => i.len);
    for (let i in s) x += s[i];
    return x;
  }

  secToBeat(sec) {
    if (!this.bpmChanges || this.bpmChanges.length === 0) return sec * 120 / 60;
    
    let b = this.getLastBpmAtSec(sec);
    let s = this.stops.filter(({ sec: i }) => i >= b.sec && i < sec).map(i => (i.sec + i.len > sec ? sec - i.sec : i.len));
    for (let i in s) sec -= s[i];
    return ((sec - b.sec) * b.bpm) / 60 + b.beat;
  }

  update() {
    const { now, beat } = this.getSongTime();
    
    // Update audio visualizer
    if (this.visualizer) {
      this.visualizer.update();
    }
    
    // Update gamepad
    gamepad.update();
    
    if (this.creditsComplete) return;
    
    const currentBpm = this.getLastBpm(beat).bpm;
    const isAtStop = this.getLastStop(beat) && this.getLastStop().beat == this.currentBeat ;
    const scrollSpeed = isAtStop ? 0 : currentBpm / 10;
    
    // Scroll credits upward
    this.creditsContainer.y -= scrollSpeed * (gamepad.held.any || mouse.held.any ? 4 : 1) * (game.time.elapsed / 1000);
    
    // Check if credits have finished scrolling
    const bottomOfCredits = this.creditsContainer.y + this.totalHeight;
    if (bottomOfCredits < 0 && !this.creditsComplete) {
      this.creditsComplete = true;
      this.onCreditsComplete();
    }
  }

  onCreditsComplete() {
    // Show continue prompt
    this.continueText = new Text(game.width / 2, game.height / 2, "Thank you for playing", FONTS.bold_shadow);
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
