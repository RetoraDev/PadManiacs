/**
 * @class ResultsMulti
 * @category Game States
 * @summary Multiplayer results screen with winner declaration
 * @constructor
 * @features
 * Side-by-side score, accuracy, rating, combo and judgement breakdown for both players
 * Winner determination driven by score, then accuracy, combo and judgement quality
 * Records win counters and declares a DRAW or PLAYER N victory with a pulsing banner
 * @description
 * The multiplayer results state extends Results to summarize a local two-player match.
 * It lays out both players' performance side by side, computes the winner with a
 * tie-breaker chain and updates the persistent win/loss counters on the account.
 * @example
 * // Open the multiplayer results for a finished match
 * game.state.start("ResultsMulti", true, false, gameResults, config);
 */
class ResultsMulti extends Results {
  constructor() {
    super();
  }
  
  /**
   * Phaser state hook that stores the game results and match configuration.
   * @param {Object} gameResults - Combined results for both players from PlayMulti
   * @param {Object} config - The multiplayer configuration used for the match
   */
  init(gameResults, config) {
    /** @type {Object} Combined results for both players */
    this.gameResults = gameResults;
    /** @type {Object} The multiplayer configuration used for the match */
    this.config = config;
    /** @type {Object} The song that was played */
    this.song = gameResults.song;
    /** @type {number} Index of the difficulty that was played */
    this.difficultyIndex = gameResults.difficultyIndex;
  }
  
  /**
   * Phaser state hook that builds the multiplayer results screen.
   */
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    
    new BackgroundGradient();
    
