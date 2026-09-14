/**
 * @class Results
 * @category Game States
 * @summary Displays gameplay results and high scores
 * @constructor
 * @features
 * Shows final score, accuracy, letter rating, max combo and judgement breakdown
 * Saves high scores and celebrates a new record with a pulsing banner
 * Character portrait with an animated experience and level-up progression
 * Navigation menu to continue, retry or quit back to the main menu
 * @description
 * The Results state summarizes a completed playthrough. It shows the performance
 * breakdown, persists high scores to the account and marks a new record, and can
 * display the active character's experience gain with a level-up animation.
 * @example
 * // Open results for a finished playthrough
 * game.state.start("Results", true, false, {
 *   song: songData,
 *   player: playerObj,
 *   character: myCharacter,
 *   autoplay: false,
 *   expGain: 120
 * });
 */
class Results {
  /**
   * Phaser state hook that stores the game data and resets the result fields.
   * @param {Object} gameData - The results payload produced by the Play state
   */
  init(gameData) {
    /** @type {Object} The payload passed from the Play state */
    this.gameData = gameData;
    /** @type {boolean} Whether the run set a new high score */
    this.isNewRecord = false;
    /** @type {number} The final score to display */
    this.finalScore = 0;
    /** @type {number} The final accuracy percentage to display */
    this.finalAccuracy = 0;
    /** @type {string} The letter rating achieved for the run */
    this.scoreRating = "";
  }

  /**
   * Phaser state hook that saves the high score and builds the results screen.
   */
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    new BackgroundGradient();
    
    const { song, player } = this.gameData;
    const difficulty = song.chart.difficulties[song.difficultyIndex];
    
    this.finalScore = player.score;
    this.finalAccuracy = player.accuracy;
    this.scoreRating = player.getScoreRating();
    
    /** @type {HTMLAudioElement} Audio element playing the song preview */
    this.previewAudio = document.createElement("audio");
    this.previewAudio.volume = Account.settings.volume / 100;
    
    /** @type {Function} Handler pausing or resuming the preview on tab visibility changes */
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

