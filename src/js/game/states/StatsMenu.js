class StatsMenu {
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    new BackgroundGradient();
    
    this.titleText = new Text(120, 10, __("PLAYER STATISTICS||ESTADÍSTICAS DE JUGADOR"));
    this.titleText.anchor.x = 0.5;
    
    this.leftColumn = new Text(4, 70, "");
    this.leftColumn.anchor.y = 0.5;
    
    this.rightColumn = new Text(120, 70, "");
    this.rightColumn.anchor.y = 0.5;
    
    this.instructionText = new Text(120, 120, __("PRESS ANY KEY TO LEAVE||PRESIONA CUALQUIER TECLA PARA SALIR"));
    this.instructionText.anchor.x = 0.5;
    
    this.updateStatsText();
    
    this.updateTimer = game.time.events.loop(100, this.updateStatsText, this);
    
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

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

  update() {
    gamepad.update();
    
    if (gamepad.pressed.any || mouse.pressed.any) {
      game.state.start("MainMenu");
    }
  }
  
  shutdown() {
    if (this.updateTimer) {
      game.time.events.remove(this.updateTimer);
    }
  }
}