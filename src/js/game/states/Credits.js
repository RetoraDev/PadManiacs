class Credits {
  init(returnState = 'MainMenu', returnStateParams = {}) {
    this.returnState = returnState;
    this.returnStateParams = returnStateParams;
    this.isWaitingForInput = false;
    this.backgroundInterval = 8000;
    this.availableBackgrounds = [];
    this.bpmChanges = null;
    this.stops = null;
    this.startTime = 0;
  }

  create() {
    game.camera.fadeIn(0x000000);
    
    this.setupBackground();
    this.startBackgroundMusic();
    
    this.creditsContainer = game.add.group();
    
    const creditsContent = [
      { text: "PADMANIACS", font: FONTS.bold_shadow, tint: 0x76fcde, spacing: 15 },
      { text: __("Created by Retora||Creado por Retora"), font: FONTS.default_shadow, tint: 0xffffff, spacing: 50 },
      
      { text: __("SONG CREDITS||CRÉDITOS DE CANCIONES"), font: FONTS.bold_shadow, tint: 0x76fcde, spacing: 30 }
    ];
    
    const songCredits = this.getSongCredits();
    if (songCredits.length > 0) {
      creditsContent.push(...songCredits);
      creditsContent.push({ text: "", font: FONTS.default, tint: 0xffffff, spacing: 25 });
    }
    
    creditsContent.push(
      { text: __("SOUND EFFECTS||EFECTOS DE SONIDO"), font: FONTS.bold_shadow, tint: 0x76fcde, spacing: 20 },
      { text: "Atelier Magicae", font: FONTS.default_shadow, tint: 0xffffff, spacing: 15 },
      { text: "Retora", font: FONTS.default_shadow, tint: 0xffffff, spacing: 15 },
      { text: "", font: FONTS.default, tint: 0xffffff, spacing: 15 },
      
      { text: __("Special Thanks||Agradecimientos Especiales"), font: FONTS.bold_shadow, tint: 0x76fcde, spacing: 20 },
      { text: "StepMania Team", font: FONTS.default_shadow, tint: 0xffffff, spacing: 8 },
      { text: "photonstorm", font: FONTS.default_shadow, tint: 0xffffff, spacing: 8 },
      { text: "itch.io", font: FONTS.default_shadow, tint: 0xffffff, spacing: 8 },
      { text: __("You!||¡Tú!"), font: FONTS.bold_shadow, tint: [0xffffff, 0x05ff00], spacing: 25 },
      
      { text: COPYRIGHT, font: FONTS.default_shadow, tint: 0x888888, spacing: 40 },
    );
    
    let currentY = game.height + 20;
    
    creditsContent.forEach((credit, index) => {
      const text = new Text(game.width / 2, currentY, credit.text, credit.font, this.creditsContainer);
      text.anchor.set(0.5);
      text.wrap(200);
      text.creditData = credit;
      
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
    
    this.totalHeight = currentY;
    this.startY = this.creditsContainer.y;
    this.creditsComplete = false;
    
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  setupBackground() {
    this.backgroundSprite = game.add.sprite(0, 0);
    this.backgroundSprite.alpha = 0.7;
    
    this.collectBackgrounds();
    
    if (this.availableBackgrounds.length > 0) {
      this.showNextBackground();
      this.backgroundTimer = game.time.events.loop(this.backgroundInterval, this.showNextBackground, this);
    } else {
      this.backgroundSprite.loadTexture("ui_background_gradient");
    }
  }

  collectBackgrounds() {
    this.availableBackgrounds = [];
    
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
    
    this.availableBackgrounds = [...new Set(this.availableBackgrounds)];
    
    console.log(`Found ${this.availableBackgrounds.length} backgrounds for slideshow`);
  }

  showNextBackground() {
    if (this.availableBackgrounds.length === 0) return;
    
    const nextBackground = game.rnd.pick(this.availableBackgrounds);
    
    const tempImg = new Image();
    tempImg.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 140;
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(tempImg, 0, 0, 240, 140);
      
      const texture = PIXI.Texture.fromCanvas(canvas);
      this.backgroundSprite.loadTexture(texture);
      
      this.backgroundSprite.alpha = 0;
      game.add.tween(this.backgroundSprite).to({ alpha: 0.4 }, 1000, "Linear", true);
    };
    
    tempImg.src = nextBackground;
  }

  startBackgroundMusic() {
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    const allSongs = [];
    
    if (window.localSongs && Array.isArray(window.localSongs)) {
      allSongs.push(...window.localSongs);
    }
    
    if (window.externalSongs && Array.isArray(window.externalSongs)) {
      allSongs.push(...window.externalSongs);
    }
    
    const songsWithAudio = allSongs.filter(song => song.audioUrl);
    
    if (songsWithAudio.length > 0) {
      const randomSong = game.rnd.pick(songsWithAudio);
      
      this.creditsMusic = document.createElement("audio");
      this.creditsMusic.src = randomSong.audioUrl;
      this.creditsMusic.volume = Account.settings.volume / 100;
      this.creditsMusic.loop = true;
      
      this.bpmChanges = randomSong.bpmChanges;
      this.stops = randomSong.stops;
      this.startTime = game.time.now;
      
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
        const title = song.titleTranslit || song.title || __("Unknown Song||Canción Desconocida");
        const artist = song.artistTranslit || song.artist;
        const credit = song.credit;
        
        if (credit) {
          songCredits.push(
            { text: artist, font: FONTS.default_shadow, tint: 0xffffff, spacing: 8 },
            { text: title, font: FONTS.bold_shadow, tint: 0xffffff, spacing: 8 },
            { text: __(`Chart by ${credit}||Chart por ${credit}`), font: FONTS.default_shadow, tint: 0xa0a0a0, spacing: 25 }
          );
        }
      });
    }
    
    songCredits.push(
      { text: "", font: FONTS.default, tint: 0xffffff, spacing: 8 },
      { text: __("All songs and charts belong to their respective copyright holders.||Todas las canciones y charts pertenecen a sus respectivos dueños de copyright."), font: FONTS.default_shadow, tint: 0x888888, spacing: 12 }
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
    
    if (this.visualizer) {
      this.visualizer.update();
    }
    
    gamepad.update();
    
    if (this.creditsComplete) return;
    
    const currentBpm = this.getLastBpm(beat).bpm;
    const isAtStop = this.getLastStop(beat) && this.getLastStop().beat == this.currentBeat ;
    const scrollSpeed = isAtStop ? 0 : currentBpm / 10;
    
    this.creditsContainer.y -= scrollSpeed * (gamepad.held.any || mouse.held.any ? 4 : 1) * (game.time.elapsed / 1000);
    
    const bottomOfCredits = this.creditsContainer.y + this.totalHeight;
    if (bottomOfCredits < 0 && !this.creditsComplete) {
      this.creditsComplete = true;
      this.onCreditsComplete();
    }
  }

  onCreditsComplete() {
    this.continueText = new Text(game.width / 2, game.height / 2, __("Thank you for playing||Gracias por jugar"), FONTS.bold_shadow);
    this.continueText.anchor.set(0.5);
    this.continueText.alpha = 0;
    
    game.add.tween(this.continueText).to({ alpha: 1 }, 1000, "Linear", true);
    
    this.isWaitingForInput = true;
    gamepad.signals.pressed.any.addOnce(() => {
      this.returnToMenu();
    });
  }

  returnToMenu() {
    game.camera.fade(0x000000, 1000);
    game.camera.onFadeComplete.addOnce(() => {
      game.state.start(this.returnState, true, false, this.returnStateParams);
    });
  }

  shutdown() {
    if (this.skipHandler) {
      gamepad.signals.pressed.any.remove(this.skipHandler);
    }
    
    if (this.creditsMusic) {
      this.creditsMusic.pause();
      this.creditsMusic.src = "";
    }
    
    if (this.backgroundTimer) {
      game.time.events.remove(this.backgroundTimer);
    }
  }
}