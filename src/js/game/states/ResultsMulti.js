class ResultsMulti extends Results {
  constructor() {
    super();
  }
  
  init(gameResults, config) {
    this.gameResults = gameResults;
    this.config = config;
    this.song = gameResults.song;
    this.difficultyIndex = gameResults.difficultyIndex;
  }
  
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    
    new BackgroundGradient();
    
    this.displayResults();
  }
  
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
    this.diffText.tint = new Play().getDifficultyColor(difficulty.rating);
    
    if (title.length > 25) this.songText.scrollwrite(title, 25);
    
    this.winner = this.getWinner();
    
    this.showPlayerResults(1);
    this.showPlayerResults(2);
    
    if (this.winner == 0) {
      const drawText = new Text(game.width / 2, 112 - 14, "DRAW", FONTS.bold);
      drawText.anchor.x = 0.5;
      drawText.tint = 0xFF007F; // Purple color
      
      window.multiplayerState.counter.draw ++;
    } else if (this.winner == 1) {
      window.multiplayerState.counter.player1 ++;
    } else if (this.winner == 2) {
      window.multiplayerState.counter.player1 ++;
    }
    
    this.showMenu();
  }
  
  getWinner() {
    const { player1, player2 } = this.gameResults.results;
    
    // TODO: Winner calculation would more complex logic
    if (player1.autoplay || player2.autoplay) {
      return 0; // Draw case: Autoplay
    } else if (player1.score == player2.score) {
      return 0; // Draw case: Both players have same score
    } else if (player1.score > player2.score) {
      return 1; // Player 1 wins
    } else {
      return 2; // Player 2 wins
    }
  }
  
  showPlayerResults(playerNumber = playerNumber) {
    const player = this.gameResults["player" + playerNumber];
    
    const xPos = playerNumber == 1 ? 10 : 240 - 10;
    const xAnchor = playerNumber == 1 ? 0 : 1;
    
    // Don't celebrate if autoplay is enabled
    const autoplay = player.autoplay;
    
    // Score
    const scoreText = new Text(xPos, 30, `Score: ${autoplay ? "---" : player.score.toLocaleString()}`, FONTS.default);
    scoreText.anchor.x = xAnchor;
    
    // Accuracy
    const accuracyText = new Text(xPos, 40, `Accuracy: ${autoplay ? "---" : `${player.accuracy.toFixed(2)}%`}`, FONTS.default);
    accuracyText.anchor.x = xAnchor;
    
    // Rating
    const scoreRating = player.getScoreRating();
    
    const ratingText = new Text(xPos, 50, `Rating: ${autoplay ? "AUTO" : scoreRating}`, FONTS.shaded);
    ratingText.tint = this.getRatingColor(scoreRating);
    ratingText.anchor.x = xAnchor;
    
    // Combo
    const comboText = new Text(xPos, 60, `Max Combo: ${autoplay ? "---" : player.maxCombo}`, FONTS.default);
    comboText.anchor.x = xAnchor;
    
    // Judgements
    const judgementsText = new Text(xPos, 70, autoplay ? "\nAUTOPLAY ENABLED" : this.getJudgementsText(player.judgementCounts));
    judgementsText.tint = autoplay ? 0xff0000 : 0xffffff;
    judgementsText.anchor.x = xAnchor;
    
    // Winner record indicator
    if (!autoplay && this.winner == playerNumber) {
      const winnerText = new Text(game.width / 2, 112 - 14, `PLAYER ${playerNumber} WINS!`, FONTS.bold);
      winnerText.anchor.x = 0.5;
      winnerText.tint = 0xFFD700; // Gold color
      
      // Pulse animation for new record
      game.add.tween(winnerText.scale).to({ x: 1.2, y: 1.2 }, 500, "Linear", true).yoyo(true).repeat(-1);
    }
  }
  
  showMenu() {
    const menu = new CarouselMenu(game.width / 2 - 25, 50, 50, 80, {
      gradient: false,
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    
    menu.addItem("Next", () => {
      game.state.start("SongSelect", true, false, null, window.selectStartingIndex + 1, true, "auto");
    });
    menu.addItem("Continue", () => game.state.start("SongSelect"));
    menu.addItem("Retry", () => game.state.start("PlayMulti", true, false, this.config));
    menu.addItem("Quit", () => game.state.start("MainMenu"));
    
    game.onMenuIn.dispatch('results_multi', menu);
  }
}