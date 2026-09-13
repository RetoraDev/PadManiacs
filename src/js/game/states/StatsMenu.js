/**
 * @class StatsMenu
 * @category Game States
 * @summary Player statistics display
 * @constructor
 * @features
 * Two-column career statistics layout
 * Live refresh via a timed update loop
 * Any key press returns to the main menu
 * @description
 * The StatsMenu state presents cumulative account statistics in two formatted
 * columns covering games, scores, time, sessions, streaks and high scores. The
 * text is refreshed on a short timer loop while visible. Any gamepad or mouse
 * input returns the player to the main menu, and the timer is stopped on
 * shutdown.
 * @example
 * // Modding usage example
 * // Open the statistics screen
 * game.state.start("StatsMenu");
 *
 * // Read raw stats for custom tooling
 * Account.stats.totalGamesPlayed;
 */
class StatsMenu {
  /**
   * Creates the statistic text widgets and starts the refresh timer.
   */
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    new BackgroundGradient();
    
    /** @type {Text} Title text for the statistics screen. */
    this.titleText = new Text(120, 10, __("PLAYER STATISTICS||ESTADÍSTICAS DE JUGADOR"));
    this.titleText.anchor.x = 0.5;
    
    /** @type {Text} Left column of statistics text. */
    this.leftColumn = new Text(4, 70, "");
    this.leftColumn.anchor.y = 0.5;
    
    /** @type {Text} Right column of statistics text. */
    this.rightColumn = new Text(120, 70, "");
    this.rightColumn.anchor.y = 0.5;
    
    /** @type {Text} Instruction text for leaving the screen. */
    this.instructionText = new Text(120, 120, __("PRESS ANY KEY TO LEAVE||PRESIONA CUALQUIER TECLA PARA SALIR"));
    this.instructionText.anchor.x = 0.5;
    
    this.updateStatsText();
    
    /** @type {Phaser.TimerEvent} Timer loop that refreshes the statistics. */
    this.updateTimer = game.time.events.loop(100, this.updateStatsText, this);
    
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  /**
   * Formats a seconds count as an HH:MM:SS duration string.
   * @param {number} seconds - Total seconds to format.
   * @returns {string} Zero-padded time string.
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Formats seconds as a compact legible duration such as "12m 5s".
   * @param {number} seconds - Total seconds to format.
   * @returns {string} Compact duration string.
   */
  formatSessionTime(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  /**
   * Rebuilds the two statistic columns from the account stats object.
   */
  updateStatsText() {
    if (!Account.stats) return;
    
    const stats = Account.stats;
    
    let leftColumnText = "";
    let rightColumnText = "";
    
    leftColumnText += __("(Games Played|Partidas Jugadas): ") + stats.totalGamesPlayed + "\n";
    leftColumnText += __("(Total Score|Puntaje Total): ") + stats.totalScore.toLocaleString() + "\n";
    leftColumnText += __("(Max Combo|Combo Máx): ") + stats.maxCombo + "\n";
    leftColumnText += __("(Perfect Games|Partidas Perfectas): ") + stats.perfectGames + "\n";
    leftColumnText += __("(Full Combos|Combos Completos): ") + (stats.fullCombos || 0) + "\n";
    leftColumnText += __("(Flawless Full Combos|Combos Completos Impecables): ") + (stats.flawlessFullCombos || 0) + "\n";
    leftColumnText += __("(Max FC Streak|Máx Racha de FC): ") + (stats.maxFullComboStreak || 0) + "\n";
    leftColumnText += __("(Total Notes Hit|Notas Acertadas): ") + (stats.totalNotesHit || 0) + "\n";
    leftColumnText += __("(Max Marvelous In Game|Máx Marvelous en Partida): ") + (stats.maxMarvelousInGame || 0) + "\n";
    leftColumnText += __("(Multiplayer Games|Partidas Multijugador): ") + (stats.multiplayerGamesPlayed || 0) + "\n";
    
    rightColumnText += __("(Total Time|Tiempo Total): ") + this.formatTime(stats.totalTimePlayed) + "\n";
    rightColumnText += __("(Play Sessions|Sesiones de Juego): ") + stats.totalPlaySessions + "\n";
    rightColumnText += __("(Avg Session|Sesión Promedio): ") + this.formatSessionTime(stats.averageSessionTime) + "\n";
    rightColumnText += __("(Longest Session|Sesión Más Larga): ") + this.formatSessionTime(stats.longestSession) + "\n";
    rightColumnText += __("(Current Streak|Racha Actual): ") + stats.currentStreak + " " + __("(days|días)") + "\n";
    rightColumnText += __("(Longest Streak|Racha Más Larga): ") + stats.longestStreak + " " + __("(days|días)") + "\n";
    rightColumnText += __("High Scores: ") + stats.highScoresSet + "\n";
    rightColumnText += __("(Characters Created|Personajes Creados): ") + (stats.charactersCreated || 0) + "\n";
    rightColumnText += __("(Max Character Level|Nivel Máx de Personaje): ") + (stats.maxCharacterLevel || 0) + "\n";
    rightColumnText += __("(Skills Unlocked|Habilidades Desbloqueadas): ") + (stats.skillsUnlocked || 0) + "\n";
    
    this.leftColumn.write(leftColumnText);
    this.rightColumn.write(rightColumnText);
  }

  /**
   * Returns to the main menu when any key or mouse button is pressed.
   */
  update() {
    gamepad.update();
    
    if (gamepad.pressed.any || mouse.pressed.any) {
      game.state.start("MainMenu");
    }
  }
  
  /**
   * Stops the statistics refresh timer when leaving the state.
   */
  shutdown() {
    if (this.updateTimer) {
      game.time.events.remove(this.updateTimer);
    }
  }
}