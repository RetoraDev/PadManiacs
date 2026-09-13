/**
 * @class PlayMulti
 * @category Game States
 * @summary Two-player local multiplayer gameplay state
 * @constructor
 * @features
 * Two independent players sharing one chart with separate scores, lifebars and combos
 * Split-layout HUD with per-player score, accuracy, combo and judgement text
 * Per-player autoplay flags plus a shared metronome assist tick display
 * @description
 * The multiplayer gameplay state extends the single player Play state to run two
 * simultaneous players on a shared chart. Each player keeps an independent combo,
 * score, lifebar, accuracy and autoplay flag, and the state resolves to a combined
 * results object consumed by the ResultsMulti screen.
 * @example
 * // Launch a local multiplayer game for two configured players
 * game.state.start("PlayMulti", true, false, {
 *   song: song,
 *   difficultyIndex: 0,
 *   player1: { settings: { autoplay: false } },
 *   player2: { settings: { autoplay: true } }
 * });
 */
class PlayMulti extends Play {
  constructor() {
    super();
  }
  
  /**
   * Phaser state hook that forwards the shared chart to Play.init and stores the config.
   * @param {Object} config - Multiplayer config with song, difficultyIndex and player settings
   * @param {number} _ - Unused difficulty placeholder
   * @param {boolean} __ - Unused playtest mode placeholder
   * @param {boolean} ___ - Unused autoplay placeholder
   * @param {string} playlistKey - Optional playlist key for the song
   */
  init(config, _, __, ___, playlistKey) {
    const { song, difficultyIndex } = config;
    
    super.init({ chart: song, difficultyIndex }, difficultyIndex, undefined, undefined, playlistKey);
    
    /** @type {Object} The multiplayer configuration with per-player settings */
    this.config = config;
    
    // Disable character system
    this.currentCharacter = null;
    this.skillSystem.character = null;
  }
  
  /**
   * Phaser state hook that builds the shared HUD and player layout.
   */
  create() {
    super.create();
  }
  
  /**
   * Builds the split multiplayer HUD with per-player score, lifebar and combo.
   */
  createHud() {
    this.backgroundGradient = new BackgroundGradient(0, 0.4, 5000);

    this.hud = game.add.sprite(0, 0);
        
    this.hudFlashShape = game.add.sprite(game.width / 2, game.height / 2, 'ui_hud_flash_shape_multi');
    this.hudFlashShape.anchor.set(0.5);
    this.hudFlashShape.alpha = 0;
    this.hud.addChild(this.hudFlashShape);
    
    this.hudTop = game.add.sprite(0, -40, 'ui_hud_background_top_multi');
    this.hudTop.alpha = 0;
    this.hud.addChild(this.hudTop);
    
    this.hudBottom = game.add.sprite(0, 40, 'ui_hud_background_bottom_multi');
    this.hudBottom.alpha = 0;
    this.hud.addChild(this.hudBottom);
    
    /** @type {Phaser.Sprite} HUD container for player 1 */
    this.p1Hud = game.add.sprite(0, 0, "ui_hud_player_parent_multi", 0);
    this.hudTop.addChild(this.p1Hud);
    
    /** @type {Phaser.Sprite} HUD container for player 2 */
    this.p2Hud = game.add.sprite(0, 0, "ui_hud_player_parent_multi", 1);
    this.hudTop.addChild(this.p2Hud);
    
    this.overHud = game.add.sprite(0, 0);
    
    // Get song difficulty
    const difficulty = this.song.chart.difficulties[this.song.difficultyIndex];
    
    this.difficultyBanner = game.add.sprite(game.width / 2, 0, "ui_difficulty_banner_multi", 0);
    this.difficultyBanner.tint = window.getDifficultyColor(difficulty.rating, true);
    this.difficultyBanner.anchor.x = 0.5;
    this.hudTop.addChild(this.difficultyBanner);
    
    this.difficultyTypeText = new Text(0, 1, difficulty.type.substr(0, 9), FONTS.default, this.difficultyBanner);
    this.difficultyTypeText.anchor.x = 0.5;
    this.difficultyTypeText.alpha = 0.7;
    game.add.tween(this.difficultyTypeText).to({ alpha: 1 }, 400, "Linear", true).repeat(-1).yoyo(true);
    
    // Get song title
    const title = this.song.chart.titleTranslit || this.song.chart.title;
    
    // Song title text
    this.songTitleText = new Text(game.width / 2, 11, "", null, this.hudTop);
    this.songTitleText.anchor.x = 0.5;
    this.songTitleText.write(title, 21);
    
    // P1 Health Text
    this.p1HealthText = new Text(1, 3, "100", FONTS.tiny_number, this.p1Hud);
    
    // P2 Health Text
    this.p2HealthText = new Text(game.width - 1, 3, "100", FONTS.tiny_number, this.p2Hud);
    this.p2HealthText.anchor.x = 1;
    
    // Tint both texts
    this.p1HealthText.tint = 0x96918e;
    this.p2HealthText.tint = 0x96918e;
    
    // P1 Score Text 
    this.p1ScoreText = new Text(16, 7, "00000000", FONTS.tiny_number, this.p1Hud);
    
    // P2 Score Text 
    this.p2ScoreText = new Text(game.width - 16, 7, "00000000", FONTS.tiny_number, this.p2Hud);
    this.p2ScoreText.anchor.x = 1;
    
    // P1 Judgement Text
    this.p1JudgementText = game.add.sprite(0, 75, "judgement", 0);
    this.p1JudgementText.alpha = 0;
    this.p1JudgementText.anchor.set(0.5);

    // P2 Judgement Text
    this.p2JudgementText = game.add.sprite(0, 75, "judgement", 0);
    this.p2JudgementText.alpha = 0;
    this.p2JudgementText.anchor.set(0.5);
    
    // P1 Accuracy Bar
    this.p1AccuracyBar = game.add.sprite(2, 136, "ui_accuracy_bar_multi");
    this.hud.addChild(this.p1AccuracyBar);
    
    // P2 Accuracy Bar
    this.p2AccuracyBar = game.add.sprite(146, 136, "ui_accuracy_bar_multi");
    this.hud.addChild(this.p2AccuracyBar);
    
    // P1 Combo Number
    this.p1ComboText = new Text(1, 140 - 6, "0", FONTS.biscuitlocker_combo, this.hudBottom);
    this.p1ComboText.anchor.y = 1;

    // P2 Combo Number
    this.p2ComboText = new Text(240 - 1, 140 - 6, "0", FONTS.biscuitlocker_combo, this.hudBottom);
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
    this.p2LifebarStart = game.add.sprite(153, 3, "ui_lifebar", 0);
    this.p2LifebarMiddle = game.add.sprite(1, 0, "ui_lifebar", 1);
    this.p2LifebarMiddle.width = 71;
    this.p2LifebarEnd = game.add.sprite(105, 0, "ui_lifebar", 2);
    this.p2LifebarStart.addChild(this.p2LifebarMiddle);
    this.p2LifebarStart.addChild(this.p2LifebarEnd);
    this.p2Hud.addChild(this.p2LifebarStart);
    
    // Autoplay texts
    this.autoplayText = new Text(game.width / 2, 93, "METRONOME", FONTS.tiny_stroke, this.hud);
    this.autoplayText.anchor.x = 0.5;
    
    this.p1AutoplayText = new Text(2, 16, "AUTOPLAY", FONTS.tiny_stroke, this.hud);
    
    this.p2AutoplayText = new Text(190, 16, "AUTOPLAY", FONTS.tiny_stroke, this.hud);
    this.p2AutoplayText.anchor.x = 1;
  }
  