  /**
   * Saves the run's score to the account if it beats the current high score.
   * @param {Object} song - The song that was played
   * @param {Object} difficulty - The difficulty that was played
   * @param {Object} player - The player object carrying the results
   * @returns {boolean} Whether the run set a new high score
   */
  saveHighScore(song, difficulty, player) {
    if (this.gameData.autoplay) {
      return false;
    }
    
    const songKey = window.getSongKey(song);
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

  /**
   * Hashes a string into a compact 32-bit base-36 identifier.
   * @param {string} str - The string to hash
   * @returns {string} The hashed identifier
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Renders the banner, song info, score, accuracy, rating and combo texts.
   */
  displayResults() {
    const { song, player } = this.gameData;
    const difficulty = song.chart.difficulties[song.difficultyIndex];
    
    // Banner
    /** @type {HTMLImageElement} Image element loading the song banner */
    this.bannerImg = document.createElement("img");
    
    /** @type {HTMLCanvasElement} Canvas the banner is drawn onto */
    this.bannerCanvas = document.createElement("canvas");
    /** @type {CanvasRenderingContext2D} 2D context of the banner canvas */
    this.bannerCtx = this.bannerCanvas.getContext("2d");
    
    /** @type {Phaser.Sprite} Sprite displaying the banner texture */
    this.bannerSprite = game.add.sprite(160, 10);
    
    if (song.chart.audioUrl) {
      // Load and play preview
      this.previewAudio.src = song.chart.audioUrl;
      this.previewAudio.currentTime = song.chart.sampleStart || 0;
      this.previewAudio.play();
    }
    if (song.chart.bannerUrl) {
      this.bannerImg.src = song.chart.bannerUrl;
      this.bannerImg.onload = () => {
        this.bannerCtx.clearRect(0, 0, 72, 28);
        this.bannerCtx.drawImage(this.bannerImg, 0, 0, 72, 28);
        this.bannerSprite.loadTexture(PIXI.Texture.fromCanvas(this.bannerCanvas));
      };
      this.bannerImg.onerror = () => this.bannerSprite.loadTexture('ui_banner_no_image_small');
    } else {
      this.bannerSprite.loadTexture('ui_banner_no_image_small');
    }
    
    // Song info
    const title = song.chart.titleTranslit || song.chart.title;
    
    /** @type {Text} Label with the cleaned-up song title */
    this.songText = new Text(8, 10, `${title}`, FONTS.shaded);
    /** @type {Text} Label with the difficulty type and rating */
    this.diffText = new Text(10, 20, `${difficulty.type} (${difficulty.rating})`);
    this.diffText.tint = window.getDifficultyColor(difficulty.rating, true);
    
    if (title.length > 25) this.songText.scrollwrite(title, 25);
    
    // Don't celebrate if autoplay is enabled
    const autoplay = this.gameData.autoplay;
    
    // Score
    /** @type {Text} Final score label */
    this.scoreText = new Text(10, 30, __(`(Score|Puntaje): ${autoplay ? "---" : this.finalScore.toLocaleString()}`), FONTS.default);
    
    // Accuracy
    /** @type {Text} Final accuracy percentage label */
    this.accuracyText = new Text(10, 40, __(`(Accuracy|Precisión): ${autoplay ? "---" : `${this.finalAccuracy.toFixed(2)}%`}`), FONTS.default);
    
    // Rating
    /** @type {Text} Score rating label */
    this.ratingText = new Text(10, 50, __(`(Rating|Calificación): ${autoplay ? "AUTO" : this.scoreRating}`), FONTS.default);
    this.ratingText.tint = this.getRatingColor(this.scoreRating);
    
    // Combo
    /** @type {Text} Maximum combo label */
    this.comboText = new Text(10, 60, __(`(Max Combo|Combo Máx): ${autoplay ? "---" : player.maxCombo}`), FONTS.default);
    
    // Judgements
    /** @type {Text} Judgement count breakdown label */
    this.judgementsText = new Text(15, 70, autoplay ? __("AUTOPLAY ENABLED||AUTOPLAY ACTIVADO") : this.getJudgementsText(player.judgementCounts));
    this.judgementsText.tint = autoplay ? 0xff0000 : 0xffffff;

    // New record indicator
    if (!autoplay && this.isNewRecord) {
      /** @type {?Text} "NEW RECORD!" celebration label */
      this.recordText = new Text(game.width / 2, 110, __("NEW RECORD!||¡NUEVO RÉCORD!"), FONTS.bold_shadow);
      this.recordText.anchor.x = 0.5;
      this.recordText.x += this.scoreText.width / 2;
      this.recordText.tint = 0xFFD700; // Gold color
      
      // Pulse animation for new record
      game.add.tween(this.recordText.scale).to({ x: 1.2, y: 1.2 }, 500, "Linear", true).yoyo(true).repeat(-1);
    }
  }
  
  /**
   * Shows the character portrait and animates the experience gain.
   */
  showCharacterExp() {
    const portrait = new CharacterPortrait(160, 41, this.gameData.character || null);
    
    const nameText = new Text(176, 42, "", FONTS.shaded);
    
    const levelText = new Text(0, 42, "");
    
    const expBar = new ExperienceBar(177, 50, 40, 3);
    
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
  
  /**
   * Builds the results navigation menu with continue, retry and quit options.
   */
  showMenu() {
    /** @type {NavigationHint} Hint prompts for the results controls */
    this.navigationHint = new NavigationHint('general_no_b');
    
    const height = this.gameData.character ? 72 : 80;
    const y = this.gameData.character ? 53 : 40;
    
    const menu = new CarouselMenu(160 - 4, y, 80, height, {
      bgcolor: 'brown',
      fgcolor: '#ffffff'
    });
    
    menu.addItem(__("Next||Siguiente"), () => {
      game.state.start("SongSelect", true, false, null, window.selectStartingIndex + 1, true, "auto", this.gameData.playlistKey);
    });
    menu.addItem(__("Continue||Continuar"), () => game.state.start("SongSelect", true, false, null, window.selectStartingIndex, false, "auto", this.gameData.playlistKey));
    if (Account.settings.autoplay) {
      menu.addItem(__("Disable Autoplay||Desactivar Autoplay"), () => {
        Account.settings.autoplay = false;
        game.state.start("SongSelect", window.selectStartingIndex, true, "auto", this.gameData.playlistKey);
      });
    }
    menu.addItem(__("Retry||Reintentar"), () => game.state.start("Play", true, false, this.gameData.song, this.gameData.song.difficultyIndex, undefined, undefined, this.gameData.playlistKey));
    menu.addItem(__("Quit||Salir"), () => game.state.start("MainMenu"));
    
    game.onMenuIn.dispatch('results', menu);
  }
  
  /**
   * Formats the judgement counts into a multi-line summary.
   * @param {Object} judgements - The judgement count object
   * @returns {string} The formatted judgement text
   */
  getJudgementsText(judgements) {
    return `Marvelous: ${judgements.marvelous}\n` +
           `Perfect: ${judgements.perfect}\n` +
           `Great: ${judgements.great}\n` +
           `Good: ${judgements.good}\n` +
           `Boo: ${judgements.boo}\n` +
           `Miss: ${judgements.miss}`;
  }

  /**
   * Maps a letter rating to its display tint color.
   * @param {string} rating - The letter rating achieved
   * @returns {number} The RGB tint color for the rating
   */
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

  /**
   * Phaser lifecycle hook called every frame to poll gamepad input.
   */
  update() {
    gamepad.update();
  }
  
  /**
   * Phaser lifecycle hook called when leaving the state; stops the preview audio.
   */
  shutdown() {
    this.previewAudio.pause();
    this.previewAudio.src = null;
    this.previewAudio = null;
    this.bannerImg.onload = null;
    this.bannerImg.onerror = null;
    this.bannerImg.src = "";
    this.bannerImg = null;
    this.bannerCanvas = null;
    this.bannerCtx = null;
    window.removeEventListener("visibilitychange", this.visibilityChangeListener);
  }
}
