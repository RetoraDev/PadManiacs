class Results {
  init(gameData) {
    this.gameData = gameData;
    this.isNewRecord = false;
    this.finalScore = 0;
    this.finalAccuracy = 0;
    this.scoreRating = "";
  }

  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    
    new BackgroundGradient();
    
    const { song, player } = this.gameData;
    const difficulty = song.chart.difficulties[song.difficultyIndex];
    
    this.finalScore = player.score;
    this.finalAccuracy = player.accuracy;
    this.scoreRating = player.getScoreRating();
    
    this.previewAudio = document.createElement("audio");
    this.previewAudio.volume = [0,25,50,75,100][Account.settings.volume] / 100;
    
    this.visibilityChangeListener = () => {
      if (document.hidden) {
        this.previewAudio?.pause();
      } else {
        this.previewAudio?.play();
      }
    };
    
    window.addEventListener('visibilitychange', this.visibilityChangeListener);

    // Save high score and check if it's a new record
    this.isNewRecord = this.saveHighScore(song, difficulty, player);
    
    this.displayResults();
    if (this.gameData.character) {
      this.showCharacterExp();
    }
    
    this.showMenu();
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  saveHighScore(song, difficulty, player) {
    if (Account.settings.autoplay) {
      return false;
    }
    
    const songKey = this.getSongKey(song);
    const difficultyKey = `${difficulty.type}${difficulty.rating}`;
    
    if (!Account.highScores[songKey]) {
      Account.highScores[songKey] = {};
    }
    
    const currentHighScore = Account.highScores[songKey][difficultyKey];
    const newScoreData = {
      score: player.score,
      accuracy: player.accuracy,
      rating: player.getScoreRating(),
      maxCombo: player.maxCombo,
      date: Date.now(),
      judgements: { ...player.judgementCounts }
    };
    
    let isNewRecord = false;
    
    if (!currentHighScore || player.score > currentHighScore.score) {
      Account.highScores[songKey][difficultyKey] = newScoreData;
      saveAccount();
      isNewRecord = true;
    }
    
    return isNewRecord;
  }

  getSongKey(song) {
    // Create unique key for song (for both local and external)
    if (song.chart.folderName) {
      return `local_${song.chart.folderName}`;
    } else if (song.chart.audioUrl) {
      // For external songs, use audio URL hash
      return `external_${this.hashString(song.chart.audioUrl)}`;
    }
    return `unknown_${Date.now()}`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  displayResults() {
    const { song, player } = this.gameData;
    const difficulty = song.chart.difficulties[song.difficultyIndex];
    
    // Banner
    this.bannerImg = document.createElement("img");
    
    this.bannerCanvas = document.createElement("canvas");
    this.bannerCtx = this.bannerCanvas.getContext("2d");
    
    this.bannerSprite = game.add.sprite(112, 10);
    
    if (song.chart.audioUrl) {
      // Load and play preview
      this.previewAudio.src = song.chart.audioUrl;
      this.previewAudio.currentTime = song.chart.sampleStart || 0;
      this.previewAudio.play();
    }
    if (song.chart.bannerUrl) {
      this.bannerImg.src = song.chart.bannerUrl;
      this.bannerImg.onload = () => {
        this.bannerCtx.drawImage(this.bannerImg, 0, 0, 72, 28);
        this.bannerSprite.loadTexture(PIXI.Texture.fromCanvas(this.bannerCanvas));
      };
    }
    
    // Song info
    const title = song.chart.titleTranslit || song.chart.title;
    
    this.songText = new Text(8, 10, `${title}`, FONTS.shaded);
    this.diffText = new Text(10, 20, `${difficulty.type} (${difficulty.rating})`);
    this.diffText.tint = new Play().getDifficultyColor(difficulty.rating);
    
    if (title.length > 25) this.songText.scrollwrite(title, 25);
    
    // Don't celebrate if autoplay is enabled
    const autoplay = Account.settings.autoplay;
    
    // Score
    this.scoreText = new Text(10, 30, `SCORE: ${autoplay ? "---" : this.finalScore.toLocaleString()}`, FONTS.default);
    
    // Accuracy
    this.accuracyText = new Text(10, 40, `ACCURACY: ${autoplay ? "---" : `${this.finalAccuracy.toFixed(2)}%`}`, FONTS.default);
    
    // Rating
    this.ratingText = new Text(10, 50, `RATING: ${autoplay ? "AUTO" : this.scoreRating}`, FONTS.shaded);
    this.ratingText.tint = this.getRatingColor(this.scoreRating);
    
    // Combo
    this.comboText = new Text(10, 60, `MAX COMBO: ${autoplay ? "---" : player.maxCombo}`, FONTS.default);
    
    // Judgements
    this.judgementsText = new Text(15, 70, autoplay ? "\nAUTOPLAY ENABLED" : this.getJudgementsText(player.judgementCounts));
    this.judgementsText.tint = autoplay ? 0xff0000 : 0xffffff;
    
    // New record indicator
    if (!autoplay && this.isNewRecord) {
      this.recordText = new Text(this.scoreText.right + 4, this.scoreText.y, "NEW RECORD!", FONTS.shaded);
      this.recordText.anchor.x = 0.5;
      this.recordText.x += this.scoreText.width / 2;
      this.recordText.tint = 0xFFD700; // Gold color
      
      // Pulse animation for new record
      game.add.tween(this.recordText.scale).to({ x: 1.2, y: 1.2 }, 500, "Linear", true).yoyo(true).repeat(-1);
    }
  }
  
  showCharacterExp() {
    const portrait = new CharacterPortrait(112, 41, this.gameData.character || null);
    
    const nameText = new Text(128, 42, "", FONTS.shaded);
    
    const levelText = new Text(0, 42, "");
    
    const expBar = new ExperienceBar(129, 50, 40, 3);
    
    if (this.gameData.character) {
      nameText.write(this.gameData.character.name);
      
      const storyEntry = this.gameData.character.getLastExperienceStoryEntry();
      const expCurve = CHARACTER_SYSTEM.EXPERIENCE_CURVE;
      
      if (storyEntry) {
        let currentExp = storyEntry.expBefore;
        let currentLevel = storyEntry.levelBefore;
        
        levelText.x = nameText.right + 8;
        levelText.write(`Lv. ${currentLevel}`);
        
        expBar.setProgress(currentExp / expCurve(currentLevel));
        
        function animate(currentExp, currentLevel) {
          if (currentExp < expCurve(currentLevel)) {
            currentExp ++;
            ENABLE_EXP_SFX && Audio.play("exp_up", 0.6);
          } else {
            currentExp = 0;
            currentLevel ++;
            levelText.write(`Lv. ${currentLevel}`);
            ENABLE_EXP_SFX && Audio.play("level_up", 0.9);
          }
          expBar.setProgress(currentExp / expCurve(currentLevel));
          if (currentLevel < storyEntry.levelAfter || currentExp < storyEntry.expAfter) {
            game.time.events.add(100, () => animate(currentExp, currentLevel));
          }
        }
        
        if (this.gameData.expGain) game.time.events.add(600, () => animate(currentExp, currentLevel));
      }
    }
  }
  
  showMenu() {
    this.navigationHint = new NavigationHint(1);
    
    const height = this.gameData.character ? 72 : 80;
    const y = this.gameData.character ? 53 : 40;
    
    const menu = new CarouselMenu(108, y, 80, height, {
      bgcolor: 'brown',
      fgcolor: '#ffffff'
    });
    
    menu.addItem("NEXT", () => {
      game.state.start("SongSelect", true, false, null, window.selectStartingIndex + 1, true);
    });
    menu.addItem("CONTINUE", () => game.state.start("SongSelect"));
    if (Account.settings.autoplay) {
      menu.addItem("DISABLE AUTOPLAY", () => {
        Account.settings.autoplay = false;
        game.state.start("SongSelect");
      });
    }
    menu.addItem("RETRY", () => game.state.start("Play", true, false, this.gameData.song));
    menu.addItem("QUIT", () => game.state.start("MainMenu"));
    
    game.onMenuIn.dispatch('results', menu);
  }
  
  getJudgementsText(judgements) {
    return `MARVELOUS: ${judgements.marvelous}\n` +
           `PERFECT: ${judgements.perfect}\n` +
           `GREAT: ${judgements.great}\n` +
           `GOOD: ${judgements.good}\n` +
           `BOO: ${judgements.boo}\n` +
           `MISS: ${judgements.miss}`;
  }

  getRatingColor(rating) {
    const colors = {
      "SSS+": 0xFFD700, // Gold
      "SSS": 0xFFD700,  // Gold
      "SS": 0xF0F0F0,   // Silver
      "S": 0xF0F0F0,    // Silver
      "A": 0x00FF00,    // Green
      "B": 0x0000FF,    // Blue
      "C": 0xFFFF00,    // Yellow
      "D": 0xFFA500,    // Orange
      "E": 0xFF0000,    // Red
      "F": 0x800080     // Purple
    };
    return colors[rating] || 0xFFFFFF;
  }

  update() {
    gamepad.update();
  }
  
  shutdown() {
    this.previewAudio.pause();
    this.previewAudio.src = null;
    this.previewAudio = null;
    this.bannerImg.src = "";
    this.bannerImg = null;
    this.bannerCanvas = null;
    this.bannerCtx = null;
    window.removeEventListener("visibilitychange", this.visibilityChangeListener);
  }
}