  /**
   * Creates the shared center visualizer in the multiplayer HUD layout.
   */
  createVisualizer() {
    super.createVisualizer(97, 131, 46, 7);
  }
  
  /**
   * Spawns the FirstPlayer and SecondPlayer with their own input settings.
   */
  setupPlayer() {
    this.player1 = new FirstPlayer(this, this.config.player1.settings);
    this.player2 = new SecondPlayer(this, this.config.player2.settings);
    
    this.player = this.player1;
  }
  
  /**
   * Overrides the pause stats block for the multiplayer layout.
   * @returns {string} An empty string (stats are shown via separate player texts)
   */
  getStatsContent() {
    return "";
  }
  
  /**
   * Collects both players' results into a combined multiplayer result object.
   * @returns {Object} The multiplayer game results
   */
  getGameResults() {
    return {
      song: this.song,
      playlistKey: this.playlistKey,
      difficultyIndex: this.difficultyIndex,
      results: {
        player1: super.getGameResults(this.player1),
        player2: super.getGameResults(this.player2)
      },
      player1: this.player1,
      player2: this.player2
    };
  }
  
  /**
   * Restarts the multiplayer game with the same configuration.
   */
  restartSong() {
    game.state.start("PlayMulti", true, false, this.config);
  }
  
  /**
   * Finalizes the multiplayer run and opens the ResultsMulti state.
   */
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
    
    // Track multiplayer games played
    if (!this.autoplay) {
      Account.stats.multiplayerGamesPlayed = (Account.stats.multiplayerGamesPlayed || 0) + 1;
      saveAccount();
    }
    
    // Get results
    const gameResults = this.getGameResults();
    
    game.state.start("ResultsMulti", true, false, gameResults, this.config);
  }
  
  /**
   * Shows the full combo or flawless banner for a player when achieved.
   * @param {Object} player - The player to check for a full combo
   */
  checkFullCombo(player) {
    if (player && !this.started && player.fullComboStarted) return;
    
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
  
  /**
   * Phaser lifecycle hook called every frame; updates both players.
   */
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
  
  /**
   * Phaser render hook that renders both players' note objects.
   */
  render() {
    if (this.player1 && this.player2) {
      this.player1.render();
      this.player2.render();
    }
  }
}