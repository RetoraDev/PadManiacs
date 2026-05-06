class PlayMulti extends Play {
  constructor() {
    super();
  }
  
  init(config) {
    const { song, difficultyIndex } = config;
    
    super.init({ chart: song, difficultyIndex }, difficultyIndex, false, false);
    
    this.config = config;
    
    // Disable character system
    this.currentCharacter = null;
    this.skillSystem.character = null;
  }
  
  create() {
    super.create();
  }
  
  createHud() {
    this.backgroundGradient = new BackgroundGradient(0, 0.4, 5000);

    this.hud = game.add.sprite(0, 0, "ui_hud_background_multi", 0);
    
    this.p1Hud = game.add.sprite(0, 0, "ui_hud_player_parent_multi", 0);
    this.hud.addChild(this.p1Hud);
    
    this.p2Hud = game.add.sprite(0, 0, "ui_hud_player_parent_multi", 1);
    this.hud.addChild(this.p2Hud);
    
    this.overHud = game.add.sprite(0, 0);
    
    // Get song title
    const title = this.song.chart.titleTranslit || this.song.chart.title;
    
    // Song title text
    this.songTitleText = new Text(game.width / 2, 11, "", null, this.hud);
    this.songTitleText.anchor.x = 0.5;
    this.songTitleText.write(title, 21);
    
    // P1 Health Text
    this.p1HealthText = new Text(1, 3, "100", null, this.p1Hud);
    
    // P2 Health Text
    this.p2HealthText = new Text(game.width - 1, 3, "100", null, this.p2Hud);
    this.p2HealthText.anchor.x = 1;
    
    // Tint both texts
    this.p1HealthText.tint = 0x96918e;
    this.p2HealthText.tint = 0x96918e;
    
    // P1 Score Text 
    this.p1ScoreText = new Text(16, 7, "00000000", null, this.hud);
    
    // P2 Score Text 
    this.p2ScoreText = new Text(game.width - 16, 7, "00000000", null, this.hud);
    this.p2ScoreText.anchor.x = 1;
    
    // P1 Judgement Text
    this.p1JudgementText = new Text(0, 60, "", FONTS.shaded);
    this.p1JudgementText.anchor.set(0.5);
    
    // P2 Judgement Text
    this.p2JudgementText = new Text(0, 60, "", FONTS.shaded);
    this.p2JudgementText.anchor.set(0.5);
    
    // P1 Accuracy Bar
    this.p1AccuracyBar = game.add.sprite(2, 108, "ui_accuracy_bar_multi");
    this.hud.addChild(this.p1AccuracyBar);
    
    // P2 Accuracy Bar
    this.p2AccuracyBar = game.add.sprite(117, 108, "ui_accuracy_bar_multi");
    this.hud.addChild(this.p2AccuracyBar);
    
    // P1 Combo Number
    this.p1ComboText = new Text(1, 106, "0", FONTS.combo);
    this.p1ComboText.anchor.y = 1;

    // P2 Combo Number
    this.p2ComboText = new Text(191, 106, "0", FONTS.combo);
    this.p2ComboText.anchor.set(1);
    
    // P1 Lifebar
    this.p1LifebarStart = game.add.sprite(14, 3, "ui_lifebar", 0);
    this.p1LifebarMiddle = game.add.sprite(1, 0, "ui_lifebar", 1);
    this.p1LifebarMiddle.width = 71;
    this.p1LifebarEnd = game.add.sprite(14, 0, "ui_lifebar", 2);
    this.p1LifebarStart.addChild(this.p1LifebarMiddle);
    this.p1LifebarStart.addChild(this.p1LifebarEnd);
    this.p1Hud.addChild(this.p1LifebarStart);
    
    // P2 Lifebar
    this.p2LifebarStart = game.add.sprite(105, 3, "ui_lifebar", 0);
    this.p2LifebarMiddle = game.add.sprite(1, 0, "ui_lifebar", 1);
    this.p2LifebarMiddle.width = 71;
    this.p2LifebarEnd = game.add.sprite(105, 0, "ui_lifebar", 2);
    this.p2LifebarStart.addChild(this.p2LifebarMiddle);
    this.p2LifebarStart.addChild(this.p2LifebarEnd);
    this.p2Hud.addChild(this.p2LifebarStart);
    
    // Autoplay texts
    this.autoplayText = new Text(game.width / 2, 93, "METRONOME", FONTS.stroke, this.hud);
    this.autoplayText.anchor.x = 0.5;
    
    this.p1AutoplayText = new Text(2, 16, "AUTOPLAY", FONTS.stroke, this.hud);
    
    this.p2AutoplayText = new Text(190, 16, "AUTOPLAY", FONTS.stroke, this.hud);
    this.p2AutoplayText.anchor.x = 1;
  }
  
  createVisualizer() {
    super.createVisualizer(78, 103, 36, 7);
  }
  
  setupPlayer() {
    this.player1 = new FirstPlayer(this, this.config.player1.settings);
    this.player2 = new SecondPlayer(this, this.config.player2.settings);
    
    this.player = this.player1;
  }
  
  getStatsContent() {
    return "";
  }
  
  getGameResults() {
    return {
      song: this.song,
      difficultyIndex: this.difficultyIndex,
      results: {
        player1: super.getGameResults(this.player1),
        player2: super.getGameResults(this.player2)
      },
      player1: this.player1,
      player2: this.player2
    };
  }
  
  restartSong() {
    game.state.start("PlayMulti", true, false, this.config);
  }
  
  songEnd() {
    // Forget preloaded backgrounds
    Object.entries(this.preloadedBackgroundElements).map(entry => entry[1] || null).forEach(element => {
      if (element) {
        element.src = "";
      }
    });
    
    // Return to editor if on playtest mode
    if (this.playtestMode) {
      game.state.start("Editor", true, false, this.song);
      return;
    }
    
    // Get results
    const gameResults = this.getGameResults();
    
    game.state.start("ResultsMulti", true, false, gameResults, this.config);
  }
  
  checkFullCombo(player) {
    if (!this.started && player.fullComboStarted) return;
    
    player.fullComboStarted = true;
    
    let hitNotes = 0;
      
    for (const [judgement, count] of Object.entries(player.judgementCounts)) {
      if (judgement != "miss") {
        hitNotes += count;
      }
    }
      
    if (hitNotes >= player.totalNotes) {
      const flawless = this.player.accuracy >= 99.75;
          
      game.tweens.removeFrom(player.judgementText);
          
      player.judgementText.visible = true;
      player.judgementText.alpha = 1;
      player.judgementText.tint = flawless ? 0xffb200 : 0xdad2eb;
      player.judgementText.write(flawless ? "FLAWLESS!" : "FULL COMBO!");
      
      game.time.events.loop(100, () => {
        if (player.judgementText.alpha) {
          player.judgementText.alpha = 0;
        } else {
          player.judgementText.alpha = 1;
        }
      });
    }
  }
  
  update() {
    gamepad.update();
        
    if (this.isPaused) return;
    
    // Pause with start button
    if (gamepad.pressed.start) {
      this.togglePause();
    }

    // Update lyrics with current time
    if (this.hasLyricsFile && this.lyrics && this.started) {
      const currentTime = this.getCurrentTime().now;
      this.lyrics.move(currentTime);
    }
    
    // Update visualizer
    if (this.visualizer && game.time.now - this.lastVisualizerUpdateTime >= game.time.elapsedMS * 2) {
      this.visualizer.update();
      this.lastVisualizerUpdateTime = game.time.now;
    }
    
    // Handle assist tick toggle with Select button
    if (gamepad.pressed.select) {
      this.metronome.toggle();
    }
    
    // Update assist tick metronome
    if (this.metronome) {
      this.metronome.update();
    }
    
    // Update autoplay text (used for metronome)
    this.autoplayText.visible = this.metronome.enabled;

    this.p1AutoplayText.visible = this.player1.autoplay;
    this.p2AutoplayText.visible = this.player2.autoplay;
    
    this.player1.update();
    this.player2.update();
    
    if (this.started) this.updateBackgrounds();
    
    this.hud.bringToTop();
    
    this.overHud.bringToTop();
    
    this.p1JudgementText.bringToTop();
    this.p2JudgementText.bringToTop();
    this.p1ComboText.bringToTop();
    this.p2ComboText.bringToTop();
    
    this.checkFullCombo(this.player1);
    this.checkFullCombo(this.player2);
  }
  
  render() {
    if (this.player1 && this.player2) {
      this.player1.render();
      this.player2.render();
    }
  }
}