    this.displayResults();
  }
  
  /**
   * Renders the match summary, previews the audio and declares the winner.
   */
  displayResults() {
    // Banner
    this.bannerImg = document.createElement("img");
    
    this.bannerCanvas = document.createElement("canvas");
    this.bannerCtx = this.bannerCanvas.getContext("2d");
    
    this.bannerSprite = game.add.sprite(240 - 10 - 64, 10);
    
    // Load and play audio
    this.previewAudio = document.createElement("audio");
    this.previewAudio.volume = Account.settings.volume / 100;
    
    this.visibilityChangeListener = () => {
      if (document.hidden) {
        this.previewAudio?.pause();
      } else {
        this.previewAudio?.play();
      }
    };
    
    window.addEventListener('visibilitychange', this.visibilityChangeListener);

    if (this.song.chart.audioUrl) {
      this.previewAudio.src = this.song.chart.audioUrl;
      this.previewAudio.currentTime = this.song.chart.sampleStart || 0;
      this.previewAudio.play();
    }
    
    // Display banner 
    if (this.song.chart.bannerUrl) {
      this.bannerImg.src = this.song.chart.bannerUrl;
      this.bannerImg.onload = () => {
        this.bannerCtx.drawImage(this.bannerImg, 0, 0, 64, 16);
        this.bannerSprite.loadTexture(PIXI.Texture.fromCanvas(this.bannerCanvas));
      };
      this.bannerImg.onerror = () => this.bannerSprite.loadTexture('ui_banner_no_image_small');
    } else {
      this.bannerSprite.loadTexture('ui_banner_no_image_small');
    }
    
    // Song info
    const title = this.song.chart.titleTranslit || this.song.chart.title;
    const difficulty = this.song.chart.difficulties[this.difficultyIndex];
    
    this.songText = new Text(8, 10, `${title}`, FONTS.default_shadow);
    this.diffText = new Text(10, 20, `${difficulty.type} (${difficulty.rating})`, FONTS.default);
    this.diffText.tint = window.getDifficultyColor(difficulty.rating, true);
    
    if (title.length > 25) this.songText.scrollwrite(title, 25);
    
    this.winner = this.getWinner();
    
    this.showPlayerResults(1);
    this.showPlayerResults(2);
    
    if (this.winner == 0) {
      const drawText = new Text(game.width / 2, 112 - 14, __("DRAW||EMPATE"), FONTS.bold);
      drawText.anchor.x = 0.5;
      drawText.tint = 0xFF007F; // Purple color
      
      window.multiplayerState.counter.draw ++;
    } else if (this.winner == 1) {
      window.multiplayerState.counter.player1 ++;
    } else if (this.winner == 2) {
      window.multiplayerState.counter.player2 ++;
    }
    
    this.showMenu();
  }
  
  /**
   * Determines the match winner by comparing score, accuracy, combo and judgements.
   * @returns {number} 1, 2 or 0 for player 1, player 2 or a draw
   */
  getWinner() {
    const { player1, player2 } = this.gameResults.results;
    
    if (player1.autoplay || player2.autoplay) {
      return 0;
    }
    
    // Compare by score first
    if (player1.score > player2.score) return 1;
    if (player2.score > player1.score) return 2;
    
    // Same score: compare by accuracy
    if (player1.accuracy > player2.accuracy) return 1;
    if (player2.accuracy > player1.accuracy) return 2;
    
    // Same accuracy: compare by max combo
    if (player1.maxCombo > player2.maxCombo) return 1;
    if (player2.maxCombo > player1.maxCombo) return 2;
    
    // Same combo: compare by judgement counts (weighted)
    const getWeightedScore = (j) => {
      return (j.marvelous || 0) * 4 +
             (j.perfect || 0) * 3 +
             (j.great || 0) * 2 +
             (j.good || 0) * 1 -
             (j.boo || 0) * 2 -
             (j.miss || 0) * 5;
    };
    
    const p1Weighted = getWeightedScore(player1.judgements);
    const p2Weighted = getWeightedScore(player2.judgements);
    
    if (p1Weighted > p2Weighted) return 1;
    if (p2Weighted > p1Weighted) return 2;
    
    // Still tied: draw
    return 0;
  }
  
  /**
   * Renders a single player's results panel on the appropriate side of the screen.
   * @param {number} playerNumber - The player number (1 or 2)
   */
  showPlayerResults(playerNumber) {
    const player = this.gameResults["player" + playerNumber];
    
    const xPos = playerNumber == 1 ? 10 : 240 - 10;
    const xAnchor = playerNumber == 1 ? 0 : 1;
    
    // Don't celebrate if autoplay is enabled
    const autoplay = player.autoplay;
    
    // Score
    const scoreText = new Text(xPos, 30, __(`(Score|Puntaje): ${autoplay ? "---" : player.score.toLocaleString()}`), FONTS.default);
    scoreText.anchor.x = xAnchor;
    
    // Accuracy
    const accuracyText = new Text(xPos, 40, __(`(Accuracy|Precisión): ${autoplay ? "---" : `${player.accuracy.toFixed(2)}%`}`), FONTS.default);
    accuracyText.anchor.x = xAnchor;
    
    // Rating
    const scoreRating = player.getScoreRating();
    
    const ratingText = new Text(xPos, 50, __(`(Rating|Calificación): ${autoplay ? "AUTO" : scoreRating}`), FONTS.shaded);
    ratingText.tint = this.getRatingColor(scoreRating);
    ratingText.anchor.x = xAnchor;
    
    // Combo
    const comboText = new Text(xPos, 60, __(`(Max Combo|Combo Máx): ${autoplay ? "---" : player.maxCombo}`), FONTS.default);
    comboText.anchor.x = xAnchor;
    
    // Judgements (no se traducen)
    const judgementsText = new Text(xPos, 70, autoplay ? __("AUTOPLAY ENABLED||AUTOPLAY ACTIVADO") : this.getJudgementsText(player.judgementCounts));
    judgementsText.tint = autoplay ? 0xff0000 : 0xffffff;
    judgementsText.anchor.x = xAnchor;
    
    // Winner record indicator
    if (!autoplay && this.winner == playerNumber) {
      const winnerText = new Text(game.width / 2, 112 - 14, __(`PLAYER ${playerNumber} WINS!||¡JUGADOR ${playerNumber} GANA!`), FONTS.bold);
      winnerText.anchor.x = 0.5;
      winnerText.tint = 0xFFD700; // Gold color
      
      // Pulse animation for new record
      game.add.tween(winnerText.scale).to({ x: 1.2, y: 1.2 }, 500, "Linear", true).yoyo(true).repeat(-1);
    }
  }
  
  /**
   * Builds the multiplayer results navigation menu.
   */
  showMenu() {
    const menu = new CarouselMenu(game.width / 2 - 25, 50, 50, 80, {
      gradient: false,
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    
    menu.addItem(__("Next||Siguiente"), () => {
      game.state.start("SongSelect", true, false, null, window.selectStartingIndex + 1, true, "auto", this.gameResults.playlistKey);
    });
    menu.addItem(__("Continue||Continuar"), () => game.state.start("SongSelect", true, false, null, window.selectStartingIndex, false, "auto", this.gameResults.playlistKey));
    menu.addItem(__("Retry||Reintentar"), () => game.state.start("PlayMulti", true, false, this.config, undefined, undefined, undefined, this.gameResults.playlistKey));
    menu.addItem(__("Quit||Salir"), () => game.state.start("MainMenu"));
    
    game.onMenuIn.dispatch('results_multi', menu);
  }
}